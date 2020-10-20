define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/editors/browsable-content-area-mixin",
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "episerver-labs-block-enhancements/inline-publish/commands/update-commands"
], function (
    declare,
    browsableContentAreaMixin,
    ContentAreaEditor,
    updateInlinePublishCommands
) {
    return declare([ContentAreaEditor, browsableContentAreaMixin], {
        blockEnhancementsOptions: {},

        update: function (value) {
            this.set("value", value);
            if (this.parent) {
                this.parent.set("editing", true);
            }
            this.onChange(value);
        },
        postMixInProperties: function () {
            this.inherited(arguments);
            if (this.blockEnhancementsOptions.inlinePublish) {
                updateInlinePublishCommands(this);
            }
        }
    });
});
