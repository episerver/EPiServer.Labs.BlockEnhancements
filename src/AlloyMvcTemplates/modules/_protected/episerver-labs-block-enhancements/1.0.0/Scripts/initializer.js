define([
    "dojo/_base/declare",
    "epi/_Module",
    "episerver-labs-block-enhancements/store-initializer",
    "episerver-labs-block-enhancements/status-indicator/initializer",
    "episerver-labs-block-enhancements/publish-with-local-content-items/initializer",
    "episerver-labs-block-enhancements/inline-publish/initializer",
    "episerver-labs-block-enhancements/content-draft-view/initializer",
    "episerver-labs-block-enhancements/telemetry/initializer"
], function (
    declare,
    _Module,
    storeInitializer,
    statusIndicatorInitializer,
    publishWithLocalContentItemsInitializer,
    inlinePublishInitializer,
    contentDraftViewInitializer,
    telemetryInitializer
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);
            storeInitializer();
            var options = this._settings.options;
            if (options.statusIndicator) {
                statusIndicatorInitializer();
            }
            if (options.publishWithLocalContentItems) {
                publishWithLocalContentItemsInitializer();
            }
            if (options.inlinePublish) {
                inlinePublishInitializer();
            }
            if (options.contentDraftView) {
                contentDraftViewInitializer();
            }

            telemetryInitializer(options);
        }
    });
});
