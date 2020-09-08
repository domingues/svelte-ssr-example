import fs from 'fs';
import path from 'path';
import urljoin from 'url-join';
import polka from 'polka';
import sirv from 'sirv';
import compression from 'compression';
import bodyParser from 'body-parser';

function parseBundleTree(file, public_static_path) {
    const bundle_tree = JSON.parse(fs.readFileSync(path.join(__dirname, file)));

    const dfs_cache = {};

    function dfs(file) {
        const file_public_path = urljoin(public_static_path, file);
        if (!dfs_cache[file_public_path]) {
            const css = [], js = [];
            if (bundle_tree[file].imports) {
                for (const f of bundle_tree[file].imports) {
                    const f_public_path = urljoin(public_static_path, f);
                    if (!bundle_tree[f].isAsset) {
                        const { css: c, js: j } = dfs(f);
                        css.push(...c);
                        js.push(...j);
                        js.push(f_public_path);
                    } else if (bundle_tree[f].isAsset && f.endsWith('.css')) {
                        css.push(f_public_path);
                    }
                }
            }
            dfs_cache[file_public_path] = { css, js };
        }
        return dfs_cache[file_public_path];
    }

    const clientImports = {};
    const serverClientMap = {};
    for (const file in bundle_tree) {
        if (bundle_tree[file].isEntry !== true) continue;
        const { css, js } = dfs(file);
        const file_public_path = urljoin(public_static_path, file);
        clientImports[file_public_path] = { css: [...new Set(css)], js: [...new Set(js)] };
        serverClientMap[bundle_tree[file].chunkName] = file_public_path;
    }

    return { clientImports, serverClientMap };
}

function render(component_path, props_json, head, html) {
    // the "<script> </script>" (with space) is to prevent a chrome bug https://stackoverflow.com/a/42969257
    return `<!doctype html>
<html>
<head>
	<meta charset='utf8'>
	<meta name='viewport' content='width=device-width, initial-scale=1'>
	${head}
</head>
<body>
	<div id='content'>${html}</div>
	<script type='module'>
		import App from '${component_path}';
		new App({
			target: document.getElementById('content'),
			hydrate: true,
			props: ${props_json}
		});
	</script>
	<script> </script>
</body>
</html>`;
}

function buildPage(component, props_json, clientImports, serverClientMap) {
    let Component, props, head, html;
    try {
        Component = require(path.join(__dirname, 'server', component));
    } catch (err) {
        return { error: `importing module "${component}"`, code: err };
    }
    try {
        props = JSON.parse(props_json);
    } catch (err) {
        return { error: 'parsing props JSON', code: err };
    }
    try {
        const component = Component.render(props);
        head = component.head;
        html = component.html;
    } catch (err) {
        return { error: 'rendering module', code: err };
    }

    const component_path = serverClientMap[component];
    clientImports[component_path].css.forEach(f =>
        head += `\n\t<link rel='stylesheet' href='${f}'>`);
    clientImports[component_path].js.forEach(f =>
        head += `\n\t<script type='module' src='${f}'></script>`);
    head += `\n\t<script type='module' src='${component_path}'></script>`;
    const page = render(component_path, props_json, head, html);

    return { page };
}

const HOST = process.env.NODE_HOST || 'localhost';
const PORT = process.env.NODE_PORT || 3000;
const PUBLIC_STATIC_PATH = 'STATIC_PATH';
const DEV = 'DEV_SERVER' === 'true';

const { clientImports, serverClientMap } = parseBundleTree('client-tree.json', PUBLIC_STATIC_PATH);

const server = polka();
if (DEV) {
    server.use(compression({ threshold: 0 }));
    let p = PUBLIC_STATIC_PATH.replace(/^(^\w+:|^)\/\/[\w.:]+/, '').replace(/[/]*$/, '');
    server.use(p, sirv(path.join(__dirname, 'client'), {
        setHeaders: res => {
            res.setHeader('Access-Control-Allow-Origin', '*');
        },
        maxAge: 31536000,
        immutable: true
    }));
}
const respond = (req, res) => {
    let code, html;
    try {
        const props = req.method === 'GET' ? (req.query.props ? req.query.props : '{}') : (req.body ? req.body : '{}');
        const result = buildPage(req.params['*'] ? req.params['*'] : 'index', props, clientImports, serverClientMap);
        if (result.error) {
            code = 500;
            html = `<!DOCTYPE html><html lang="en"><body>Error ${result.error}:<br/><pre>${result.code}</pre></body></html>`;
        } else {
            code = 200;
            html = result.page;
        }
    } catch (err) {
        console.error(err); // eslint-disable-line
        code = 500;
        html = `<!DOCTYPE html><html lang="en"><body>Unknown error:<br/><pre>${err}</pre></body></html>`;
    }
    res.writeHead(code, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': html.length,
    });
    res.end(html);
};
server.use(bodyParser.text({ type: '*/json' }));
server.get('/*', respond)
    .post('/*', respond)
    .listen(PORT, HOST, err => {
        if (err) throw err;
        console.log(`Running on http://${HOST}:${PORT}`); // eslint-disable-line
    });
