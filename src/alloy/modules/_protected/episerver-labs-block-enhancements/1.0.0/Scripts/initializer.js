define([
    "dojo/_base/declare",
    "epi/_Module",
    "episerver-labs-block-enhancements/store-initializer",
    "episerver-labs-block-enhancements/status-indicator/initializer",
    "episerver-labs-block-enhancements/publish-with-local-content-items/initializer"
], function (
    declare,
    _Module,
    storeInitializer,
    publishWithLocalContentItemsInitializer
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);
            storeInitializer();
            statusIndicatorInitializer();
            publishWithLocalContentItemsInitializer();
        }
    });
});
