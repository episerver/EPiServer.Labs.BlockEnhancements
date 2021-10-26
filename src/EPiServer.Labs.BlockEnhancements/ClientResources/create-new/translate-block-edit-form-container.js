define([
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/Deferred",
    "dojo/when",
    "epi/dependency",
    "epi-cms/contentediting/inline-editing/BlockEditFormContainer",
    "epi-cms/contentediting/viewmodel/CreateLanguageBranchViewModel"
], function (
    declare,
    topic,
    Deferred,
    when,
    dependency,
    BlockEditFormContainer,
    CreateLanguageBranchViewModel) {
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
            // value can be null when the property Name field is hiden
            var contentName = this.value && (this.value.name || this.value.icontent_name) || this.get("masterContentName");
            if (contentName) {
                this.createContentViewModel.set("contentName", contentName);
            } else {
                this.createContentViewModel.set("autoGenerateName", true);
            }
            this.createContentViewModel.set("properties", this.value);
            this.createContentViewModel.set("languageBranch", this.createContentViewModel.parent.missingLanguageBranch.preferredLanguage);
            this.createContentViewModel.set("masterLanguageVersionId", this.createContentViewModel.parent.contentLink);
            this.createContentViewModel.save();
            return deferred.promise;
        }
    });
});
