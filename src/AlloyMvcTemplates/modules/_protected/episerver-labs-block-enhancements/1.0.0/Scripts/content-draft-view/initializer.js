define([
    "dojo/topic",
    "dojo/aspect",
    "epi/dependency",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/overlay/_OverlayItemInfoMixin",
    "episerver-labs-block-enhancements/content-draft-view/command-provider",
    "epi-cms/contentediting/PropertyRenderer",
    "xstyle/css!episerver-labs-block-enhancements/content-draft-view/styles.css"
], function (
    topic,
    aspect,
    dependency,
    ContentReference,
    _OverlayItemInfoMixin,
    CommandProvider,
    PropertyRenderer
) {
    var isDraftViewEnabled = false;

    function registerCommandProvider() {
        // registers new command provider which contains "Content Draft View" command

        var commandregistry = dependency.resolve("epi.globalcommandregistry");
        commandregistry.registerProvider("epi.cms.globalToolbar", new CommandProvider());
    }

    function patchOverlay() {
        // modify the overlay code so it displays the draft background in Draft View mode

        var originalPostCreate = _OverlayItemInfoMixin.prototype.postCreate;
        _OverlayItemInfoMixin.prototype.postCreate = function () {
            originalPostCreate.apply(this, arguments);

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

    function patchPropertyRenderer() {
        var originalPostCreate = PropertyRenderer.prototype.render;
        PropertyRenderer.prototype.render = function () {
            if (!this.patchPropertyRendererUpdated) {
                this.patchPropertyRendererUpdated = true;

                var self = this;
                //this.own( // PropertyRenderer doesn't have Destroyable mixin
                    aspect.around(this._xhrHandler, "xhrPost", function (original) {
                        return function (postData) {
                            if (isDraftViewEnabled) {
                                postData.url = postData.url + "&commondrafts=true";
                            }
                            return original.apply(self._xhrHandler, [postData]);
                        };
                    })
                //);
            }

            return originalPostCreate.apply(this, arguments);
        };
    }

    topic.subscribe("/epi/setcommondraftview", function (isInDraftView) {
        isDraftViewEnabled = isInDraftView;
    });

    return function () {
        registerCommandProvider();
        patchOverlay();
        patchPropertyRenderer();
    };
});
