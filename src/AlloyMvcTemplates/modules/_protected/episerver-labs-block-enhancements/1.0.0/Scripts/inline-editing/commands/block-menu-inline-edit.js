define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-edit",
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-command-mixin"
], function (
    declare,
    InlineEdit,
    _InlineCommandMixin
) {
    return declare([InlineEdit, _InlineCommandMixin]);
});
