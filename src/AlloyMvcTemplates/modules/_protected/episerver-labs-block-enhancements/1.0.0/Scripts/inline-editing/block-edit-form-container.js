define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/on",
    "dojo/Evented",
    "epi/dependency",
    "epi",
    "epi/UriParser",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/ContentViewModel",
    "episerver-labs-block-enhancements/inline-editing/tooltip-patch",

    "epi/shell/widget/FormContainer"
], function (
    declare,
    topic,
    on,
    Evented,
    dependency,
    epi,
    UriParser,
    ContentActionSupport,
    ContentViewModel,
    tooltipPatch,
    FormContainer) {

    return declare([FormContainer, Evented], {
        contentLink: null,
        isInlineCreateEnabled: null,
        isDirty: false,
        initialValue: null,

        _onIsDirty: function () {
            var isDirty = !epi.areEqual(this.get("initialValue"), this.get("value"));

            this.set("isDirty", isDirty);
            this.emit("isDirty", isDirty);
        },

        postCreate: function () {
            this.inherited(arguments);

            this._enhancedStore = dependency.resolve("epi.storeregistry").get("episerver.labs.blockenhancements");
            this.own(on(this, "FormCreated", function () {
                this.own(on(this.form.domNode.firstElementChild, "scroll", function () {
                    tooltipPatch.hideAll();
                }));

                this.onChange = this._onIsDirty.bind(this);

                this.own(on(this, "change", this._onIsDirty.bind(this)));
                this.own(on(this.domNode, "change", this._onIsDirty.bind(this)));
                this.own(on(this.domNode, "keyup", this._onIsDirty.bind(this)));
                this.initialValue = this.get("value");
            }.bind(this)));
        },

        saveForm: function () {
            var model = this._model,
                value = this.value;

            // the form was not changed
            if (!this.value) {
                return;
            }

            this._model.onContentLinkChange = function () { };

            Object.keys(this.value).forEach(function (propertyName) {
                model.setProperty(propertyName, value[propertyName]);
            });

            return model.save().then(function (result) {
                if (!result) {
                    return;
                }
                topic.publish("/epi/cms/content/statuschange/", model.contentData.status, {id: model.contentLink});
                topic.publish("/refresh/ui");
            });
        },

        layout: function () {
            this.inherited(arguments);
            this.containerLayout.containerNode.style.removeProperty("height");
        },

        _setContentLinkAttr: function (contentLink) {
            this._set("contentLink", contentLink);

            if (!this.isInlineCreateEnabled) {
                // in case when the new inline create dialog is disabled
                // we have to change the current context's mode to "create" in order to turn off the "Create new block" link for nested blocks scenarios
                //TODO: we should revert this to the original value, maybe onFormCreated event?
                var contextService = dependency.resolve("epi.shell.ContextService");
                if (!contextService.currentContext) {
                    contextService.currentContext = {};
                }
                contextService.currentContext.currentMode = "create";
            }

            var self = this;
            return this._enhancedStore.query({ ids: [contentLink] }).then(function (latestContents) {
                return self._getContextStore().query({uri: "epi.cms.contentdata:///" + latestContents[0].contentLink})
                    .then(function (context) {
                        self._context = context;
                        var uri = new UriParser(context.uri);
                        return uri.getId();
                    })
                    .then(function (contentLink) {
                        self._model = new ContentViewModel({contentLink: contentLink});
                        return self._model.reload();
                    })
                    .then(function () {
                        self.set("metadata", self._model.get("metadata"));
                        return latestContents[0];
                    });
            });
        },

        _onFormCreated: function () {
            this.inherited(arguments);

            if (this.model && !this._model.canChangeContent(ContentActionSupport.action.Edit)) {
                this.set("readOnly", true);
            }
        },

        _hideProperty: function (metadata, propertyName) {
            metadata.properties.some(function (property) {
                if (property.name === propertyName) {
                    property.showForEdit = false;
                    return true;
                }
                return false;
            });
        },

        _disableNonLanguageSpecificProperties: function (metadata) {
            metadata.properties.forEach(function (property) {
                if (!property.settings.isLanguageSpecific) {
                    property.showForEdit = false;
                }
            }.bind(this));
        },

        _setMetadataAttr: function (metadata) {
            var settings = (metadata.customEditorSettings || {}).inlineBlock;

            if (!settings) {
                console.warn("Metadata was not initialized properly");
                settings = {};
            }

            if (!settings.showNameProperty) {
                this._hideProperty(metadata, "icontent_name");
            }
            if (!settings.showCategoryProperty) {
                this._hideProperty(metadata, "icategorizable_category");
            }

            if (this.get("isTranslationNeeded")) {
                this._disableNonLanguageSpecificProperties(metadata);
            }

            var hiddenGroups = settings.hiddenGroups.map(function (x) {
                return x.toLowerCase();
            });
            var numberOfVisibleGroups = metadata.groups.filter(function (x) {
                return x.name !== "EPiServerCMS_SettingsPanel" && hiddenGroups.indexOf(x.name.toLowerCase()) === -1;
            }).length;

            // Change group properties container to epi-cms/layout/CreateContentGroup
            metadata.layoutType = "epi/shell/layout/SimpleContainer";
            metadata.groups.forEach(function (group) {
                if (group.name === "EPiServerCMS_SettingsPanel") {
                    group.options = {};
                    group.title = null;
                    group.uiType = "episerver-labs-block-enhancements/inline-editing/create-content-group-container-with-no-header";
                } else {
                    group.uiType = numberOfVisibleGroups > 1 ? "epi-cms/layout/CreateContentGroupContainer" : "episerver-labs-block-enhancements/inline-editing/create-content-group-container-with-no-header";
                }

                // by default Settings tab is not displayed
                if (hiddenGroups.indexOf(group.name.toLowerCase()) !== -1) {
                    group.displayUI = false;
                }
            });
            this._set("metadata", metadata);

            this.startup();
        },

        _getContextStore: function () {
            if (!this._contextStore) {
                var registry = dependency.resolve("epi.storeregistry");
                this._contextStore = registry.get("epi.shell.context");
            }
            return this._contextStore;
        }
    });
});
