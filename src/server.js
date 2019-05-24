'use strict';

const fs = require('fs');
const path = require('path');
const polka = require('polka');
const sirv = require('sirv');
const compression = require('compression');

function parseBundleTree(file) {
    const bundle_tree = JSON.parse(fs.readFileSync(path.join(__dirname, file)));

    const filterCSS = i => bundle_tree[i].isAsset && i.endsWith('.css');
    const filterJS = i => !bundle_tree[i].isAsset;

    const imports = {};
    for (const f in bundle_tree) {
        imports[f] = {
            css: [...(bundle_tree[f].imports && bundle_tree[f].imports.filter(filterCSS) || [])],
            js: [...(bundle_tree[f].imports && bundle_tree[f].imports.filter(filterJS) || [])]
        };
        for (const f_i of imports[f].js) {
            imports[f].css.push(...(bundle_tree[f_i].imports && bundle_tree[f_i].imports.filter(filterCSS) || []));
            imports[f].js.push(...(bundle_tree[f_i].imports && bundle_tree[f_i].imports.filter(filterJS) || []));
        }
        imports[f].css = [...new Set(imports[f].css)];
        imports[f].js = [...new Set(imports[f].js)];
    }

    const map = {};
    for (const f in imports) {
        if (bundle_tree[f].isEntry !== true) {
            delete imports[f];
        } else {
            map[path.basename(f).split('.')[0]] = f;
        }
    }
    return { clientImports: imports, serverClientMap: map };
}

function render(component_path, props_json, head, html) {
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
</body>
</html>`;
}

function buildPage(component, props_json, { clientImports, serverClientMap }, public_static_path) {
    let Component, props, head, html;
    try {
        Component = require(`./${component}`);
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
    const component_path = `${public_static_path}/${component_file}`;
    clientImports[component_file].css.forEach(f =>
        head += `\n\t<link rel='stylesheet' href='${public_static_path}/${f}'>`);
    head += `\n\t<script type='module' src='${component_path}'></script>`;
    clientImports[component_file].js.forEach(f =>
        head += `\n\t<script type='module' src='${public_static_path}/${f}'></script>`);
    const page = render(component_path, props_json, head, html);

    return { page };
}

const { clientImports, serverClientMap } = parseBundleTree('client-tree.json');

polka()
    .use(compression())
    .use('/static', sirv(path.join(__dirname, '../public')))
    .get('/*', (req, res) => {
        try {
            const result = buildPage(req.params['*'] ? req.params['*'] : 'index',
                req.query.props ? req.query.props : '{}',
                { clientImports, serverClientMap }, '/static');
            if (result.error) {
                res.statusCode = 500;
                res.end(`Error ${result.error}:\n${result.code}.`);
            } else {
                res.end(result.page);
            }
        } catch (err) {
			console.error(err); // eslint-disable-line
            res.statusCode = 500;
            res.end(`Unknown error:\n${err}.`);
        }
    })
    .listen(3000, err => {
        if (err) throw err;
		console.log('> Running on localhost:3000'); // eslint-disable-line
    });
