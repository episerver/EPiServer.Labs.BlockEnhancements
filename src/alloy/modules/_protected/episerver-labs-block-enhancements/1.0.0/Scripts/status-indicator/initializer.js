define([
    "dojo/aspect",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/editors/_ContentAreaTree",
    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "epi-cms/contentediting/viewmodel/ContentAreaViewModel",
    "episerver-labs-block-enhancements/status-indicator/latest-content-resolver",
    "episerver-labs-block-enhancements/status-indicator/block-tree-node-with-status"
], function(
    aspect,
    ContentReference,
    _ContentAreaTree,
    ContentBlockViewModel,
    ContentAreaEditor,
    ContentAreaViewModel,
    latestContentResolver,
    BlockTreeNodeWithStatus
) {
    return function() {
        var originalCreateTreeNode = _ContentAreaTree.prototype._createTreeNode;
        _ContentAreaTree.prototype._createTreeNode = function(model) {
            if (model.item instanceof ContentBlockViewModel) {
                var node = new BlockTreeNodeWithStatus(model);
                node.set("contextMenu", this.contextMenu);
                node.set("dndData", model.item);
                return node;
            }

            return originalCreateTreeNode.apply(this, arguments);
        };

        var originalBuildRendering = ContentAreaEditor.prototype.buildRendering;

        ContentAreaEditor.prototype.buildRendering = function() {
            originalBuildRendering.apply(this, arguments);

            this.own(aspect.after(this._dndTarget, "onDropData", function(dndData) {
            var contents = dndData.filter(function(d) {
                return d.data && d.data.contentLink;
            }).map(function(d) {
                return d.data;
            });
            latestContentResolver(contents).then(function(contentsHashMap) {
                    var children = this.model.getChildren();

                    contents.forEach(function(content) {
                        var child = children.filter(function(c) {
                            return c.contentLink === content.contentLink;
                        })[0];

                        if (child) {
                            var draft = contentsHashMap[new ContentReference(content.contentLink).id];
                            child.set("content", draft);
                        }
                    });
                }.bind(this));
            }.bind(this), true));
        };

        var originalTransformValueToModels = ContentAreaViewModel.prototype._transformValueToModels;

        ContentAreaViewModel.prototype._transformValueToModels = function(value) {
            originalTransformValueToModels.apply(this, arguments);
            latestContentResolver(value).then(function(contentsHashMap) {
                this.getChildren().forEach(function(child) {
                    var draft = contentsHashMap[new ContentReference(child.contentLink).id];
                    child.set("content", draft);
                }.bind(this));
            }.bind(this));
        };
    };
})
