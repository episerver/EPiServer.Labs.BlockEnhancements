define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/command/CreateContentFromSelector",
    "episerver-labs-block-enhancements/editors/browsable-content-area-mixin",
    "epi-cms/contentediting/editors/ContentAreaEditor",
    "episerver-labs-block-enhancements/inline-editing/commands/update-translate-command"
], function (
    declare,
    lang,
    topic,
    ContentReference,
    CreateContentFromSelector,
    browsableContentAreaMixin,
    ContentAreaEditor,
    updateInlineTranslateCommands
) {
    return declare([ContentAreaEditor, browsableContentAreaMixin], {
        blockEnhancementsOptions: {},

        update: function (value) {
            this.set("value", value);
            if (this.parent) {
                this.parent.set("editing", true);
            }
            this.onChange(value);
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.blockEnhancementsOptions.localContentFeatureEnabled) {
                this.own(topic.subscribe("/epi/cms/content/statuschange/", lang.hitch(this, this._onContentSaved)));
            }
        },
        postMixInProperties: function () {
            this.inherited(arguments);

            if (this.blockEnhancementsOptions.inlineTranslate || this.blockEnhancementsOptions.localContentFeatureEnabled) {
                updateInlineTranslateCommands(this);
            }
        },
        _onContentSaved: function (status, contentIdentity, isLocalContent) {
            if (!isLocalContent) {
                return;
            }

            var contentLink = contentIdentity.id;
            if (!this.value) {
                return;
            }

            this.value.forEach(function (contentAreaItem) {
                if (!ContentReference.compareIgnoreVersion(contentAreaItem.contentLink, contentLink)) {
                    return;
                }

                //TODO: LOCALBLOCKS: think about using emit/on instead of topics
                topic.publish("updateChangedProperty");

            }.bind(this));
        },
        executeAction: function (actionName) {
            // summary:
            //      Overridden mixin class executing click actions from textWithLinks widget
            // actionName: [String]
            //      Action name of link on content area
            // tags:
            //      public

            if (actionName === "createnewblock") {
                // HACK: Preventing the onBlur from being executed so the editor wrapper keeps this editor in editing state
                this._preventOnBlur = true;

                // since we're going to create a block, we need to hide all validation tooltips because onBlur is prevented here
                this.validate(false);
                var command = new CreateContentFromSelector({
                    creatingTypeIdentifier: "episerver.core.blockdata",
                    createAsLocalAsset: true,
                    isInQuickEditMode: this.isInQuickEditMode,
                    autoPublish: true,
                    allowedTypes: this.allowedTypes,
                    restrictedTypes: this.restrictedTypes
                });

                command.set("model", {
                    save: lang.hitch(this, function (block) {
                        this._preventOnBlur = false;
                        var value = lang.clone(this.get("value"), true) || [];
                        this.localBlocks.push(block.contentLink);
                        value.push(block);
                        this.set("value", value);

                        // In order to be able to add a block when creating it from a floating editor
                        // we need to set the editing parameter on the editors parent wrapper to true
                        // since it has been set to false while being suspended when switching to
                        // the secondaryView.
                        this.parent = this.parent || this.getParent();
                        this.parent.set("editing", true);
                        this.onChange(value);

                        // Now call onBlur since it's been prevented using the _preventOnBlur flag.
                        this.onBlur();
                    }),
                    cancel: lang.hitch(this, function () {
                        this._preventOnBlur = false;
                        this.onBlur();
                    })
                });
                command.execute();
            }
        }
    });
});
