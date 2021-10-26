define([
    "epi/dependency",
    "episerver-labs-block-enhancements/publish-page-with-blocks/command-provider"
], function (
    dependency,
    CommandProvider
) {
    return function () {
        var commandregistry = dependency.resolve("epi.globalcommandregistry");
        commandregistry.registerProvider("epi.cms.publishmenu", new CommandProvider());
    }
});
