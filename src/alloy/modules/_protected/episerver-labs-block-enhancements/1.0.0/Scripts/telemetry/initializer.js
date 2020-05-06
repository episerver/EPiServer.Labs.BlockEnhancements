define([
    "episerver-labs-block-enhancements/telemetry/patch-cms-commands"
], function (patchCmsCommands) {
    return function () {
        patchCmsCommands();
    }
});
