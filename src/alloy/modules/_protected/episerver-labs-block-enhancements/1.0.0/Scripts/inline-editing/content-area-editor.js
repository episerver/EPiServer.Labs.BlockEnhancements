define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/browsable-content-area-mixin",
    "epi-cms/contentediting/editors/ContentAreaEditor"
], function (
    declare,
    browsableContentAreaMixin,
    ContentAreaEditor
) {
    return declare([ContentAreaEditor, browsableContentAreaMixin], {
        update: function (value) {
            this.set("value", value);
            if (this.parent) {
                this.parent.set("editing", true);
            }
            this.onChange(value);
        }
    });
});
