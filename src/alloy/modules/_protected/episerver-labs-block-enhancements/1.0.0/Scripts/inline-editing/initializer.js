define([
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-edit",
    "episerver-labs-block-enhancements/inline-editing/commands/custom-block-edit",
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-edit"
], function (
    ContentAreaEditor,
    ContentAreaCommands,
    assetsPanePluginArea,
    InlineEditCommand,
    CustomBlockEditCommand,
    BlockMenuInlineEditCommand
) {
    function updateCommands() {
        var customBlockEditCommand = new CustomBlockEditCommand();
        this.commands[0] = customBlockEditCommand;
        this.own(customBlockEditCommand);

        var inilineEdit = new InlineEditCommand();
        this.commands.splice(1, 0, inilineEdit);
        this.own(inilineEdit);
    }

    function patchContentAreaEditor() {
        var originalPostMixinProperties = ContentAreaEditor.prototype.postMixInProperties;
        ContentAreaEditor.prototype.postMixInProperties = function (doc) {
            originalPostMixinProperties.apply(this, arguments);
            updateCommands.apply(this, arguments);
        };
    }

    function patchContentAreaCommands() {
        var originalPostscript = ContentAreaCommands.prototype.postscript;
        ContentAreaCommands.prototype.postscript = function (doc) {
            originalPostscript.apply(this, arguments);
            updateCommands.apply(this, arguments);
        };
    }

    return function inlineEditingInitialize() {
        patchContentAreaEditor();
        patchContentAreaCommands();

        assetsPanePluginArea.add(BlockMenuInlineEditCommand);
    };
});
