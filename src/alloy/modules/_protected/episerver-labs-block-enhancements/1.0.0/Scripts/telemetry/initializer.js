define([
    "episerver-telemetry-ui/tracker-factory",
    "episerver-labs-block-enhancements/telemetry/patch-cms-commands"
], function (
    trackerFactory,
    patchCmsCommands
) {
    return function (options) {
        patchCmsCommands();

        var tracker = trackerFactory.getTracker("cms");
        tracker.track("featureOptions", options);
    };
});
