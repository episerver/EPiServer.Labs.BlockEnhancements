define([
    "dojo/_base/declare",
    "epi-cms/widget/overlay/ContentArea",
    "epi-cms/widget/overlay/Block",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "episerver-labs-block-enhancements/editors/browsable-content-area-mixin",
    "episerver-labs-block-enhancements/inline-editing/commands/update-commands",
    "episerver-labs-block-enhancements/inline-publish/commands/update-commands"
], function (
    declare,
    ContentArea,
    Block,
    ContentAreaCommands,
    browsableContentAreaMixin,
    updateInlineEditCommands,
    updateInlinePublishCommands
) {
    var CustomBlockClass = declare([Block], {
        blockEnhancementsOptions: {},

        postCreate: function () {
            this.commandProvider = new ContentAreaCommands({model: this.viewModel});
            if (this.blockEnhancementsOptions.inlinePublish) {
                updateInlinePublishCommands(this.commandProvider);
            }
            if (this.blockEnhancementsOptions.inlineEditing) {
                updateInlineEditCommands(this.commandProvider, this.blockEnhancementsOptions.inlineCreate);
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
