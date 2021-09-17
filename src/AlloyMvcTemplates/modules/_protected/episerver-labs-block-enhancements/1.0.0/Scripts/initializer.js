define([
    "dojo/_base/declare",
    "dojo/topic",
    "epi/_Module",
    "episerver-labs-block-enhancements/store-initializer",
    "episerver-labs-block-enhancements/status-indicator/initializer",
    "episerver-labs-block-enhancements/publish-page-with-blocks/initializer",
    "episerver-labs-block-enhancements/telemetry/initializer",
    "episerver-labs-block-enhancements/inline-editing/initializer",
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-translate",
    "epi-cms/contentediting/inline-editing/BlockEditFormContainer"
], function (
    declare,
    topic,
    _Module,
    storeInitializer,
    statusIndicatorInitializer,
    publishPageWithBlocksInitializer,
    telemetryInitializer,
    inlineEditingInitializer,
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
            if (options.publishPageWithBlocks) {
                publishPageWithBlocksInitializer();
            }

            if (options.inlineTranslate) {
                assetsPanePluginArea.add(InlineTranslate);
            }

            var trackingOptions = Object.assign({}, options);
            telemetryInitializer(trackingOptions);

            inlineEditingInitializer(options);
        }
    });
});
