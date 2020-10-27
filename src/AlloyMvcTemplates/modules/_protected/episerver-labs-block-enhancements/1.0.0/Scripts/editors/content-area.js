define([
    "dojo/_base/declare",
    "epi-cms/widget/overlay/ContentArea",
    "epi-cms/widget/overlay/Block",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "episerver-labs-block-enhancements/editors/browsable-content-area-mixin",
    "episerver-labs-block-enhancements/inline-publish/commands/update-commands",
    "episerver-labs-block-enhancements/inline-editing/commands/update-translate-command"
], function (
    declare,
    ContentArea,
    Block,
    ContentAreaCommands,
    browsableContentAreaMixin,
    updateInlinePublishCommands,
    updateInlineTranslateCommands
) {
    var CustomBlockClass = declare([Block], {
        blockEnhancementsOptions: {},

        postCreate: function () {
            this.commandProvider = new ContentAreaCommands({model: this.viewModel});
            if (this.blockEnhancementsOptions.inlinePublish) {
                updateInlinePublishCommands(this.commandProvider);
            }

            if (this.blockEnhancementsOptions.inlineCreate) {
                updateInlineTranslateCommands(this.commandProvider);
            }
            
            this.inherited(arguments);
        }
    });
    return declare([ContentArea, browsableContentAreaMixin], {
        blockEnhancementsOptions: {},
        blockClass: CustomBlockClass,

        postCreate: function () {
            CustomBlockClass.prototype.blockEnhancementsOptions = this.blockEnhancementsOptions;
            this.inherited(arguments);
        },

        update: function (value) {
            this.onValueChange({
                propertyName: this.name,
                value: value
            });
        }
    });
});
