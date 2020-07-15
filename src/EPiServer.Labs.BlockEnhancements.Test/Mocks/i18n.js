define([], function () {

    // regexp for reconstructing the master bundle name from parts of the regexp match
    // nlsRe.exec("foo/bar/baz/nls/en-ca/foo") gives:
    // ["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
    // nlsRe.exec("foo/bar/baz/nls/foo") gives:
    // ["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
    // so, if match[5] is blank, it means this is the top bundle definition.
    // courtesy of http://requirejs.org
    var nlsRe = /(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/;

    var map = {
        "episerver.shared": {
            action: {
                ok: ""
            }
        },
        "episerver.cms.tinymce": {
            notabletocreatelinkforpage: "",
            settingstransformerror: "${transformName}-${propertyName}"
        },
        "episerver.cms.form.emailvalidation": {
            invalidmessage: ""
        },
        "episerver.cms.contentediting.toolbar.buttons": {
            publish: { },
            sendforreview: {}
        },
        "episerverlabs.blockenhancements": {
            command: { },
			dialog: {}
        },
        "episerverlabs.blockenhancements.inlinecommands.inlinepublish": {
        },
        "episerver.cms.components.project.command.publishproject": {
            label: ""
        },
    };

    return {
        // summary:
        //      This module implements an amd plug-in used for loading localizations from the episerver localization service
        // description:
        //      This module loads localization resources based on dot (.) separated keys corresponding to resource keys
        //      in the EPiServer LocalizationService implementation.
        //      This module handles client side caching of resources and resource structures. To minimize server
        //      side requests, you should always query for the top-most resource path first. Then all subsequesnt
        //      queries to more specific keys will be returned from client-side cache.
        // tags:
        //      public

        load: function (/*String*/id, /*function*/require, /*function*/load) {
            // summary:
            //      Loads the resource structure identified by the id
            // id:
            //      Localization resource identifier
            // require:
            //      reference to the AMD loader
            // load:
            //      The callback executed when the resource is ready

            id = id.toLowerCase();

            var match = nlsRe.exec(id),
                bundleName = match[5] || match[4];

            load(map[bundleName]);
        }
    };
});
