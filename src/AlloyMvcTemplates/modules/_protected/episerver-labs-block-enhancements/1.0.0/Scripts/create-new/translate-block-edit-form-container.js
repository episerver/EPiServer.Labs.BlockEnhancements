define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/when",
    "epi/dependency",
    "episerver-labs-block-enhancements/inline-editing/block-edit-form-container",
    "epi-cms/contentediting/viewmodel/CreateLanguageBranchViewModel",
    "dojo/date/locale"
], function (
    declare,
    topic,
    when,
    dependency,
    BlockEditFormContainer,
    CreateLanguageBranchViewModel,
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

            this._contentLightStore = dependency.resolve("epi.storeregistry").get("epi.cms.content.light");

            this.createContentViewModel = new CreateLanguageBranchViewModel({
                createAsLocalAsset: true,
                ignoreDefaultNameWarning: true
            });

            this.createContentViewModel.on("saveSuccess", function (result) {
                if (!result) {
                    return;
                }
                topic.publish("/epi/cms/content/statuschange/", null, {id: result.newContentLink});
                topic.publish("/refresh/ui");
            }.bind(this));
        },

        reloadMetadata: function (parent, contentTypeId) {
            this.createContentViewModel.set({
                parent: parent,
                contentTypeId: contentTypeId
            });

            return when(this._contentLightStore.get(parent.contentLink)).then(function (masterContent) {
                return this.createContentViewModel._getMetadata(parent.contentLink, contentTypeId).then(function (metadata) {
                    this.set("metadata", metadata);
                    this.set("masterContentName", masterContent.name);
                }.bind(this));
            }.bind(this));
        },

        saveForm: function () {
            var deferred = new Deferred();
            var saveHandle = this.createContentViewModel.on("saveSuccess", function () {
                saveHandle.remove();
                errorHandle.remove();
                deferred.resolve();
            });
            var errorHandle = this.createContentViewModel.on("saveError", function () {
                saveHandle.remove();
                errorHandle.remove();
                deferred.resolve();
            });
            var contentName = this.value.name || this.value.icontent_name || this.get("masterContentName") || getName();
            this.createContentViewModel.set("contentName", contentName);
            this.createContentViewModel.set("properties", this.value);
            this.createContentViewModel.set("languageBranch", this.createContentViewModel.parent.missingLanguageBranch.preferredLanguage);
            this.createContentViewModel.set("masterLanguageVersionId", this.createContentViewModel.parent.contentLink);
            this.createContentViewModel.save();
            return deferred.promise;
        }
    });
});
