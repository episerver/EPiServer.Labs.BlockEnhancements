require([
    "dojo/topic",
    "epi-cms/contentediting/PageDataController"
], function (topic, PageDataController) {

    var originalBuildRendering = PageDataController.prototype.buildRendering;

    PageDataController.prototype.buildRendering = function () {
        originalBuildRendering.apply(this, arguments);
        this.own(
            topic.subscribe("/epi/setcommondraftview", function (isInDraftView) {
                if (!this._previewQueryParameters) {
                    this._previewQueryParameters = {};
                }
                this._previewQueryParameters.commondrafts = isInDraftView;
                this._onViewRequireReload();
            }.bind(this)),
            topic.subscribe("/refresh/ui", function () {
                this.contentDataStore.refresh(this._currentViewModel.contentLink).then(function () {
                    if (this._previewQueryParameters && this._previewQueryParameters.commondrafts) {
                        this._onViewRequireReload();
                    }
                }.bind(this));
            }.bind(this)))
    };
});
