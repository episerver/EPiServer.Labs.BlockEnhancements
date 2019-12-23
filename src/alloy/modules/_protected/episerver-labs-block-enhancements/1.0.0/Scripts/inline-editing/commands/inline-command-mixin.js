define([
    "dojo/_base/declare",
    "dojo/when",
    "dojo/topic",
    "epi/dependency",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentViewModel",
    "epi/shell/DialogService",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/SendForReview",
    "epi-cms/contentediting/command/BlockEdit"
], function (
    declare,
    when,
    topic,
    dependency,
    ContentReference,
    ContentViewModel,
    dialogService,
    ContentActionSupport,
    SendForReview,
    BlockEdit
) {

    return declare(null, {
        // summary:
        //      Inline command mixin
        //
        requestContextChange: false,

        _viewModel: null,

        errorMessageHeading: "",

        successMessage: "",

        requiredAction: null,

        skippedAction: null,

        ignoredStatus: null,

        postscript: function () {
            this.inherited(arguments);

            this.messageService = this.messageService || dependency.resolve("epi.shell.MessageService");
            this._contentVersionStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentversion");
            this._contentDataStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentdata");
            this._enhancedStore = dependency.resolve("epi.storeregistry").get("episerver.labs.blockenhancements");

            this.own(topic.subscribe("/epi/cms/content/statuschange/", function (status, contentIdentity) {
                if (!this.model || !this.model.contentLink) {
                    return;
                }
                var updatedContentId = new ContentReference(contentIdentity.id).id;
                var currentModelId = new ContentReference(this.model.contentLink).id;
                if (updatedContentId === currentModelId) {
                    this._onModelChange();
                }
            }.bind(this)));
        },

        _execute: function () {
            var self = this;

            function showErrorMessage(error) {
                if (error) {
                    dialogService.alert({
                        heading: self.errorMessageHeading,
                        description: error
                    });
                    return;
                }

                var query = {
                    contextId: self.model.contentData.contentLink,
                    contextTypeName: "epi.cms.contentdata",
                    typeName: "error"
                };
                var validationErrors = self.messageService.query(query).map(function (validationError) {
                    return validationError.message;
                });
                if (validationErrors.length > 0) {
                    dialogService.alertWithErrors({
                            heading: self.errorMessageHeading,
                            acknowledgeActionText: "Edit",
                            onAction: function () {
                                var editCommand = BlockEdit();
                                editCommand.set("model", self.model);
                                editCommand.execute();
                            }
                        },
                        validationErrors);
                    return;
                }

                dialogService.alert(self.errorMessageHeading);
            }

            var messages = this.messageService.query({contextId: this.model.contentData.contentLink});
            messages.forEach(function (message) {
                this.messageService.remove({id: message.id});
            }, this);

            return this.inherited(arguments).then(function () {
                dialogService.alert("<strong>" + this.model.contentData.name + "</strong> " + self.successMessage);
                this._contentDataStore.refresh(this.model.contentData.contentLink).then(function () {
                    topic.publish("/refresh/ui");
                });
            }.bind(this)).otherwise(showErrorMessage)
                .always(function () {
                    this.set("isAvailable", false);
                }.bind(this));
        },

        destroy: function () {
            if (this._viewModel) {
                this._viewModel.destroy();
            }
            this.inherited(arguments);
        },


        _onContentStatusChange: function (result) {
            return result;
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute and isAvailable after the model has been updated.

            if (!this.model) {
                return;
            }

            var _arguments = arguments;
            var masterContentData = this.model.content || this.model;

            return this._enhancedStore.executeMethod("GetLatestVersions", null, [this.model.contentLink]).then(function (latestContents) {
                var contentData = latestContents[0];
                // we want to exit early if the page is already published or the user does not have proper access rights
                if (!contentData || this.ignoredStatuses.indexOf(contentData.status) !== -1 ||
                    !ContentActionSupport.hasAccessToAction(masterContentData, this.requiredAction) ||
                    (this.skippedAction && ContentActionSupport.hasAccessToAction(masterContentData, this.skippedAction))
                ) {
                    this.set("isAvailable", false);
                    return;
                }

                this.set("isAvailable", true);

                if (this._viewModel) {
                    this._viewModel.destroy();
                }
                this._viewModel = new ContentViewModel({
                    contentLink: contentData.contentLink,
                    contextTypeName: "epi.cms.contentdata"
                });
                this._viewModel.set("contentData", contentData);
                this.model = this._viewModel;

                this.inherited(_arguments);
            }.bind(this));
        }
    });
});
