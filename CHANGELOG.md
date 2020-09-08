# svelte-ssr-example changelog

## 1.4.0 (08/09/2020)
 - Upgrade `rollup-plugin-extract-bundle-tree` to allow entry javascript files with hash file name;

## 1.3.6 (07/09/2020)
 - Upgrade dependencies;
 - Fix README;

## 1.3.5 (21/05/2020)
 - Upgrade dependencies;

## 1.3.4 (11/09/2019)
 - Remove unknown HTML id from script tag;
 - Upgrade dependencies;

## 1.3.3 (12/08/2019)
 - Add browser live reload to dev server;
 - Upgrade dependencies;
 
## 1.3.2 (07/08/2019)
 - Add `pre` tag server to errors;

## 1.3.1 (06/08/2019)
 - Fix `DEV_SERVER` switch;
 - Change default `NODE_HOST` to `localhost`;

## 1.3.0 (02/08/2019)
 - Allow POST requests;
 - Set HTML content type charset to UTF 8;
 - Add HTML tags to error messages;
 - Enable cross-origin resource sharing for the static files in the development server;
 - Upgrade dependencies;

## 1.2.0 (26/07/2019)

### Build
 - Update NPM scripts;
 - Rename public dist folder to "client";
 - Remove old files from dist folder;
 - Move bundle tree to root dist folder;
 - Move HTTP server to root dist folder;
 - Set public static path with environment variable:
   - `$PUBLIC_STATIC_PATH`

### HTTP Server
 - Set host and port through environment variables:
   - `$NODE_HOST`
   - `$NODE_PORT`
 - Fix import order of CSS and JS dependencies;
 - Workaround for a strange [chrome bug](https://stackoverflow.com/a/42969257);
 - Better path join;
 - Don't compress responses nor serve static files in production;
 - Set cache control for static files;
 - Add content type and length of html pages;
