import fs from 'fs';
import path from 'path';
import polka from 'polka';
import sirv from 'sirv';

const compression = require('compression');

function parseBundleTree(file) {
    const bundle_tree = JSON.parse(fs.readFileSync(path.join(__dirname, file)));

    const dfs_cache = {};

    function dfs(file) {
        if (!dfs_cache[file]) {
            const css = [], js = [];
            if (bundle_tree[file].imports) {
                for (const f of bundle_tree[file].imports) {
                    if (!bundle_tree[f].isAsset) {
                        const { css: c, js: j } = dfs(f);
                        css.push(...c);
                        js.push(...j);
                        js.push(f);
                    } else if (bundle_tree[f].isAsset && f.endsWith('.css')) {
                        css.push(f);
                    }
                }
            }
            dfs_cache[file] = { css, js };
        }
        return dfs_cache[file];
    }

    const clientImports = {};
    const serverClientMap = {};
    for (const file in bundle_tree) {
        if (bundle_tree[file].isEntry !== true) continue;
        const { css, js } = dfs(file);
        clientImports[file] = { css: [...new Set(css)], js: [...new Set(js)] };
        serverClientMap[path.basename(file).split('.')[0]] = file;
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
	<script id='anchor' type='module'>
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

function buildPage(component, props_json, { clientImports, serverClientMap }, public_static_path) {
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

    const component_file = serverClientMap[component];
    const component_path = `${path.join(public_static_path, component_file)}`;
    clientImports[component_file].css.forEach(f =>
        head += `\n\t<link rel='stylesheet' href='${path.join(public_static_path, f)}'>`);
    clientImports[component_file].js.forEach(f =>
        head += `\n\t<script type='module' src='${path.join(public_static_path, f)}'></script>`);
    head += `\n\t<script type='module' src='${component_path}'></script>`;
    const page = render(component_path, props_json, head, html);

    return { page };
}

const { clientImports, serverClientMap } = parseBundleTree('client-tree.json');

const HOST = process.env.NODE_HOST || '0.0.0.0';
const PORT = process.env.NODE_PORT || 3000;

const server = polka();
if (DEV_SERVER) {// eslint-disable-line
    server.use(compression({ threshold: 0 }));
    server.use('STATIC_PATH', sirv(path.join(__dirname, 'client'), {
        maxAge: 31536000,
        immutable: true
    }));
}
server.get('/*', (req, res) => {
    try {
        const result = buildPage(req.params['*'] ? req.params['*'] : 'index',
            req.query.props ? req.query.props : '{}',
            { clientImports, serverClientMap }, 'STATIC_PATH');
        if (result.error) {
            res.statusCode = 500;
            res.end(`Error ${result.error}:\n${result.code}.`);
        } else {
            const html = result.page;
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': html.length,
            });
            res.end(html);
        }
    } catch (err) {
        console.error(err); // eslint-disable-line
        res.statusCode = 500;
        res.end(`Unknown error:\n${err}.`);
    }
})
    .listen(PORT, HOST, err => {
        if (err) throw err;
        console.log(`Running on http://${HOST}:${PORT}`); // eslint-disable-line
    });
