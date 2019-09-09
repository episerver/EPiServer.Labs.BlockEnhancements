define([
    "dojo/_base/declare",
    "epi-cms/widget/overlay/ContentArea",
    "epi-cms/widget/overlay/Block",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "episerver-labs-block-enhancements/inline-editing/browsable-content-area-mixin",
    "episerver-labs-block-enhancements/inline-editing/commands/update-commands"
], function (
    declare,
    ContentArea,
    Block,
    ContentAreaCommands,
    browsableContentAreaMixin,
    updateCommands
) {
    var CustomBlockClass = declare([Block], {
        postCreate: function () {
            this.commandProvider = new ContentAreaCommands({ model: this.viewModel });
            updateCommands(this.commandProvider);
            this.inherited(arguments);
        }
    });
    return declare([ContentArea, browsableContentAreaMixin], {
        blockClass: CustomBlockClass,

        update: function (value) {
            this.onValueChange({
                propertyName: this.name,
                value: value
            });
        }
    });
});
