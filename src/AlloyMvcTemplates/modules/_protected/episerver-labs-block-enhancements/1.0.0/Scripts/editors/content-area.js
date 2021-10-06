define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic",
    "dojo/json",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-construct",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/overlay/ContentArea",
    "epi-cms/widget/overlay/Block",
    "epi-cms/widget/command/CreateContentFromSelector",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "episerver-labs-block-enhancements/editors/browsable-content-area-mixin",
    "episerver-labs-block-enhancements/inline-editing/commands/update-translate-command",
    "dojo/text!../inline-editing/Block.html"
], function (
    declare,
    lang,
    array,
    topic,
    json,
    domAttr,
    domStyle,
    domConstruct,
    ContentReference,
    ContentArea,
    Block,
    CreateContentFromSelector,
    ContentAreaCommands,
    browsableContentAreaMixin,
    updateInlineTranslateCommands,
    template
) {
    var CustomBlockClass = declare([Block], {
        blockEnhancementsOptions: {},
        templateString: template,

        postCreate: function () {
            this.commandProvider = new ContentAreaCommands({model: this.viewModel});

            if (this.blockEnhancementsOptions.inlineTranslate || this.blockEnhancementsOptions.localContentFeatureEnabled) {
                updateInlineTranslateCommands(this.commandProvider);
            }

            this.inherited(arguments);

            this.own(this.viewModel.watch("statusMessage", lang.hitch(this, function (propertyName, oldValue, newValue) {
                domStyle.set(this.iconsContainer, "display", this.viewModel.contentGroup || newValue || !this.isLocalBlock ? "" : "none");
            })));
        },

        buildRendering: function () {
            this.inherited(arguments);
            domStyle.set(this.sharedContentIcon, "display", !this.isLocalBlock ? "" : "none");
        }
    });
    return declare([ContentArea, browsableContentAreaMixin], {
        blockEnhancementsOptions: {},
        blockClass: CustomBlockClass,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.model.set("value", this._getClonedValue());
            this.model.set("localBlocks", this.localBlocks);
        },

        postCreate: function () {
            CustomBlockClass.prototype.blockEnhancementsOptions = this.blockEnhancementsOptions;
            this.inherited(arguments);

            if (this.blockEnhancementsOptions.localContentFeatureEnabled) {
                this.own(topic.subscribe("/epi/cms/content/statuschange/", lang.hitch(this, this._onContentSaved)));
            }
        },

        update: function (value) {
            this.onValueChange({
                propertyName: this.name,
                value: value
            });
        },

        _onContentSaved: function (status, contentIdentity, isLocalContent) {
            if (!isLocalContent) {
                return;
            }

            var contentLink = contentIdentity.id;
            var currentValue = this.model.get("value");
            if (!currentValue) {
                return;
            }

            currentValue.forEach(function (contentAreaItem) {
                if (!ContentReference.compareIgnoreVersion(contentAreaItem.contentLink, contentLink)) {
                    return;
                }

                //TODO: LOCALBLOCKS: think about using emit/on instead of topics
                topic.publish("updateChangedProperty", this.name);
            }.bind(this));
        },

        _getClonedValue: function () {
            var value = this.contentModel.get(this.name);
            if (!value) {
                return value;
            }

            var clone = lang.clone(value);
            clone.forEach(function (item) {
                item.contentLink = new ContentReference(item.contentLink).createVersionUnspecificReference().toString();
            });

            return clone;
        },

        _createBlock: function (node) {
            // summary:
            //      Creates a single block.

            var id = domAttr.get(node, "data-epi-block-id"),
                contentGuid = domAttr.get(node, "data-epi-content-id"),
                info = json.parse(domAttr.get(node, "data-epi-block-personalization")),
                contentGroup = info ? info.contentGroup : this.defaultWatchKey,
                model = this.model;

            // Get the view model for the item's group.
            if (contentGroup) {
                model = model.getChild({name: contentGroup});
            }

            var childPredicate;
            var isLocalBlock = false;
            if (id) {
                childPredicate = (child) => {
                    return ContentReference.compareIgnoreVersion(child.contentLink, id);
                }
                isLocalBlock = this.localBlocks.indexOf(new ContentReference(id).createVersionUnspecificReference().toString()) !== -1;
            } else if (contentGuid) {
                childPredicate = (child) => {
                    return child.contentGuid === contentGuid;
                }
            }

            if (!model) {
                return;
            }

            // Get the view model for the item.
            var childViewModel = model.getChildren().find(childPredicate);

            if (!childViewModel) {
                // Happens when we're notified about model updates, but the markup hasn't
                // been refreshed yet so the block info grabbed from dom doesn't match the model.
                // Should sort itself out once new markup arrives.
                return;
            }

            // TODO: Pass context menu through instead of provider.
            var block = new this.blockClass({
                disabled: this.disabled,
                viewModel: childViewModel,
                isLocalBlock: isLocalBlock,
                sourceItemNode: node
            });

            this.addChild(block);

            this._watches["block_" + id + "_ensurePersonalization"] = childViewModel.watch("ensurePersonalization", lang.hitch(this, function (propertyName, oldValue, newValue) {

                var index = array.indexOf(this._pendingPersonalizations, childViewModel);

                if (newValue) {

                    // add if it doesn't exist
                    if (index < 0) {
                        this._pendingPersonalizations.push(childViewModel);
                    }
                } else {
                    // remove if exists
                    if (index > 0) {
                        this._pendingPersonalizations.splice(index, 1);
                    }
                }

            }));

            // Mark the block's model as visible.
            childViewModel.set("visible", true);

            // Add the block's node to the drag and drop souce.

            this._source.setItem(block.domNode.id, {
                name: childViewModel.name,
                data: childViewModel,
                type: this.allowedDndTypes
            });
        },

        refresh: function () {
            // summary:
            //      Recreate block overlay item for the current content area.
            // tags:
            //      public
            this._actionNodeHeight = null;

            // Destroy all the child blocks and clear the drag and drop items from the source.
            this.destroyDescendants();
            this._source.clearItems();
            if (this._source.anchor) {
                domConstruct.destroy(this._source.anchor);
            }

            // Destroy all the current blocks and reset the map.
            for (var i in this._watches) {
                this._watches[i].remove();
            }
            this._watches = {};

            this._supressValueChanged = true;

            // Update model to the latest value and recreate the blocks from the DOM.
            this.model.set("value", this._getClonedValue());
            this._setupBlocks();

            this.inherited(arguments);

            this._supressValueChanged = false;
        },

        executeAction: function (actionName) {
            // summary:
            //      Overidden mixin class, listen acion clicked on textWithLinks widget
            // actionName: [String]
            //      Action name of link on content area
            // tags:
            //      public

            if (actionName === "createnewblock") {

                // TODO: destroy and dereference command when done
                var command = new CreateContentFromSelector({
                    creatingTypeIdentifier: "episerver.core.blockdata",
                    createAsLocalAsset: true,
                    treatAsSecondaryView: true,
                    isInQuickEditMode: this.isInQuickEditMode,
                    autoPublish: true,
                    allowedTypes: this.allowedTypes,
                    restrictedTypes: this.restrictedTypes
                });

                command.set("model", {
                    save: lang.hitch(this, function (block) {
                        var value = lang.clone(this.model.get("value"), true) || [];
                        value.push(block);
                        this.localBlocks.push(new ContentReference(block.contentLink).createVersionUnspecificReference().toString());

                        this.onValueChange({
                            propertyName: this._source.propertyName,
                            value: value
                        });
                    })
                });

                command.execute();

            } else {
                this.inherited(arguments);
            }
        }
    });
});
