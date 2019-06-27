define([
    "dojo/_base/declare",

    "epi/dependency",
    "epi/UriParser",
    "epi-cms/contentediting/ContentViewModel",

    "epi/shell/widget/FormContainer"
], function (
    declare,
    dependency,
    UriParser,
    ContentViewModel,
    FormContainer) {

    var InlineContentViewModel = declare([ContentViewModel], {
        _contentLinkChanged: function (oldContentLink, newContentLink) {
            // store the latest newContentLink, could have changed during sync, ie when first changing a property
            this.set("contentLink", newContentLink);

            this.syncService.set("contentLink", newContentLink);

            // propagate new contentlink
            this.validator.setContextId(newContentLink);
        }
    });

    return declare([FormContainer], {
        contentLink: null,

        SaveForm: function () {
            var model = this._model,
                value = this.value;

            //TODO:PR TO CMS-UI - once we upgrade to EPiServer.CMS.UI 11.10.0 we can remove the custom InlineContentViewModel
            // and uncomment this line below
            //this._model.onContentLinkChange = function () { };

            Object.keys(this.value).forEach(function (propertyName) {
                model.setProperty(propertyName, value[propertyName]);
            });

            return model.save();
        },

        _setContentLinkAttr: function (contentLink) {
            this._set("contentLink", contentLink);
            var self = this;
            return this._getContextStore().query({uri: "epi.cms.contentdata:///" + contentLink})
                .then(function (context) {
                    self._contenxt = context;
                    var uri = new UriParser(context.uri);
                    return uri.getId();
                })
                .then(function (contentLink) {
                    self._model = new InlineContentViewModel({contentLink: contentLink});
                    return self._model.reload();
                })
                .then(function () {
                    self.set("metadata", self._model.get("metadata"));
                });
        },

        _onFormCreated: function () {
            this.inherited(arguments);

            if (!this._model.canChangeContent()) {
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

        _setMetadataAttr: function (metadata) {
            var settings = metadata.customEditorSettings.inlineBlock;

            if (!settings.showNameProperty) {
                this._hideProperty(metadata, "icontent_name");
            }
            if (!settings.showCategoryProperty) {
                this._hideProperty(metadata, "icategorizable_category");
            }

            var hiddenGroups = settings.hiddenGroups.map(function (x) {
                return x.toLowerCase();
            });
            let numberOfVisibleGroups = metadata.groups.filter(function (x) {
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
