define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/when",
    "epi-cms/widget/ContentSelector",
    "epi-cms/ApplicationSettings",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.ilineediting"
], function (
    declare,
    lang,
    aspect,
    when,
    ContentSelector,
    ApplicationSettings,
    labsResources
) {
    return declare([], {
        browseexistingitems: "browseexistingitems",

        getTemplateString: function () {
            if (!this.blockEnhancementsOptions.contentAreaBrowse) {
                return this.inherited(arguments);
            }

            return when(this.inherited(arguments)).then(function (template) {
                template.templateString += "<br/>{" + this.browseexistingitems + "}";
                if (!template.actions) {
                    template.actions = {};
                }
                template.actions[this.browseexistingitems] = labsResources.browseexistingitems;
                return template;
            }.bind(this));
        },

        executeAction: function (actionName) {
            if (actionName === this.browseexistingitems) {
                var contentSelector = new ContentSelector({
                    roots: [ApplicationSettings.rootPage],
                    allowedTypes: this.allowedTypes,
                    showAllLanguages: false,
                    canSelectOwnerContent: false
                });
                this.own(this.dialog = contentSelector._getDialog());

                this.own(contentSelector.on("change", function (editorValue) {
                    contentSelector._getContentData(editorValue).then(function (contentData) {
                        this.model.addChild(contentData);
                        this.update(this.model.get("value"));
                    }.bind(this));
                }.bind(this)));
                this.dialog.show();

            } else {
                //TODO: parent is null in nested block scenarios when the 1st level hasn't been created yet
                if (!this.parent) {
                    this.parent = this.model;
                }

                this.inherited(arguments);
            }
        }
    });
});
