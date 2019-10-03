define([
    "dojo/mouse",
    "dojo/on",
    "epi-cms/plugin-area/assets-pane",
    "epi-cms/contentediting/editors/_BlockTreeNode",
    "epi-cms/widget/overlay/ContentArea",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/widget/overlay/_OverlayItemInfoMixin",
    "episerver-labs-block-enhancements/inline-editing/commands/block-menu-inline-edit",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.ilineediting"
], function (
    mouse,
    on,
    assetsPanePluginArea,
    _BlockTreeNode,
    ContentArea,
    TypeDescriptorManager,
    _OverlayItemInfoMixin,
    BlockMenuInlineEditCommand,
    labsResources
) {
    function patchContentAreaOverlay() {
        // prevent showing the floating editor after double clicking
        var originalPostCreate = ContentArea.prototype.postCreate;
        ContentArea.prototype.postCreate = function () {
            var timeout;

            this.own(on(this.domNode, "click", function (e) {
                    e.stopImmediatePropagation();
                    if (e.detail === 1) {
                        timeout = setTimeout(function () {
                            this.onClick(this, e);
                        }.bind(this), 500);
                    }

                    if (e.detail === 2) {
                        clearTimeout(timeout);
                    }
                }.bind(this))
            );

            originalPostCreate.apply(this, arguments);
        };
    }

    function patchContentAreaItemOverlay() {
        var originalPostCreate = _OverlayItemInfoMixin.prototype.postCreate;
        _OverlayItemInfoMixin.prototype.postCreate = function () {
            originalPostCreate.apply(this, arguments);

            if (!TypeDescriptorManager.isBaseTypeIdentifier(this.viewModel.typeIdentifier, "episerver.core.blockdata")) {
                return;
            }

            var inlineEditCommand = new BlockMenuInlineEditCommand();
            this.own(inlineEditCommand);
            var node = this.get("containerDomNode");
            node.title = labsResources.doubleclicktoinlineedit;
            this.own(on(node, "dblclick", function () {
                inlineEditCommand.set("model", this.viewModel);
                inlineEditCommand.execute();
            }.bind(this)));
        }
    }

    function patchEditor() {
        var originalBuildRendering = _BlockTreeNode.prototype.buildRendering;
        _BlockTreeNode.prototype.buildRendering = function () {
            originalBuildRendering.apply(this, arguments);

            if (!TypeDescriptorManager.isBaseTypeIdentifier(this.item.typeIdentifier, "episerver.core.blockdata")) {
                return;
            }

            this.tooltip += "\n" + labsResources.doubleclicktoinlineedit;
            var inlineEditCommand = new BlockMenuInlineEditCommand();
            this.own(inlineEditCommand);

            this.own(on(this.domNode, "dblclick", function () {
                inlineEditCommand.set("model", this.item);
                inlineEditCommand.execute();
            }.bind(this)));
        }
    }

    return function inlineEditingInitialize() {
        patchContentAreaOverlay();
        patchContentAreaItemOverlay();
        patchEditor();
        assetsPanePluginArea.add(BlockMenuInlineEditCommand);
    };
});
