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

    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command",

    "epi-cms/contentediting/inline-editing/InlineEditBlockDialog",
    "epi-cms/contentediting/command/BlockInlinePublish",

    "episerver-labs-block-enhancements/create-new/translate-block-edit-form-container",

    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.ilineediting"
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

    ContentActionSupport,
    _Command,

    InlineEditBlockDialog,
    InlinePublish,

    TranslateFormContainer,

    labsResources
) {

    return declare([_Command, DestroyableByKey], {
        // summary:
        //      Inline-translate command for the Block component
        // tags:
        //      internal xproduct

        _dialog: null,

        isAvailable: false,

        canExecute: false,

        postscript: function () {
            this.inherited(arguments);

            this._contentLightStore = dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        },

        _execute: function () {
            // summary:
            //    Open the translate form dialog
            // tags:
            //      protected

            var dialog = this._dialog = new InlineEditBlockDialog({
                title: this.model.name
            });

            var _this = this;
            
            var form;

            function updateSaveCommandVisibility() {
                if (!dialog) {
                    return;
                }
                
                dialog.toggleDisabledSaveButton(!form.get("isDirty"));
            }


           form = new TranslateFormContainer({}, dialog.content, "last");
            when(this._getContentData()).then(function (contentData) {
                form.reloadMetadata(contentData, contentData.contentTypeID);
            }.bind(this));

            var formCreatedHandle = on(form, "FormCreated", function () {
                if (form.model && !form._model.canChangeContent()) {
                    dialog.hideSaveButton();
                    dialog.set("closeText", "Close");
                }

                dialog.show();
                dialog.togglePublishButton(false);
                updateSaveCommandVisibility();

            }.bind(this));

            var onChangeHandle = on(form, "isDirty", updateSaveCommandVisibility.bind(form));

            var executeHandle = on(dialog, "execute", form.saveForm.bind(form));

            var closeHandle = on(dialog, "hide", function () {
                form.destroy();
                executeHandle.remove();
                closeHandle.remove();
                formCreatedHandle.remove();
                onChangeHandle.remove();
                isAvailableHandle.remove();
                canExecuteHandle.remove();
                this._dialog = null;
            }.bind(this));
        },

        _getContentData: function () {
            // summary:
            //      Get the content data from the light content store
            //
            // tags:
            //      protected

            return this._contentLightStore.query({ id: this.model.contentLink });
        },

        _onModelChange: function () {
            // summary:
            //      Updates content settings after the model has been updated.
            // tags:
            //      protected

            this.inherited(arguments);

            if (this.model instanceof Array) {
                // this command should be available only if one item selected
                // because it should be disabled when multiple blocks are selected
                // like in Assets pane
                if (this.model.length === 1) {
                    this.model = this.model[0];
                } else {
                    this.model = null;
                }
            }

            if (!this.model) {
                return;
            }

            if (!TypeDescriptorManager.isBaseTypeIdentifier(this.model.typeIdentifier, "episerver.core.blockdata")) {
                return;
            }

            when(this._getContentData()).then(function (contentData) {
                this._refreshContentSettings(contentData);
            }.bind(this));
        },

        _refreshContentSettings: function (contentData) {
            // summary:
            //      Update the content settings
            // tags:
            //      protected

            if (contentData.missingLanguageBranch && contentData.missingLanguageBranch.isTranslationNeeded) {
                this.set("isAvailable", true);
                
                var hasAccessRights = ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Edit);
                var hasProviderSupportForEditing = ContentActionSupport.hasProviderCapability(contentData.providerCapabilityMask, ContentActionSupport.providerCapabilities.Edit);
                var isDeleted = contentData.isDeleted;
                var canExecute = hasAccessRights && hasProviderSupportForEditing && !isDeleted;
                this.set("canExecute", canExecute);

                var label = lang.replace(labsResources.inlinetranslate, {missingLanguage: contentData.missingLanguageBranch.preferredLanguage});
                this.set("label", label);
                
                return;
            }

            this.set("isAvailable", false);
            this.set("canExecute", false);
        }
    });
});
