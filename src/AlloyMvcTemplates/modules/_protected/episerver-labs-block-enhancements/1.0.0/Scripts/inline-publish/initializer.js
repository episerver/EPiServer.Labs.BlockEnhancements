define([
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-publish/commands/block-menu-inline-publish",
    "episerver-labs-block-enhancements/inline-publish/commands/block-menu-inline-send-for-review"
], function (
    assetsPanePluginArea,
    BlockMenuInlinePublish,
    BlockMenuInlineSendForReview
) {
    return function inlineEditingInitialize() {
        assetsPanePluginArea.add(BlockMenuInlinePublish);
        assetsPanePluginArea.add(BlockMenuInlineSendForReview);
    };
});
