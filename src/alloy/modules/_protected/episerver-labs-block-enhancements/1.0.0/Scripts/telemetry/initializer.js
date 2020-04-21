define([
    "episerver-labs-block-enhancements/telemetry/patch-cms-commands",
    "episerver-labs-block-enhancements/telemetry/track-edit-mode"
], function (patchCmsCommands, trackEditMode) {
    return function () {
        patchCmsCommands();
        trackEditMode();
    }
});
