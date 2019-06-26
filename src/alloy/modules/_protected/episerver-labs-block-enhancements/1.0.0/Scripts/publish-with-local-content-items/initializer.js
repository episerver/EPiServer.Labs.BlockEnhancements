define([
    "epi/dependency",
    "episerver-labs-block-enhancements/publish-with-local-content-items/command-provider"
], function (
    dependency,
    CommandProvider
) {
    return function () {
        var commandregistry = dependency.resolve("epi.globalcommandregistry");
        commandregistry.registerProvider("epi.cms.publishmenu", new CommandProvider());
    }
});
