define([
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "epi-cms/plugin-area/assets-pane",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-publish",
    "episerver-labs-block-enhancements/inline-publish/commands/block-menu-inline-publish"
], function (
    ContentAreaEditor,
    ContentAreaCommands,
    assetsPanePluginArea,
    InlinePublish,
    BlockMenuInlinePublish
) {
    function updateCommands() {
        // summary:
        //		Modified version of ContentAreaEditor postMixinProperties
        //      It add InliEdit command and change text for Edit command

        var removeCommand = this.commands.filter(function (x) {
            return x.name === "remove";
        })[0];
        if (!removeCommand) {
            return;
        }
        var removeCommandIndex = this.commands.indexOf(removeCommand);

        var inlinePublish = new InlinePublish();
        this.commands.splice(removeCommandIndex, 0, inlinePublish);
        this.own(inlinePublish);
    }

    function patchContentAreaEditor() {
        // summary:
        //		Modified version of ContentAreaEditor postMixinProperties
        //      It add InliEdit command and change text for Edit command

        var originalPostMixinProperties = ContentAreaEditor.prototype.postMixInProperties;
        ContentAreaEditor.prototype.postMixInProperties = function (doc) {
            originalPostMixinProperties.apply(this, arguments);
            updateCommands.apply(this, arguments);
        };
    }

    function patchContentAreaCommands() {
        // summary:
        //		Modified version of ContentAreaCommands postscript
        //      It add InliEdit command and change text for Edit command

        var originalPostscript = ContentAreaCommands.prototype.postscript;
        ContentAreaCommands.prototype.postscript = function (doc) {
            originalPostscript.apply(this, arguments);
            updateCommands.apply(this, arguments);
        };
    }

    return function inlineEditingInitialize() {
        patchContentAreaEditor();
        patchContentAreaCommands();

        assetsPanePluginArea.add(BlockMenuInlinePublish);
    };
});
