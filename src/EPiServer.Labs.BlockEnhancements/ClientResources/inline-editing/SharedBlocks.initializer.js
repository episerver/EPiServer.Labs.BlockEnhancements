require([
    "dojo/Deferred",
    "dojo/when",
    "dojo/_base/event",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "epi/dependency",
    "episerver-labs-block-enhancements/get-options",
    "epi-cms/widget/ContextualContentForestStoreModel",
    "epi-cms/contentediting/ContentReferencesNotification",
    "epi-cms/contentediting/EditToolbar",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements.ilineediting"
], function (
    Deferred,
    when,
    event,
    domConstruct,
    domStyle,
    on,
    topic,
    dependency,
    getOptions,
    ContextualContentForestStoreModel,
    ContentReferencesNotification,
    EditToolbar,
    res
) {
    var originalValueSetter = ContentReferencesNotification.prototype._valueSetter;
    ContentReferencesNotification.prototype._valueSetter = function (context) {
        if (!context.contentData.capabilities || !context.contentData.capabilities.isLocalContent) {
            originalValueSetter.apply(this, arguments);
            return;
        }

        var notificationText = domConstruct.create("div");
        domConstruct.create("span", { innerHTML: res.localcontentinfo }, notificationText);
        var openLink = domConstruct.create("a", { href: "#", innerHTML: res.clickhere, title: res.clickhere }, notificationText);
        domStyle.set(openLink, "margin", "0 4px");
        this.destroyByKey(this._clickHandleKey);
        this.ownByKey(this._clickHandleKey, on(openLink, "click", function (evt) {
            event.stop(evt);
            var enhancedStore = dependency.resolve("epi.storeregistry").get("episerver.labs.blockenhancements");
            enhancedStore.query({ contentLink: context.contentData.contentLink }).then(function(parentLink) {
                if (!parentLink) {
                    return;
                }

                topic.publish("/epi/shell/context/request", {
                    uri: "epi.cms.contentdata:///" + parentLink
                }, {});
            });
        }));
        domConstruct.create("span", { innerHTML: res.itsparent }, notificationText);

        this._backCommand.set("model", {});

        this.set("notification", {
            content: notificationText,
            commands: [this._backCommand]
        });
    }

    var originalGetRootItems = ContextualContentForestStoreModel.prototype._getRootItems;
    ContextualContentForestStoreModel.prototype._getRootItems = function () {
        var deferred = new Deferred();

        if (this.containedTypes && this.containedTypes.indexOf("episerver.core.blockdata") !== -1) {
            when(getOptions()).then(function (options) {
                this.forThisFolderEnabled = !options.hideForThisFolder;
                originalGetRootItems.apply(this, arguments).then(function (result) {
                    deferred.resolve(result);
                });
            }.bind(this))
        } else {
            originalGetRootItems.apply(this, arguments).then(function (result) {
                deferred.resolve(result);
            });
        }

        return deferred.promise;
    }

    var originalUpdateToolbarItemsModel = EditToolbar.prototype._updateToolbarItemsModel;
    EditToolbar.prototype._updateToolbarItemsModel = function () {
        when(getOptions()).then(function(options) {
            var isLocalContent = this.contentViewModel && this.contentViewModel.contentData && this.contentViewModel.contentData.capabilities.isLocalContent;
            this._getWidget("editactionpanel").domNode.classList.toggle("dijitHidden", isLocalContent);
        }.bind(this));

        return originalUpdateToolbarItemsModel.apply(this, arguments);
    }

});
