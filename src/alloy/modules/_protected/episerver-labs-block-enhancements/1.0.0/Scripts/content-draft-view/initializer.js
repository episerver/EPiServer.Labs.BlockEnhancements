define([
    "dojo/topic",
    "epi/dependency",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/overlay/_OverlayItemInfoMixin",
    "episerver-labs-block-enhancements/content-draft-view/command-provider"
], function (
    topic,
    dependency,
    ContentReference,
    _OverlayItemInfoMixin,
    CommandProvider
) {
    var isDraftViewEnabled = false;

    return function () {
        var commandregistry = dependency.resolve("epi.globalcommandregistry");
        commandregistry.registerProvider("epi.cms.globalToolbar", new CommandProvider());

        var originalPostCreate = _OverlayItemInfoMixin.prototype.postCreate;
        _OverlayItemInfoMixin.prototype.postCreate = function () {
            originalPostCreate.apply(this, arguments);

            this.own(
                topic.subscribe("/epi/setcommondraftview", function (isInDraftView) {
                    isDraftViewEnabled = isInDraftView;
                }));

            var _this = this;

            function isDraft() {
                if (_this.params &&
                    _this.params.sourceItemNode &&
                    _this.params.sourceItemNode.dataset &&
                    _this.params.sourceItemNode.dataset.epiBlockId) {
                    var contentReference = new ContentReference(_this.params.sourceItemNode.dataset.epiBlockId);

                    return contentReference.workId;
                }
                return false;
            }

            _this.own(_this.viewModel.watch("contentStatus", function () {
                if (isDraftViewEnabled && isDraft()) {
                    var overlayItemInfo = _this.get("overlayItemInfo");
                    overlayItemInfo.set("class", "epi-overlay-content-invisible");
                }
            }));
        };
    }
});
