define([
    "epi/dependency",
    "episerver-labs-block-enhancements/tracker",
    "episerver-labs-block-enhancements/telemetry/patch-cms-commands",
    "episerver-labs-block-enhancements/telemetry/get-custom-properties",
], function (dependency, tracker, patchCmsCommands, getCustomProperties) {
    return function (options) {
        dependency.resolve("epi.storeregistry")
            .get("episerver.labs.blockenhancements.telemetry")
            .get().then(function (telemetry) {
                // Prevent errors when initializing tracker without the instrumentationKey
                if (telemetry.configuration && telemetry.configuration.instrumentationKey) {
                    tracker.initialize(telemetry.configuration, getCustomProperties(telemetry), telemetry.user, telemetry.client);
                    tracker.track("feature-options", options);
                }
            });

        patchCmsCommands();
    }
});
