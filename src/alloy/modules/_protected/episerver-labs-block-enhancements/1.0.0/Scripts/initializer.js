define([
    "dojo/_base/declare",
    "epi/_Module",
    "episerver-labs-block-enhancements/store-initializer",
    "episerver-labs-block-enhancements/status-indicator/initializer",
    "episerver-labs-block-enhancements/publish-with-local-content-items/initializer",
    "episerver-labs-block-enhancements/inline-editing/initializer",
    "episerver-labs-block-enhancements/inline-publish/initializer"
], function (
    declare,
    _Module,
    storeInitializer,
    statusIndicatorInitializer,
    publishWithLocalContentItemsInitializer,
    inlineEditingInitializer,
    inlinePublishInitializer
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);
            storeInitializer();
            statusIndicatorInitializer();
            publishWithLocalContentItemsInitializer();
            inlineEditingInitializer();
            inlinePublishInitializer();
        }
    });
});
