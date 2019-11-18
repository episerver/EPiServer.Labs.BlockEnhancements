define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-publish",
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-command-mixin"
], function (
    declare,
    InlinePublish,
    _InlineCommandMixin
) {
    return declare([InlinePublish, _InlineCommandMixin]);
});
