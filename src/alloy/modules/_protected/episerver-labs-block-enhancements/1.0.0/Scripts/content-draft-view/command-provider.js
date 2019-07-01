define([
    "dojo/_base/declare",
    "dijit/form/ToggleButton",
    "epi-cms/component/command/_GlobalToolbarCommandProvider",
    "episerver-labs-block-enhancements/content-draft-view/toggle-content-draft-view-command"
], function (
    declare,
    ToggleButton,
    _GlobalToolbarCommandProvider,
    ToggleContentDraftViewCommand) {
    return declare([_GlobalToolbarCommandProvider], {

        constructor: function () {
            this.inherited(arguments);

            var showReviewCommand = new ToggleContentDraftViewCommand({ });
            this.addToLeading(showReviewCommand,
                {
                    showLabel: false,
                    widget: ToggleButton,
                    'class': 'epi-mediumButton'
                });
        }
    });
});
