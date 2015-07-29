/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
    var app = new EmberApp(defaults, {
        jscsOptions: {
            enabled: true,
            esnext: true
        }
    });

    /*
        This build file specifes the options for the dummy test app of this
        addon, located in `/tests/dummy`
        This build file does *not* influence how the addon or the app using it
        behave. You most likely want to be modifying `./index.js` or app's build file
    */

    app.import(app.bowerDirectory + "/bootstrap/dist/css/bootstrap.min.css");
    app.import(app.bowerDirectory + "/github-fork-ribbon-css/gh-fork-ribbon.css");
    app.import(app.bowerDirectory + "/bootstrap/dist/js/bootstrap.min.js");

    return app.toTree();
};
