define([
    "dojo/aspect",
    "dojo/topic",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/editors/_ContentAreaTree",
    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "epi-cms/contentediting/viewmodel/ContentAreaViewModel",
    "episerver-labs-block-enhancements/status-indicator/latest-content-resolver",
    "episerver-labs-block-enhancements/status-indicator/block-tree-node-with-status"
], function(
    aspect,
    topic,
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

            this.own(aspect.after(this.model, "addChild", function(item) {
                // Set content property when an item is added to ContentArea
                // Early exit if contentLink is missing.
                if(!item.contentLink) {
                    return;
                }

                latestContentResolver([item]).then(function(contentsHashMap) {
                    var draft = contentsHashMap[new ContentReference(item.contentLink).id];
                    var children = this.model.getChildren();

                    children.forEach(function(child) {
                        if(child.contentLink === item.contentLink) {
                            child.set("content", draft);
                        }
                    });
                }.bind(this));
            }.bind(this), true));

            // listen content area item status changed and update item tree node
            this.own(
                topic.subscribe("/epi/cms/content/statuschange/", function(status, contentIdentity) {
                    var updatedContentId = new ContentReference(contentIdentity.id).id;

                    var children = this.model.getChildren();
                    var filteredChildren = children.filter(function (c) {
                        return new ContentReference(c.contentLink).id === updatedContentId;
                    });
                    if (filteredChildren.length === 0) {
                        return;
                    }
                    latestContentResolver([{contentLink: updatedContentId.toString()}]).then(function(contents) {
                        filteredChildren.forEach(function (c) {
                            c.set("content", contents[updatedContentId]);
                        });
                    });

                }.bind(this))
            );
        };
    };
});
