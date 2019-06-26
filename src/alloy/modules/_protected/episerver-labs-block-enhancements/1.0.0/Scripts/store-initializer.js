define([
    "epi/dependency",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/shell/store/Throttle"
], function (
    dependency,
    routes,
    JsonRest,
    Throttle
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
    }
});
