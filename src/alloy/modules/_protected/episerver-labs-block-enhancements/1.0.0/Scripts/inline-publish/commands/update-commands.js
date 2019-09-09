define([
    "episerver-labs-block-enhancements/inline-editing/commands/inline-publish"
], function (
    InlinePublish
) {
    return function updateCommands(commandsOwner) {
        var removeCommand = commandsOwner.commands.filter(function (x) {
            return x.name === "remove";
        })[0];
        if (!removeCommand) {
            return;
        }
        var removeCommandIndex = commandsOwner.commands.indexOf(removeCommand);

        var inlinePublish = new InlinePublish();
        commandsOwner.commands.splice(removeCommandIndex, 0, inlinePublish);
        commandsOwner.own(inlinePublish);
    }
});
