define([
    "dojo/_base/declare",
    "epi-cms/contentediting/command/BlockInlinePublish"
], function (
    declare,
    BlockInlinePublish
) {
    return declare([BlockInlinePublish], {
        commandType: "assets-pane",

        _onModelChange: function () {
            if (this.model instanceof Array) {
                //this command should be available only if one item selected
                if (this.model.length === 1) {
                    this.model = this.model[0];
                } else {
                    this.model = null;
                }
            }

            if (!this.model) {
                this.set("canExecute", false);
                return;
            }

            this.inherited(arguments);
        },

        _setCommandVisibility: function (visibility) {
            this.set("isAvailable", visibility);
            this.set("canExecute", visibility);
        }
    });
});
