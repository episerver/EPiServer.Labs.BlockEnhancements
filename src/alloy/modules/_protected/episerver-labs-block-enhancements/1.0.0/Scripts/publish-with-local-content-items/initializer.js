define([
    "epi/dependency",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/shell/store/Throttle",
    "episerver-labs-block-enhancements/publish-with-local-content-items/command-provider"
], function (
    dependency,
    routes,
    JsonRest,
    Throttle,
    CommandProvider
) {
    return function () {
        var registry = dependency.resolve("epi.storeregistry");
        registry.add("episerver.labs.blockenhancements",
            new Throttle(
                new JsonRest({
                    target: routes.getRestPath({ moduleArea: "episerver-labs-block-enhancements", storeName: "episerverlabsblockenhancements" }),
                })
            )
        );

        var commandregistry = dependency.resolve("epi.globalcommandregistry");
        commandregistry.registerProvider("epi.cms.publishmenu", new CommandProvider());
    }
});
