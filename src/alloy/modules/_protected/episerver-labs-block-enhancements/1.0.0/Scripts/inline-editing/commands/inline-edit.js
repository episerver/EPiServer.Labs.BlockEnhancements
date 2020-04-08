define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/on",
        "dojo/topic",
        "dojo/when",
        //EPi
        "epi",
        "epi/dependency",
        "epi/shell/TypeDescriptorManager",
        "epi/shell/DestroyableByKey",

        "epi-cms/core/ContentReference",
        "epi-cms/contentediting/ContentActionSupport",
        "epi/shell/command/_Command",

        "episerver-labs-block-enhancements/inline-editing/form-dialog",
        "episerver-labs-block-enhancements/inline-editing/block-edit-form-container",
        "episerver-labs-block-enhancements/create-new/translate-block-edit-form-container",
        "episerver-labs-block-enhancements/inline-editing/commands/inline-publish",
        "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.ilineediting",

        "xstyle/css!episerver-labs-block-enhancements/inline-editing/inline-edit.css",
    ],

    function (
        declare,
        lang,
        on,
        topic,
        when,

        epi,
        dependency,
        TypeDescriptorManager,
        DestroyableByKey,

        ContentReference,
        ContentActionSupport,
        _Command,
        FormDialog,
        FormContainer,
        TranslateFormContainer,
        InlinePublish,
        labsResources
    ) {

        return declare([_Command, DestroyableByKey], {
            // summary:
            //      Show inline block edit dialog

            label: labsResources.inlineblockedit,

            iconClass: "epi-iconPen",

            category: "menuWithSeparator",

            postscript: function () {
                this.inherited(arguments);

                this._contentLightStore = dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
                this.own(topic.subscribe("/epi/cms/content/statuschange/", function (status, contentIdentity) {
                    if (!this.model || !this.model.contentLink) {
                        return;
                    }
                    var updatedContentId = new ContentReference(contentIdentity.id).id;
                    var currentModelId = new ContentReference(this.model.contentLink).id;
                    if (updatedContentId === currentModelId) {
                        this._contentLightStore.refresh(currentModelId).then(function (contentData) {
                            this._refreshContentSettings(contentData);
                        }.bind(this));
                    }
                }.bind(this)));
            },

            _execute: function () {
                // summary:
                //    Executes this command; Displays editing dialog
                //

                var dialog = new FormDialog({
                    title: this.model.name
                });

                var _this = this;
                var isDirty = false;
                var initialValue = null;
                var inlinePublishCommand = new InlinePublish({
                    commandType: "inline-edit-form"
                });

                function canPublish() {
                    return inlinePublishCommand.get("isAvailable") && inlinePublishCommand.get("canExecute");
                }

                function updatePublishCommandVisibility() {
                    if (!dialog) {
                        return;
                    }
                    var isPartOfActiveApproval = _this.get("isPartOfActiveApproval");
                    dialog.togglePublishButton(_this.get("hasPublishAccessRights") && (!isPartOfActiveApproval && (canPublish() || isDirty)));
                    dialog.setPublishLabel(inlinePublishCommand.label);
                    dialog.toggleDisabledSaveButton(_this.get("isTranslationNeeded") && !isDirty);
                }

                var isAvailableHandle = inlinePublishCommand.watch("isAvailable", updatePublishCommandVisibility.bind(this));
                var canExecuteHandle = inlinePublishCommand.watch("canExecute", updatePublishCommandVisibility.bind(this));
                var labelHandle = inlinePublishCommand.watch("label", function (value) {
                    if (!dialog) {
                        return;
                    }
                    dialog.setPublishLabel(inlinePublishCommand.label);
                }.bind(this));

                var form;

                if (this.get("isTranslationNeeded")) {
                    form = new TranslateFormContainer({
                        isInlineCreateEnabled: this.isInlineCreateEnabled,
                        isTranslationNeeded: this.isTranslationNeeded
                    }, dialog.content, "last");
                    when(this._getContentData()).then(function (contentData) {
                        form.reloadMetadata(contentData, contentData.contentTypeID);
                    }.bind(this));
                } else {
                    form = new FormContainer({
                        isInlineCreateEnabled: this.isInlineCreateEnabled
                    }, dialog.content, "last");
                    form.set("contentLink", this.model.contentLink).then(function (model) {
                        inlinePublishCommand.set("model", this.model);
                        _this.set("isPartOfActiveApproval", model.isPartOfActiveApproval);
                    }.bind(this));
                }

                var formCreatedHandle = on(form, "FormCreated", function () {
                    if (form.model && !form._model.canChangeContent()) {
                        dialog.hideSaveButton();
                        dialog.set("closeText", "Close");
                    }

                    dialog.show();
                    initialValue = form.get("value");
                    updatePublishCommandVisibility();

                }.bind(this));

                var onChangeHandle = on(form, "change", function () {
                    if (isDirty) {
                        return;
                    }
                    isDirty = !epi.areEqual(initialValue, form.get("value"));
                    updatePublishCommandVisibility();
                });

                var executeHandle = on(dialog, "execute", form.saveForm.bind(form));

                var publishHandle = on(dialog, "Publish", function () {
                    var deferred = true;
                    if (isDirty) {
                        deferred = form.saveForm();
                    }
                    when(deferred).then(function () {
                        var prePublishDeferred = true;
                        // check if the Publish became available after the form was saved
                        if (!canPublish()) {
                            // if it did, then we have to manually refresh its model to get most recent availability flags
                            prePublishDeferred = inlinePublishCommand._onModelChange();
                        }
                        when(prePublishDeferred).then(function () {
                            if (canPublish()) {
                                inlinePublishCommand.execute().then(function () {
                                    dialog.hide();
                                });
                            } else {
                                dialog.hide();
                            }
                        });
                    });
                });

                var closeHandle = on(dialog, "hide", function () {
                    form.destroy();
                    inlinePublishCommand.destroy();
                    executeHandle.remove();
                    closeHandle.remove();
                    formCreatedHandle.remove();
                    onChangeHandle.remove();
                    publishHandle.remove();
                    isAvailableHandle.remove();
                    canExecuteHandle.remove();
                    labelHandle.remove();
                });
            },

            _getContentData: function () {
                // summary:
                //      Try to get full contentData object
                //      Fetch it from store unless already available

                var contentData = this.model.content || this.model;
                if (!contentData.properties) {
                    // need to fetch contentData if statusIndicator feature is turned off
                    contentData = this._contentLightStore.get(contentData.contentLink);
                }
                return contentData;
            },

            _onModelChange: function () {
                // summary:
                //      Updates isAvailable after the model has been updated.

                this.inherited(arguments);

                if (!TypeDescriptorManager.isBaseTypeIdentifier(this.model.typeIdentifier, "episerver.core.blockdata")) {
                    this.set("isAvailable", false);
                    return;
                }

                this.set("isAvailable", true);

                when(this._getContentData()).then(function (contentData) {
                    this._refreshContentSettings(contentData);
                }.bind(this));
            },

            _refreshContentSettings: function (contentData) {
                var hasAccessRights = ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Edit);
                var hasProviderSupportForEditing = ContentActionSupport.hasProviderCapability(contentData.providerCapabilityMask, ContentActionSupport.providerCapabilities.Edit);
                var isReadyToPublish = contentData.status === ContentActionSupport.versionStatus.CheckedIn;
                var isDeleted = contentData.isDeleted;
                var missingLanguageBranch = contentData.missingLanguageBranch;
                var isTranslationNeeded = missingLanguageBranch && contentData.missingLanguageBranch.isTranslationNeeded;
                this.set("label", isTranslationNeeded ? lang.replace(labsResources.inlinetranslate, {missingLanguage: missingLanguageBranch.preferredLanguage}) : labsResources.inlineblockedit);
                this.set("isTranslationNeeded", isTranslationNeeded);
                this.set("canExecute", hasAccessRights && hasProviderSupportForEditing && !isReadyToPublish && !isDeleted);
                this.set("hasPublishAccessRights", ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Publish));
            }
        });
    });
