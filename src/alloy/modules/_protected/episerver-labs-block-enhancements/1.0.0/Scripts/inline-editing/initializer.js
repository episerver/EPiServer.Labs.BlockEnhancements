define([
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-edit"
], function (
    assetsPanePluginArea,
    BlockMenuInlineEditCommand
) {
    return function inlineEditingInitialize() {
        assetsPanePluginArea.add(BlockMenuInlineEditCommand);
    };
});
