define([
    "dojo/on",
    "dojo/_base/declare",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/dialog/Alert",
    "episerver-labs-block-enhancements/inline-editing/form-dialog",
    "epi-cms/widget/ContentTypeList",
    "epi-cms/widget/ContentType",
    "epi-cms/widget/command/CreateContentFromSelector",
    "episerver-labs-block-enhancements/create-new/create-new-block-edit-form-container",
    "episerver-labs-block-enhancements/create-new/get-tooltip",
    "epi/i18n!epi/cms/nls/episerver.cms.components.createblock",
    "epi/i18n!epi/cms/nls/episerver.shared.action",
    "xstyle/css!episerver-labs-block-enhancements/create-new/styles.css"
], function (
    on,
    declare,
    TypeDescriptorManager,
    Alert,
    FormDialog,
    ContentTypeList,
    ContentType,
    CreateContentFromSelector,
    CreateNewBlockEditFormContainer,
    getTooltip,
    res,
    shared
) {

    return function() {
        var originalRender = ContentType.prototype.render;
        ContentType.prototype.render = function () {
            originalRender.apply(this, arguments);
            this.domNode.title = getTooltip(this.contentType);
        };

        var originalSwitchView = CreateContentFromSelector.prototype._switchView;
        CreateContentFromSelector.prototype._switchView = function(content) {
            var autoPublish = this.autoPublish;
            var model = this.model;
            if (!this.createAsLocalAsset) {
                return originalSwitchView.apply(this, arguments);
            }

            var _this = this;
            var dialog;
            var contentTypeList = new ContentTypeList({
                allowedTypes: this.allowedTypes,
                restrictedTypes: this.restrictedTypes,
                localAsset: true,
                parentLink: content.contentLink,
                onContentTypeSelected: function (selectedType) {
                    var editDialog = new FormDialog({
                        title: shared["new"] + " " + selectedType.localizedName
                    });

                    if (dialog) {
                        dialog.hide();
                    }

                    var form = new CreateNewBlockEditFormContainer({
                        autoPublish: autoPublish,
                        addToDestination: model
                    }, editDialog.content, "last");

                    editDialog.own(on(form, "isDirty", function (isDirty) {
                        editDialog.toggleDisabledSaveButton(!isDirty);
                    }));

                    editDialog.own(on(form, "FormCreated", function () {
                        editDialog.show();
                        editDialog.togglePublishButton(false);
                        editDialog.toggleDisabledSaveButton(true);
                    }));

                    form.reloadMetadata(content, selectedType.id);

                    _this.own(on(editDialog, "execute", form.saveForm.bind(form)));
                    editDialog.own(form);
                    _this.own(editDialog);
                }
            });

            _this.own(contentTypeList.watch("shouldSkipContentTypeSelection", function () {
                if (contentTypeList.get("shouldSkipContentTypeSelection")) {
                    return;
                }

                dialog = new Alert({
                    acknowledgeActionText: epi.resources.action.close,
                    closeIconVisible: false,
                    content: contentTypeList,
                    dialogClass: "epi-dialog-portrait inline-edit-dialog",
                    title: res.title
                });

                dialog.show();
                dialog.containerNode.classList.add("create-content-dialog");
                _this.own(dialog);
                contentTypeList._suggestedContentTypes.setVisibility(false);
            }));
            contentTypeList.set("requestedType", "episerver.core.blockdata");
            contentTypeList.refresh();
            _this.own(contentTypeList);
        };
    };
})
