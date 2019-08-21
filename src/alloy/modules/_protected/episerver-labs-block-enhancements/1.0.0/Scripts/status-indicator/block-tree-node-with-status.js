define([
    "dojo/_base/declare",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/when",
    "epi/string",
    "epi-cms/widget/viewmodel/ContentStatusViewModel",
    "epi-cms/widget/_ContentTreeNodeMixin",
    "epi-cms/ContentLanguageHelper",
    "epi-cms/contentediting/editors/_BlockTreeNode",
    "dojo/text!./block-status-indicator.html",
    "xstyle/css!./block-status-indicator.css"
], function(
    declare,
    domAttr,
    domClass,
    when,
    epiString,
    ContentStatusViewModel,
    _ContentTreeNodeMixin,
    ContentLanguageHelper,
    _BlockTreeNode,
    template
) {
    var rolePresentationNbspSpan = 'role="presentation">&nbsp;</span>';

    // inject custom html into the default template
    var newTemplate =
        _BlockTreeNode.prototype.templateString.replace(rolePresentationNbspSpan,
            rolePresentationNbspSpan + template);

    return declare([_BlockTreeNode, _ContentTreeNodeMixin], {
        // summary:
        //      Extends the default _BlockTreeNode with Tree specific status information (isLocalBlock, language, contentStatus)

        content: null,

        templateString: newTemplate,

        _updateIndividualLayout: function() {
            this.inherited(arguments);
            this._setContentInfo();
        },

        buildRendering: function() {
            this.inherited(arguments);
            this.own(this.item.watch("content", function() {
                this._setContentInfo();
            }.bind(this)));
        },

        _setContentInfo: function() {
            if (!this.item || !this.item.content) {
                return;
            }
            var content = this.item.content;

            if (content.capabilities) {
                this.set("isLocalContent", content.capabilities.isLocalContent);
            }

            var contentStatusViewModel = new ContentStatusViewModel();
            //TODO:PR TO CMS-UI
            // this should return promise, it will be added in epi-cms/widget/viewModel/ContentStatusViewModel
            contentStatusViewModel.set("contentStatus", content.status)
            setTimeout(function() {
                this.set("statusIcon", contentStatusViewModel.statusIcon);
                this.set("statusMessage", contentStatusViewModel.statusMessage);
            }.bind(this), 0);

            this._setMissingLanguageStatus(content);
        },

        _setMissingLanguageStatus: function(content) {
            if (content.missingLanguageBranch) {
                this._addLanguageIndicatorForItem(content);
            } else {
                this._removeLanguageIndicator();
            }
        },

        _addLanguageIndicatorForItem: function(item) {
            //TODO:PR TO CMS-UI, it will be added to epi-cms/widget/_ContentTreeNodeMixin

            var missingLanguageBranch = item.missingLanguageBranch;

            if (this.iconNodeLanguage) {
                this.iconNodeLanguage.innerHTML = missingLanguageBranch.language || "";
                when(ContentLanguageHelper.getMissingLanguageMessage(item), function(message) {
                    domAttr.set(this.iconNodeLanguage, "title", message || "");
                }.bind(this));
            }

            domClass.add(this.rowNode, this._missingLanguageCssClass);
        },

        _setIsLocalContentAttr: function(isLocalContent) {
            domClass.toggle(this.iconNodeLocal, "dijitHidden", !isLocalContent);
        },

        _setStatusIconAttr: function(cssClasses) {
            if (!this.iconNodeStatus) {
                return;
            }

            if (!(cssClasses instanceof Array)) {
                return;
            }

            domClass.remove(this.iconNodeStatus);

            domClass.add(this.iconNodeStatus, "dijitTreeIcon epi-extraIcon");
            cssClasses.forEach(function(cssClass) {
                domClass.add(this.iconNodeStatus, cssClass);
            }, this);
        },

        _setStatusMessageAttr: function(/* String */message) {
            if (!this.iconNodeStatus) {
                return;
            }

            domAttr.set(this.iconNodeStatus, "title", epiString.toTooltipText(message));
        },
    });
});
