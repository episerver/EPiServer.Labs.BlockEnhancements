define([
    "episerver-labs-block-enhancements/inline-editing/commands/inline-translate"
], function (
    InlineTranslate
) {
    return function updateCommands(commandsOwner) {
        var inlineTranslateCommand = new InlineTranslate();
        commandsOwner.commands.splice(1, 0, inlineTranslateCommand);
        commandsOwner.own(inlineTranslateCommand);
    }
});
