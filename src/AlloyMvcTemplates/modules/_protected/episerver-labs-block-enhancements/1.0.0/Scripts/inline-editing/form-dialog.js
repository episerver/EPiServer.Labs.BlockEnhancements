define([
    "dojo/_base/declare",
    "epi/shell/widget/dialog/Dialog",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.ilineediting.dialog",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
], function (
    declare,
    Dialog,
    res,
    coreResources
) {
    return declare([Dialog], {
        // summary:
        //      Dialog used to display inline edit form

        postMixInProperties: function () {
            this.inherited(arguments);

            this.dialogClass = "epi-dialog-portrait inline-edit-dialog";

            var containerNode = document.createElement("div");
            this.content = containerNode;
            this.contentClass = "epi-wrapped epi-mediaSelector";
        },

        getActions: function () {
            var actions = this.inherited(arguments);

            var okButton = actions[0];
            okButton.label = res.save;

            this._publishButtonName = "publish";
            var cancelButton = {
                name: this._publishButtonName,
                label: coreResources.publish.label,
                title: null,
                settings: {
                    "class": "epi-success publish-button"
                },
                action: function () {
                    this.onPublish();
                }.bind(this)
            };
            actions.push(cancelButton);

            return actions;
        },

        hideSaveButton: function () {
            this.definitionConsumer.setItemProperty(this._okButtonName, "class", "dijitHidden");
        },

        toggleDisabledSaveButton: function (shouldDisable) {
            this.definitionConsumer.setItemProperty(this._okButtonName, "disabled", shouldDisable ? "disabled" : "");
        },

        togglePublishButton: function (visible) {
            if (visible) {
                this.definitionConsumer.setItemProperty(this._publishButtonName, "class", "epi-success publish-button");
            } else {
                this.definitionConsumer.setItemProperty(this._publishButtonName, "class", "dijitHidden");
            }
        },

        toggleDisabledPublishButton: function (shouldDisable) {
            this.definitionConsumer.setItemProperty(this._publishButtonName, "disabled", shouldDisable ? "disabled" : "");
        },

        _setCloseTextAttr: function (label) {
            this.definitionConsumer.setItemProperty(this._cancelButtonName, "label", label);
        },

        onPublish: function () {
        }
    });
});
