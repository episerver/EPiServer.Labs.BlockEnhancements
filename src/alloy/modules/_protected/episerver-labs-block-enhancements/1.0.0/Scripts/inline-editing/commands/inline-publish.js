define([
    "dojo/_base/declare",
    "epi-cms/contentediting/command/Publish",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-command-mixin",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.inlinecommands.inlinepublish"
], function (
    declare,
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

        ignoredStatuses: [ContentActionSupport.versionStatus.DelayedPublish, ContentActionSupport.versionStatus.Published]
    });
});
