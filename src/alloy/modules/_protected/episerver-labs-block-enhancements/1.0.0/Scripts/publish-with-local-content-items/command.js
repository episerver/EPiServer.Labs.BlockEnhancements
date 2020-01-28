define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/DeferredList",
    "dojo/when",
    "dojo/promise/all",
    "epi",
    "epi/dependency",
    "epi/shell/DialogService",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentViewModel",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/_ChangeContentStatus",
    "episerver-labs-block-enhancements/publish-with-local-content-items/content-dependencies",
    "episerver-labs-block-enhancements/tracker",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements"
], function (
    declare,
    topic,
    Deferred,
    DeferredList,
    when,
    whenAll,
    epi,
    dependency,
    dialogService,
    ContentReference,
    ContentViewModel,
    ContentActionSupport,
    _ChangeContentStatus,
    ContentDependencies,
    tracker,
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
            this.inherited(arguments);

            this._store = dependency.resolve("epi.storeregistry").get("episerver.labs.blockenhancements");
            this._pageDataStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentdata");
            this.projectService = dependency.resolve("epi.cms.ProjectService");
        },

        _execute: function () {

            var isPage = this.model.contentData.capabilities.isPage;
            var isBlock = this.model.contentData.capabilities.isBlock;
            if (isPage || isBlock){
                tracker.track("publish", {
                    "command-type": "smart-command-click",
                    "content-type": isPage ? "page" : "block"
                });
            }

            var self = this;
            var args = arguments;

            function callback(id) {
                var versionAgnosticId = new ContentReference(id).createVersionUnspecificReference().toString();
                topic.publish("/epi/cms/contentdata/childrenchanged", versionAgnosticId);
            }

            var isPublishCommandAvailable = self.model.contentData.transitions.filter(function (transition) {
                return transition.name === "publish";
            }).length !== 0;


            var contentItemsList = new ContentDependencies({
                contentLink: self.model.contentData.contentLink,
                mode: "confirm"
            });

            var confirmation = dialogService.confirmation({
                description: labsResources.dialog.confirmation,
                dialogClass: "epi-dialog-smartPublish",
                content: contentItemsList,
                title: labsResources.dialog.title,
                cancelActionText: epi.resources.action.cancel,
                confirmActionText: epi.resources.action.publish,
                setFocusOnConfirmButton: true
            });

            var deferred = new Deferred();
            confirmation.then(function () {
                var selectedContentLinks = contentItemsList.get("selectedContentLinks") || [];
                var defaultSelectedContent = contentItemsList.get("_defaultSelectedContent") || [];
                var trackingData = {
                    "smart-publish.is-default-selected": defaultSelectedContent.length === selectedContentLinks.length,
                    "smart-publish.no-item-selected": selectedContentLinks.length === 0
                };
                self._getContentsToPublish(selectedContentLinks).then(function (selectedContents) {
                    self._publishBlocks(selectedContents).then(function (publishResults) {
                        var success = "Successfully published ";
                        var contentMessage = "<strong>" + self.model.contentData.name + "</strong>";
                        var publishedItems = publishResults.filter(function (result) {
                            return result[0];
                        });
                        var publishCount = publishedItems.length;

                        if (publishCount === 0) {
                            trackingData["smart-publish.result"] = "nothing";
                        } else if (publishCount === selectedContents.length) {
                            trackingData["smart-publish.result"] = "all";
                        } else {
                            trackingData["smart-publish.result"] = "partial";
                        }

                        whenAll(publishedItems.map(function (result) {
                            return self._pageDataStore.refresh(result[1].id);
                        })).then(function () {
                            topic.publish("/refresh/ui");
                        });
                        var dependenciesSuccessMessage = (publishCount === selectedContents.length ? "all" : (publishCount + " out of " + selectedContents.length)) + " selected content items";
                        if (!isPublishCommandAvailable) {
                            if (publishCount > 0) {
                                callback(self.model.contentData.contentLink);
                                dialogService.alert(success + dependenciesSuccessMessage);
                            } else {
                                dialogService.alert("No content items were published");
                            }
                            deferred.resolve(trackingData);
                            return;
                        }
                        when(self.inherited(args)).then(function (result) {
                            callback(result.oldId);
                            var pageSuccessMessage = success + contentMessage;
                            if (publishCount > 0) {
                                dialogService.alert(pageSuccessMessage + " and " + dependenciesSuccessMessage);
                            } else {
                                dialogService.alert(pageSuccessMessage);
                            }
                            deferred.resolve(trackingData);
                        }).otherwise(function (e) {
                            dialogService.alert("Content publish failed");
                            deferred.reject(trackingData);
                        });
                    });
                });
            }, function () {
                // cancelling dialog window should not be tracked
                deferred.reject({
                    userCanceled: true
                });
            });

            return deferred.promise;
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

        _getContentsToPublish: function (contentLinks) {
            var deferred = new Deferred();

            var dependencies = whenAll(contentLinks.map(function (contentLink) {
                return this._pageDataStore.get(contentLink);
            }.bind(this)));
            dependencies.then(function (results) {
                deferred.resolve(results);
            });

            return deferred.promise;
        },

        _onModelChange: function () {
            // summary:
            //		Updates isAvailable after the model has been updated.

            this.inherited(arguments);
            this.projectService.getCurrentProjectId().then(function (isProjectActive) {
                if (isProjectActive) {
                    this.set("isAvailable", false);
                } else {
                    var contentData = this.model.contentData || this.model;
                    var hasPublishRights = ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Publish);
                    this.set("isAvailable", hasPublishRights);
                }
            }.bind(this));
        }
    });
});
