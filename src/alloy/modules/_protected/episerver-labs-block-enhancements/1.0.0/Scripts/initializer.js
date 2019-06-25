define([
    "dojo/_base/declare",
    "epi/_Module",
    "episerver-labs-block-enhancements/publish-with-local-content-items/initializer"
], function (
    declare,
    _Module,
    publishWithLocalContentItemsInitializer
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);

            publishWithLocalContentItemsInitializer();
        }
    });
});
