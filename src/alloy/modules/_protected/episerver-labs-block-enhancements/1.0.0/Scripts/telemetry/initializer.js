define([
    "epi/dependency",
    "episerver-labs-block-enhancements/tracker",
    "episerver-labs-block-enhancements/telemetry/patch-cms-commands",
], function (dependency, tracker, patchCmsCommands) {
    return function () {
        dependency.resolve("epi.storeregistry")
            .get("episerver.labs.blockenhancements.telemetry")
            .get().then(function (telemetry) {
                tracker.initialize(telemetry.configuration, telemetry.versions, telemetry.user, telemetry.client);
                tracker.track("hello-world");
            });

        patchCmsCommands();
    }
});
