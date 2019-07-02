define([
    "dojo/_base/declare",
    "dojo/when",
    "dojo/topic",
    "epi/dependency",
    "epi-cms/contentediting/ContentViewModel",
    "epi/shell/DialogService",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/Publish",
    "epi-cms/contentediting/command/BlockEdit"
], function (
    declare,
    when,
    topic,
    dependency,
    ContentViewModel,
    dialogService,
    ContentActionSupport,
    Publish,
    BlockEdit
) {

    return declare([Publish], {
        // summary:
        //      Inline publish content command.
        //
        requestContextChange: false,

        _viewModel: null,

        postscript: function () {
            this.inherited(arguments);

            this.messageService = this.messageService || dependency.resolve("epi.shell.MessageService");
            this._contentVersionStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentversion");
            this._contentDataStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentdata");
        },

        _execute: function () {
            var self = this;

            function showErrorMessage (error) {
                if (error) {
                    dialogService.alert({
                        heading: "Content publish failed",
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
                            heading: "Content publish failed",
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

                dialogService.alert("Content publish failed");
            }

            var messages = this.messageService.query({ contextId: this.model.contentData.contentLink });
            messages.forEach(function (message) {
                this.messageService.remove({ id: message.id });
            }, this);

            return this.inherited(arguments).then(function () {
                dialogService.alert("<strong>" + this.model.contentData.name + "</strong> was published successfully");
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

            var _arguments = arguments;
            return when(this._contentVersionStore
                .query({ contentLink: this.model.contentLink, query: "getcommondraftversion" }).then(
                    function (commonDraftVersion) {
                        var contentData = commonDraftVersion;
                        if (!contentData || contentData.status === ContentActionSupport.versionStatus.Published) {
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
                    }.bind(this)));
        }
    });
});
