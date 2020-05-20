define([
    "episerver-labs-block-enhancements/telemetry/tracker",
    "episerver-labs-block-enhancements/telemetry/patch-cms-commands"
], function (
    tracker,
    patchCmsCommands
) {
    return function (options) {
        patchCmsCommands();

        tracker.track("featureOptions", options);
    };
});
