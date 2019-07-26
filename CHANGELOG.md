# svelte-ssr-example changelog

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
 - Don't compress nor serve static files in production;
 - Set cache control for static files;
 - Add content type and length of html pages;
