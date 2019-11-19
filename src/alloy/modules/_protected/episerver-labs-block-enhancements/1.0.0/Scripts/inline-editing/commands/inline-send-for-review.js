define([
    "dojo/_base/declare",
    "epi-cms/contentediting/command/SendForReview",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-command-mixin",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.inlinecommands.inlinereadytopublish"
], function (
    declare,
    SendForReview,
    _InlineCommandMixin,
    ContentActionSupport,
    res
) {

    return declare([SendForReview, _InlineCommandMixin], {
        // summary:
        //      Inline Ready to Publish content command.
        //

        errorMessageHeading: res.error,

        successMessage: res.success,

        requiredAction: ContentActionSupport.action.CheckIn,

        skippedAction: ContentActionSupport.action.Publish,

        ignoredStatuses: [ContentActionSupport.versionStatus.DelayedPublish,
            ContentActionSupport.versionStatus.CheckedIn,
            ContentActionSupport.versionStatus.Published]
    });
});
