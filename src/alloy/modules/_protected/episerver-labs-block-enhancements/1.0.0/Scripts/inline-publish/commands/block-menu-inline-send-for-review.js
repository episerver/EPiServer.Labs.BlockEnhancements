define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-send-for-review",
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-command-mixin"
], function (
    declare,
    InlineSendForReview,
    _InlineCommandMixin
) {
    return declare([InlineSendForReview, _InlineCommandMixin]);
});

