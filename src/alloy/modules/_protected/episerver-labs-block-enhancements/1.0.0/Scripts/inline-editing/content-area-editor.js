define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/browsable-content-area-mixin",
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "episerver-labs-block-enhancements/inline-editing/commands/update-commands"
], function (
    declare,
    browsableContentAreaMixin,
    ContentAreaEditor,
    updateCommands
) {
    return declare([ContentAreaEditor, browsableContentAreaMixin], {
        update: function (value) {
            this.set("value", value);
            if (this.parent) {
                this.parent.set("editing", true);
            }
            this.onChange(value);
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            updateCommands(this);
        }
    });
});
