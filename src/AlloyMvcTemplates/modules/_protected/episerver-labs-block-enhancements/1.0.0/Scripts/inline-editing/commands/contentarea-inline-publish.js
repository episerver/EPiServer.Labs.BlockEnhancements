define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-publish",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
], function (
    declare,
    InlinePublish,
    resources
) {

    return declare([InlinePublish], {
        commandType: "content-area",

        _setCommandVisibility: function (visible) {
            this.set("isAvailable", true);
            this.set("canExecute", visible);
            this.set("label", resources.publishchanges.label);
        }
    });
});
