define([
    "episerver-labs-block-enhancements/inline-editing/commands/contentarea-inline-publish",
    "epi-cms/contentediting/command/BlockInlineReadyToPublish"
], function (
    ContentAreaInlinePublish,
    InlineSendForReview
) {
    return function updateCommands(commandsOwner) {
        var removeCommand = commandsOwner.commands.filter(function (x) {
            return x.name === "remove";
        })[0];
        if (!removeCommand) {
            return;
        }
        var removeCommandIndex = commandsOwner.commands.indexOf(removeCommand);

        var inlinePublish = new ContentAreaInlinePublish();
        commandsOwner.commands.splice(removeCommandIndex, 0, inlinePublish);
        commandsOwner.own(inlinePublish);

        var inlineSendForReview = new InlineSendForReview();
        commandsOwner.commands.splice(removeCommandIndex, 0, inlineSendForReview);
        commandsOwner.own(inlineSendForReview);
    }
});
