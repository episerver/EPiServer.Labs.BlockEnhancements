define([
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-edit",
    "episerver-labs-block-enhancements/inline-editing/commands/custom-block-edit"
], function (
    InlineEditCommand,
    CustomBlockEditCommand
) {
    return function updateCommands(commandsOwner) {
        var customBlockEditCommand = new CustomBlockEditCommand();
        commandsOwner.commands[0] = customBlockEditCommand;
        commandsOwner.own(customBlockEditCommand);

        var inlineEditCommand = new InlineEditCommand();
        commandsOwner.commands.splice(1, 0, inlineEditCommand);
        commandsOwner.own(inlineEditCommand);
    }
});
