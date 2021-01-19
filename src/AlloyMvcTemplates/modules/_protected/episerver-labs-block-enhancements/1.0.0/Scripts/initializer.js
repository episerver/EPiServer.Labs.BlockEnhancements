define([
    "dojo/_base/declare",
    "dojo/topic",
    "epi/_Module",
    "episerver-labs-block-enhancements/store-initializer",
    "episerver-labs-block-enhancements/status-indicator/initializer",
    "episerver-labs-block-enhancements/publish-with-local-content-items/initializer",
    "episerver-labs-block-enhancements/inline-publish/initializer",
    "episerver-labs-block-enhancements/content-draft-view/initializer",
    "episerver-labs-block-enhancements/telemetry/initializer",
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-translate",
    "epi-cms/contentediting/inline-editing/BlockEditFormContainer"
], function (
    declare,
    topic,
    _Module,
    storeInitializer,
    statusIndicatorInitializer,
    publishWithLocalContentItemsInitializer,
    inlinePublishInitializer,
    contentDraftViewInitializer,
    telemetryInitializer,
    assetsPanePluginArea,
    InlineTranslate,
    BlockEditFormContainer
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);
            storeInitializer();

            var originSaveForm = BlockEditFormContainer.prototype.saveForm;
            BlockEditFormContainer.prototype.saveForm = function () {
                var initialValue = this.initialValue;
                // publish the topic "/refresh/ui" when model.save() was successful
                return originSaveForm.apply(this, arguments).then(function (originalReturn) {
                    if(this.value !== initialValue) { /*model.save() was successful because the value was updated*/
                        topic.publish("/refresh/ui");
                    }
                    return originalReturn;
                }.bind(this));
            }

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

            if (options.inlineTranslate) {
                assetsPanePluginArea.add(InlineTranslate);
            }
            
            var trackingOptions = Object.assign({}, options);
            delete trackingOptions.inlineCreate;
            delete trackingOptions.inlineEditing;
            telemetryInitializer(trackingOptions);
        }
    });
});
