define([
    "dojo/aspect",
    "dojo/on",
    "dojo/topic",
    "dojo/when",
    "dojo/Evented",
    "dojo/Deferred",
    "dojo/dom-class",
    "dojo/_base/lang",
    "epi",
    "epi/datetime",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/ContentViewModel",
    "epi-cms/contentediting/EditingBase",
    "epi-cms/contentediting/OnPageEditing",
    "epi-cms/contentediting/RenderManager",
    "epi-cms/contentediting/UpdateController",
    "epi-cms/contentediting/inline-editing/InlineEditBlockDialog",
    "epi-cms/contentediting/inline-editing/BlockEditFormContainer",
    "epi-cms/contentediting/command/BlockEdit",
    "epi-cms/contentediting/command/BlockInlineEdit",
    "epi-cms/contentediting/editors/_BlockTreeNode",
    "epi/i18n!epi/cms/nls/episerver.shared.action"
], function (
    aspect,
    on,
    topic,
    when,
    Evented,
    Deferred,
    domClass,
    lang,
    epi,
    epiDateTime,
    ContentReference,
    ContentActionSupport,
    ContentViewModel,
    EditingBase,
    OnPageEditing,
    RenderManager,
    UpdateController,
    InlineEditBlockDialog,
    BlockEditFormContainer,
    BlockEdit,
    BlockInlineEdit,
    _BlockTreeNode,
    actionStrings
) {
    return function (blockEnhancementsOptions) {
        BlockInlineEdit.prototype.label = epi.resources.action.edit;

        BlockInlineEdit.prototype._refreshContentSettings = function (contentData) {
            // summary:
            //      Update the content settings
            // tags:
            //      protected

            // contentData == null when it doesn't have a content version in the current language
            if (contentData == null) {
                this.set("isAvailable", false);
                this.set("canExecute", false);
                return;
            }

            this.set("isAvailable", true);

            var hasAccessRights = ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Edit);
            var hasProviderSupportForEditing = ContentActionSupport.hasProviderCapability(contentData.providerCapabilityMask, ContentActionSupport.providerCapabilities.Edit);
            var isDeleted = contentData.isDeleted;
            var isInUse = contentData.inUseNotifications && contentData.inUseNotifications.length > 0;
            var isPartOfActiveApproval = contentData.isPartOfActiveApproval;

            var canExecute = (this.ignoredEditStatuses.indexOf(contentData.status) === -1) && hasAccessRights && hasProviderSupportForEditing && !isDeleted && !isInUse && !isPartOfActiveApproval;

            if (contentData.capabilities && !contentData.capabilities.isLocalContent) {
                this.set("isAvailable", false);
                return;
            }

            this.set("canExecute", canExecute);

            if (canExecute) {
                this._calculateMainButtonCommand(contentData);
            }
        }

        BlockInlineEdit.prototype._execute = function () {
            // summary:
            //    Open the inline edit block dialog
            // tags:
            //      protected

            var dialog = this._dialog = new InlineEditBlockDialog({
                title: this.model.name,
                mainCommand: this.mainCommand
            });

            var _this = this;
            var form;

            function updateMainCommandVisibility() {
                if (!dialog) {
                    return;
                }

                dialog.toggleDisabledMainButton(!(_this.mainCommand.get("canExecute") || form.get("isDirty")));
                dialog.toggleDisabledSaveButton(!form.get("isDirty"));
            }

            var isAvailableHandle = this.mainCommand.watch("isAvailable", updateMainCommandVisibility.bind(this));
            var canExecuteHandle = this.mainCommand.watch("canExecute", updateMainCommandVisibility.bind(this));

            form = new BlockEditFormContainer({}, dialog.content, "last");
            form.set("contentLink", this.model.contentLink).then(function (formContentData) {
                this.mainCommand.set("model", this.model);

                // manually trigger the _onModelChange in order to fetch contentdata from store and calculate if the mainCommand should be available or not.
                this.mainCommand._onModelChange();

                updateMainCommandVisibility();
                _this.set("isPartOfActiveApproval", formContentData.isPartOfActiveApproval);
            }.bind(this));

            var formCreatedHandle = on(form, "FormCreated", function () {
                if (form.model && !form._model.canChangeContent()) {
                    dialog.hideSaveButton();
                    dialog.set("closeText", "Close");
                }

                dialog.show();
                dialog.toggleMainButton(!form._model.contentData.capabilities.isLocalContent);
                updateMainCommandVisibility();

            }.bind(this));

            var _mainCommand = this.mainCommand;
            var onChangeHandle = on(form, "isDirty", updateMainCommandVisibility.bind(form));
            var executeHandle = on(dialog, "execute", form.saveForm.bind(form));
            var mainCommandHandle = on(dialog, "MainCommand", function () {
                if (!this.validate()) {
                    return;
                }
                _mainCommand.tryToSaveAndExecute(form).then(function () {
                    dialog.hide();
                });
            });

            var closeHandle = on(dialog, "hide", function () {
                form.destroy();
                this.mainCommand.destroy();
                executeHandle.remove();
                closeHandle.remove();
                formCreatedHandle.remove();
                onChangeHandle.remove();
                mainCommandHandle.remove();
                isAvailableHandle.remove();
                canExecuteHandle.remove();
                this._dialog = null;
            }.bind(this));
        }

        BlockEdit.prototype._execute = function () {
            var contentLink = new ContentReference(this.model.contentLink).createVersionUnspecificReference().toString();
            topic.publish("/epi/shell/context/request", {
                uri: "epi.cms.contentdata:///" + contentLink
            }, {});
        }

        BlockEdit.prototype._onModelValueChange = function () {
            // summary:
            //      Updates canExecute after the model value has changed.
            // tags:
            //      protected
            var item = this.model;

            if (!item || !item.contentLink) {
                this.set("canExecute", false);
                return;
            }

            this.set("isAvailable", true);

            if (item.content && item.content.capabilities && item.content.capabilities.isLocalContent) {
                this.set("isAvailable", false);
                return;
            }

            var result = item && this._store.get(item.contentLink);

            // if the accessMask is available then display the label accordingly. (i.e either "View" or "Edit")
            when(result, lang.hitch(this, function (content) {
                if (content && content.capabilities && content.capabilities.isLocalContent && (!content.missingLanguageBranch || !content.missingLanguageBranch.isTranslationNeeded)) {
                    this.set("isAvailable", false);
                    return;
                }
                this.set("canExecute", content && !content.isDeleted);
                if (content && content.accessMask) {
                    if (this.contentActionSupport.hasAccess(content.accessMask, this.contentActionSupport.accessLevel[this.contentActionSupport.action.Edit])) {
                        this.set("label", actionStrings.edit);
                        this.set("iconClass", "epi-iconPen");
                    } else {
                        this.set("label", actionStrings.view);
                        this.set("iconClass", "epi-iconSearch");
                    }
                }
            }));
        }

        BlockEditFormContainer.prototype.saveForm = function () {
            var model = this._model,
                value = this.value,
                initialValue = this.initialValue;

            // the form was not changed
            if (!this.value) {
                return;
            }

            this._model.onContentLinkChange = function () { };

            Object.keys(this.value).forEach(function (propertyName) {
                if (value[propertyName] !== initialValue[propertyName]) {
                    model.setProperty(propertyName, value[propertyName]);
                }
            });

            return model.save().then(function (result) {
                if (!result) {
                    return;
                }
                topic.publish("/epi/cms/content/statuschange/", model.contentData.status, {id: model.contentLink}, model.contentData.capabilities.isLocalContent);

                if (model.contentData.isPendingPublish) { /*isPendingPublish is true if the content doesn't have a published version*/
                    topic.publish("/epi/cms/block/inline-updated");
                }
            });
        }

        ContentViewModel.prototype.emit = Evented.prototype.emit;
        ContentViewModel.prototype.on = Evented.prototype.on;

        ContentViewModel.prototype._save = function () {
            var def = new Deferred(),
                onSuccess = lang.hitch(this, function (result) {
                    if (result) {
                        if (result.successful) {
                            this._onSynchronizeSuccess(result.contentLink, result.properties, result);
                        } else {
                            this._rescheduleProperties(result.properties);
                            this._onSynchronizeFailure(result.contentLink, result.properties, result.validationErrors, result);
                        }
                        if (result && result.hasContentLinkChanged && this.contentLink !== result.contentLink) {
                            this._contentLinkChanged(result.contentLink);
                        }

                        this.set("validationErrors", result.validationErrors);
                    }
                    this.set("isOnline", true);
                    this.set("lastSaved", new Date());
                    this.set("isSaving", false);
                    this.set("isSaved", true);

                    this.emit("saved", result);
                    def.resolve(true);
                }),
                onError = lang.hitch(this, function (result) {

                    this.set("hasErrors", true);
                    this.set("isSaving", false);
                    this.set("isSaved", false);

                    if (result && result.error && (result.error.status === 409 || result.error.status === 404)) {
                        // Version conflict or removed, do not retry.
                        var message = result.error.status === 409 ? res.autosave.conflict : res.autosave.reloadmessage;
                        this._showErrorsDialog(message, []);

                    } else {
                        this.set("isOnline", false);

                        if (result) {
                            this.set("validationErrors", result.validationErrors);
                            this._rescheduleProperties(result.properties);
                        }

                        setTimeout(lang.hitch(this, function () {
                            this.set("isOnline", true);
                            this._save();
                        }), this._syncRetryTimeout);
                    }

                    this.emit("saved");
                    def.reject(result);
                });

            //Make sure that we have a version that we can make changes to
            if (!this.hasPendingChanges) {
                onSuccess();
            } else {

                when(this.ensureWritableVersion()).then(lang.hitch(this, function () {
                    this.set("isSaving", true);
                    return this.syncService.save();
                })).then(onSuccess).otherwise(onError);

            }
            return def;
        }

        EditingBase.prototype._updateChangedProperty = function () {
            this.viewModel.beginOperation();
            this.viewModel.setProperty("iversionable_changed", new Date(), null);
        }

        OnPageEditing.prototype._updateChangedProperty = function (propertyName) {
            this.viewModel.beginOperation();
            this.viewModel.setProperty("iversionable_changed", new Date(), null);

            var handler = on(this.viewModel, "saved", function (result) {
                handler.remove();

                if (!result) {
                    return;
                }
                var mapping = this._mappingManager.findOne("propertyName", propertyName);
                mapping.updateController.contentLink = result.contentLink;
                mapping.updateController.render(true);
            }.bind(this));
        }

        var originalSetViewModelAttr = EditingBase.prototype._setViewModelAttr;
        EditingBase.prototype._setViewModelAttr = function () {
            originalSetViewModelAttr.apply(this, arguments);
            this.ownByKey("updateChangedProperty", topic.subscribe("updateChangedProperty", this._updateChangedProperty.bind(this)));
        }

        RenderManager.prototype.renderValue = function (contentLink, propertyName, value, renderSettings, rendererClassName, force) {
            var def;

            if (this._isSuspending) {
                def = new Deferred();
                def.cancel();
                return def;
            }

            value = epiDateTime.transformDate(value);

            renderSettings = this.cloneAndCompleteRenderSettings(renderSettings || {});

            // Firstly, try getting from cache
            var renderedContent = this._get(propertyName, renderSettings, value);

            if (!force && renderedContent) {
                def = new Deferred();
                def.resolve(renderedContent);
            } else {
                if (renderSettings && renderSettings.isFullReload) {
                    def = new Deferred();
                    def.resolve({ doReload: true });
                } else {
                    def = new Deferred();
                    when(this._getRenderer(rendererClassName), lang.hitch(this, function (renderer) {
                        if (!renderer) {
                            renderer = this.defaultRenderer;
                        }

                        when(this._queueItem(renderer, contentLink, propertyName, renderSettings, value), function (result) {
                            def.resolve(result);
                        });

                        if (this.processQueueOnRenderValue && !this._isSuspending) {
                            this._startRenderingInterval();
                        }

                    }));
                }
            }

            return def;
        }

        UpdateController.prototype.render = function (force) {
            var val = this.contentModel.get(this.modelPropertyName);
            this._renderNode(this.modelPropertyName, val, val, force);
        }

        UpdateController.prototype._renderNode = function (propertyName, oldValue, value, force) {

            var contentLink = this.contentLink;
            var renderSettings = this.renderSettings;
            var rendererClass = this.rendererClass;
            var renderPropertyName = this.nodePropertyName || this.modelPropertyName;

            var def = this.renderManager.renderValue(contentLink, renderPropertyName, value, renderSettings, rendererClass, force);

            // Did we get a new deferred?
            if (def !== this._lastRenderDeferred) {

                // Store value
                this._lastRenderDeferred = def;

                dojo.when(def, dojo.hitch(this, function (result) {

                    // update node if we have a last deferred, this because cached rendering can
                    // be resolved faster than server rendered values. The last rendered deferred
                    // will be the one to update the node the last time.
                    if (this._lastRenderDeferred) {

                        if (result.doReload !== undefined && result.doReload) {
                            this.onReloadRequired(this);
                        } else if (dojo.isString(result)) {
                            this._updateRendering(result);
                        } else if (result.innerHtml !== undefined) {
                            this._updateRendering(result.innerHtml, result.attributes);
                        } else if (result.error !== undefined) {
                            this._handleValidationError(result.error);
                        }

                        if (def === this._lastRenderDeferred) {
                            this._lastRenderDeferred = null;
                        }
                    }
                }));
            }
        }
    };
});
