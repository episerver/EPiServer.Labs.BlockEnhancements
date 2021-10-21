require([
    "dojo/Deferred",
    "dojo/when",
    "episerver-labs-block-enhancements/get-options",
    "epi-cms/widget/ContextualContentForestStoreModel"
], function (
    Deferred,
    when,
    getOptions,
    ContextualContentForestStoreModel
) {
    var originalGetRootItems = ContextualContentForestStoreModel.prototype._getRootItems;
    ContextualContentForestStoreModel.prototype._getRootItems = function () {
        var deferred = new Deferred();

        if (this.containedTypes && this.containedTypes.indexOf("episerver.core.blockdata") !== -1) {
            when(getOptions()).then(function (options) {
                this.forThisFolderEnabled = !options.hideForThisFolder;
                originalGetRootItems.apply(this, arguments).then(function (result) {
                    deferred.resolve(result);
                });
            }.bind(this))
        } else {
            originalGetRootItems.apply(this, arguments).then(function (result) {
                deferred.resolve(result);
            });
        }

        return deferred.promise;
    }
});
