define([
    "dojo/_base/declare",
    // Parent class and mixins
    "epi/shell/command/ToggleCommand",

    "episerver-labs-block-enhancements/content-draft-view/common-drafts-view-mixin",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.activities.togglecommand.label"
], function (
    declare,
    // Parent class and mixins
    ToggleCommand,

    _CommonDraftsViewMixin,

    // Resources
    localizations
) {

    return declare([ToggleCommand, _CommonDraftsViewMixin], {
        // tags:
        //      internal

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: true,

        iconClass: "epi-iconGuides",

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        //category: "project-activities",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: "Draft mode view",

        _execute: function () {
            // summary:
            //		Toggles the value of the given property on the model.
            // tags:
            //		protected

            var value = !this.active;

            this.setIsInDraftView(value);

            this.set("active", value);
        },

        _activeSetter: function (active) {
            // summary:
            //      Sets the active property and updates the label to match.
            // tags:
            //      protected

            this.active = active;

            this.set("label", active ? "Change to standard mode" : "Change to draft mode");
        },

        _onModelChange: function () {

        }
    });
});
