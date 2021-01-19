define([
    "dojo/_base/declare",
    "epi-cms/contentediting/command/BlockInlinePublish",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
], function (
    declare,
    BlockInlinePublish,
    resources
) {

    return declare([BlockInlinePublish], {
        commandType: "content-area",

        _setCommandVisibility: function (visible) {
            this.set("isAvailable", true);
            this.set("canExecute", visible);
            this.set("label", resources.publishchanges.label);
        }
    });
});
