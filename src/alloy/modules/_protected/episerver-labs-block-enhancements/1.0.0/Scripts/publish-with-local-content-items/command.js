define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/DeferredList",
    "dojo/when",
    "dojo/promise/all",
    "epi",
    "epi/dependency",
    "epi/shell/DialogService",
    "epi-cms/ApplicationSettings",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentViewModel",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/_ChangeContentStatus",
    "episerver-labs-block-enhancements/publish-with-local-content-items/content-items-list",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements"
], function (
    declare,
    lang,
    topic,
    Deferred,
    DeferredList,
    when,
    whenAll,
    epi,
    dependency,
    dialogService,
    ApplicationSettings,
    ContentReference,
    ContentViewModel,
    ContentActionSupport,
    _ChangeContentStatus,
    ContentItemsList,
    resources,
    labsResources
) {

    return declare([_ChangeContentStatus], {
        label: labsResources.command.label,

        executingLabel: resources.publish.executinglabel,

        tooltip: labsResources.command.label,

        iconClass: "epi-iconPublished",

        action: ContentActionSupport.saveAction.Publish,

        forceReload: true,

        postscript: function () {
            this._store = dependency.resolve("epi.storeregistry").get("episerver.labs.blockenhancements");
            this._pageDataStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentdata");
        },

        _execute: function () {
            var self = this;
            var args = arguments;

            function callback(id) {
                var versionAgnosticId = new ContentReference(id).createVersionUnspecificReference().toString();
                topic.publish("/epi/cms/contentdata/childrenchanged", versionAgnosticId);
            }

            var isPublishCommandAvailable = self.model.contentData.transitions.filter(function (transition) {
                return transition.name === "publish";
            }).length !== 0;

            var forThisPage = self.model.contentData.assetsFolderLink;
            if (forThisPage === ApplicationSettings.contentAssetsFolder.toString()) {
                if (!isPublishCommandAvailable) {
                    return;
                }
                return when(self.inherited(args)).then(function (result) {
                    callback(result.oldId);
                });
            }

            return this._getContentsToPublish(forThisPage).then(function (contentsToPublish) {
                if (contentsToPublish.length === 0) {
                    if (!isPublishCommandAvailable) {
                        return;
                    }
                    return when(self.inherited(args)).then(function (result) {
                        callback(result.oldId);
                    });
                }

                var contentItemsList = new ContentItemsList({ contentItems: contentsToPublish });

                return dialogService.confirmation({
                    description: lang.replace(labsResources.dialog.confirmation, [contentsToPublish.length]),
                    content: contentItemsList,
                    title: labsResources.dialog.title,
                    cancelActionText: epi.resources.action.cancel,
                    confirmActionText: epi.resources.action.publish,
                    setFocusOnConfirmButton: true
                }).then(function () {
                    var selectedContentItems = contentItemsList.get("selectedContentItems");
                    return self._publishBlocks(selectedContentItems).then(function (publishResults) {
                        if (!isPublishCommandAvailable) {
                            self.set("isAvailable", false);
                            callback(self.model.contentData.contentLink);
                            return;
                        }
                        return when(self.inherited(args)).then(function (result) {
                            callback(result.oldId);
                        });
                    });
                });
            });
        },

        _publishBlocks: function (contentsToPublish) {
            return new DeferredList(contentsToPublish.map(function (content) {
                var viewModel = new ContentViewModel({
                    contentLink: content.contentLink,
                    contextTypeName: this.model.contextTypeName
                });
                viewModel.set("contentData", content);
                viewModel.set("languageContext", this.model.languageContext);
                return viewModel.changeContentStatus(this.action);
            }.bind(this)));
        },

        _getContentsToPublish: function (forThisPage) {
            var deferred = new Deferred();

            this._store.get(forThisPage).then(function (contentLinks) {
                var dependencies = whenAll(contentLinks.map(function (contentLink) {
                    return this._pageDataStore.get(contentLink);
                }.bind(this)));
                dependencies.then(function (results) {
                    deferred.resolve(results);
                });
            }.bind(this));

            return deferred.promise;
        }
    });
});
