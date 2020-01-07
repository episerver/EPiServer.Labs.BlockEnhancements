define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/block-edit-form-container",
    "epi-cms/contentediting/viewmodel/CreateContentViewModel",
    "dojo/date/locale"
], function (
    declare,
    BlockEditFormContainer,
    CreateContentViewModel,
    locale) {

    function format(date, fmt) {
        return locale.format( date, {selector:"date", datePattern:fmt } );
    };

    function getName() {
        return "Block" + format(new Date(), "yyyyMMddhhmmss");
    }

    return declare([BlockEditFormContainer], {
        postMixInProperties: function () {
            this.inherited(arguments);

            this.createContentViewModel = new CreateContentViewModel({
                createAsLocalAsset: true,
                ignoreDefaultNameWarning: true
            });
        },

        _setAddToDestinationAttr: function (model) {
            this.createContentViewModel.set("addToDestination", model);
        },

        _setAutoPublishAttr: function (autoPublish) {
            this.createContentViewModel.set("autoPublish", autoPublish);
        },

        reloadMetadata: function (parent, contentType) {
            this.createContentViewModel.set({
                parent: parent,
                contentTypeId: contentType.id
            });

            return this.createContentViewModel._getMetadata(parent.contentLink, contentType.id).then(function (metadata) {
                this.set("metadata", metadata);
            }.bind(this));
        },

        saveForm: function () {
            this.createContentViewModel.set("contentName", this.value.name || getName());
            this.createContentViewModel.set("properties", this.value);
            this.createContentViewModel.save();
        }
    });
});
