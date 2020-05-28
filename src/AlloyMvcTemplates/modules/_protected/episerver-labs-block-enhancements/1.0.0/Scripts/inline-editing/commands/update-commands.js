define([
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-edit"
], function (
    InlineEditCommand
) {
    return function updateCommands(commandsOwner, isInlineCreateEnabled) {
        var inlineEditCommand = new InlineEditCommand({isInlineCreateEnabled: isInlineCreateEnabled});
        commandsOwner.commands.splice(1, 0, inlineEditCommand);
        commandsOwner.own(inlineEditCommand);
    }
});
