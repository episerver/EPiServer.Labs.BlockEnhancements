define([
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-publish/commands/block-menu-inline-publish"
], function (
    assetsPanePluginArea,
    BlockMenuInlinePublish
) {
    return function inlineEditingInitialize() {
        assetsPanePluginArea.add(BlockMenuInlinePublish);
    };
});
