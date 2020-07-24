define([
    "dojo/_base/declare",
    "dojo/when",
    "epi-cms/contentediting/command/Publish",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-command-mixin",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.inlinecommands.inlinepublish"
], function (
    declare,
    when,
    Publish,
    _InlineCommandMixin,
    ContentActionSupport,
    res
) {

    return declare([Publish, _InlineCommandMixin], {
        // summary:
        //      Inline publish content command.
        //

        errorMessageHeading: res.error,

        successMessage: res.success,

        requiredAction: ContentActionSupport.action.Publish,

        ignoredStatuses: [ContentActionSupport.versionStatus.DelayedPublish, ContentActionSupport.versionStatus.Published],

        canPublish: function () {
            return this.get("isAvailable") && this.get("canExecute");
        },

        tryToSaveAndPublish: function (form) {
            var deferred = true;
            if (form.get("isDirty")) {
                deferred = form.saveForm();
            }
            return when(deferred).then(function () {
                var prePublishDeferred = true;
                // check if the Publish became available after the form was saved
                if (!this.canPublish()) {
                    // if it did, then we have to manually refresh its model to get most recent availability flags
                    prePublishDeferred = this._onModelChange();
                }
                return when(prePublishDeferred).then(function () {
                    if (this.canPublish()) {
                        return this.execute();
                    }
                }.bind(this));
            }.bind(this));
        }
    });
});
