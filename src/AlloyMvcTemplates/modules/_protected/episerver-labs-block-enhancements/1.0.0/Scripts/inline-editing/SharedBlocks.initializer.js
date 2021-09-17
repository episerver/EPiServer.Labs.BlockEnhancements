require([
    "dojo/Deferred",
    "dojo/when",
    "epi/routes",
    "epi/shell/XhrWrapper",
    "epi-cms/widget/ContextualContentForestStoreModel"
], function (
    Deferred,
    when,
    routes,
    XhrWrapper,
    ContextualContentForestStoreModel
) {
    var options = null;

    function getOptions() {
        if (options) {
            return options;
        }

        var deferred = new Deferred();
        var xhrHandler = new XhrWrapper();

        var url = routes.getRestPath({
            moduleArea: "episerver-labs-block-enhancements",
            storeName: "episerverlabsblockenhancementsoptions"
        });

        xhrHandler.xhrGet({url: url}).then(function (result) {
            options = JSON.parse(result);
            deferred.resolve(options);
        });

        return deferred.promise;
    }

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
