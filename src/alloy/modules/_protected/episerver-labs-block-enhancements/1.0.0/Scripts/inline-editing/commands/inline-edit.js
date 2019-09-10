define([
        "dojo/_base/declare",
        "dojo/on",
        "dojo/topic",
        "dojo/when",
        //EPi
        "epi/dependency",
        "epi/shell/TypeDescriptorManager",

        "epi-cms/core/ContentReference",
        "epi-cms/contentediting/ContentActionSupport",
        "epi/shell/command/_Command",

        "episerver-labs-block-enhancements/inline-editing/form-dialog",
        "episerver-labs-block-enhancements/inline-editing/block-edit-form-container",
        "episerver-labs-block-enhancements/inline-editing/commands/inline-publish",

        "xstyle/css!episerver-labs-block-enhancements/inline-editing/inline-edit.css"
    ],

    function (
        declare,
        on,
        topic,
        when,

        dependency,
        TypeDescriptorManager,

        ContentReference,
        ContentActionSupport,
        _Command,
        FormDialog,
        FormContainer,
        InlinePublish
    ) {

        return declare([_Command], {
            // summary:
            //      Show inline block edit dialog

            label: "Inline block edit",

            iconClass: "epi-iconPen",

            category: "menuWithSeparator",

            _execute: function () {
                // summary:
                //    Executes this command; Displays editing dialog
                //

                var dialog = new FormDialog({
                    title: this.model.name
                });
                dialog.show();

                var isDirty = false;
                var inlinePublishCommand = new InlinePublish();

                function updatePublishCommandVisibility() {
                    if (!dialog) {
                        return;
                    }
                    var isVisible = inlinePublishCommand.get("isAvailable") && inlinePublishCommand.get("canExecute");
                    dialog.togglePublishButton(isVisible);
                }

                var isAvailableHandle = inlinePublishCommand.watch("isAvailable", updatePublishCommandVisibility.bind(this));
                var canExecuteHandle = inlinePublishCommand.watch("canExecute", updatePublishCommandVisibility.bind(this));
                var labelHandle = inlinePublishCommand.watch("label", function (value) {
                    if (!dialog) {
                        return;
                    }
                    dialog.setPublishLabel(inlinePublishCommand.label);
                }.bind(this));

                var form = new FormContainer({}, dialog.content, "last");
                form.set("contentLink", this.model.contentLink).then(function () {
                    inlinePublishCommand.set("model", this.model);
                }.bind(this));

                var formCreatedHandle = on(form, "FormCreated", function () {
                    if (!form._model.canChangeContent()) {
                        dialog.hideSaveButton();
                        dialog.set("closeText", "Close");
                    }

                    updatePublishCommandVisibility();

                }.bind(this));

                var onChangeHandle = on(form, "change", function () {
                    isDirty = true;
                });

                var executeHandle = on(dialog, "execute", form.saveForm.bind(form));

                var publishHandle = on(dialog, "Publish", function () {
                    var deferred = true;
                    if (isDirty) {
                        deferred = form.saveForm();
                    }
                    when(deferred).then(function () {
                        inlinePublishCommand.execute().then(function () {
                            dialog.hide();
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

            _onModelChange: function () {
                // summary:
                //		Updates isAvailable after the model has been updated.

                this.inherited(arguments);

                if (!TypeDescriptorManager.isBaseTypeIdentifier(this.model.typeIdentifier, "episerver.core.blockdata")) {
                    this.set("isAvailable", false);
                    return;
                }

                this.set("isAvailable", true);
                this.set("canExecute", !this.model.readOnly);
            }
        });
    });
