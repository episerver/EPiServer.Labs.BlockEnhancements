define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/aspect",
    "dojo/on",
    "dojo/when",
    "dojo/Evented",
    "dojo/store/util/QueryResults",

    "dijit/_TemplatedMixin",
    "dijit/form/CheckBox",
    "dgrid/tree",

    "epi-cms/dgrid/formatters",
    "epi/dependency",
    "epi-cms/widget/_GridWidgetBase",
    "dojo/text!./content-dependencies.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferences",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel.publishactionmenu",
    "epi/i18n!epi/cms/nls/episerverlabs.blockenhancements",
    "xstyle/css!./content-dependencies.css"
], function (
    declare,
    lang,
    domClass,
    domConstruct,
    domStyle,
    aspect,
    on,
    when,
    Evented,
    QueryResults,
    _TemplatedMixin,
    CheckBox,
    tree,
    formatters,
    dependency,
    _GridWidgetBase,
    template,
    resources,
    publishResources,
    labsResources
) {

    return declare([_GridWidgetBase, _TemplatedMixin, Evented], {
        res: resources,
        templateString: template,
        storeKeyName: "episerver.labs.blockenhancements",
        contextChangeEvent: "none",
        trackActiveItem: false,
        selectionMode: "none",

        postMixInProperties: function () {
            this.inherited(arguments);
            this.store = lang.delegate(this.store, {
                getChildren: function (object) {
                    return new QueryResults(object.references);
                },

                mayHaveChildren: function (object) {
                    return !!object.references && object.references.length > 0;
                }
            });

            this.own(aspect.before(this.store, "query", function () {
                this.noDataMessageNode.innerHTML = labsResources.loadingitems;
                domClass.remove(this.noDataNode, "dijitHidden");
                domClass.add(this.gridNode, "dijitHidden");
            }.bind(this)));

            this.own(aspect.after(this.store, "query", function (results) {
                when(results).then(this._afterStoreQuery.bind(this));
                return results;
            }.bind(this)));
        },

        buildRendering: function () {
            var self = this;
            var linkTemplate = this._getLinkTemplate();

            var gridSettings = lang.mixin({
                columns: {
                    name: tree({
                        label: labsResources.name,
                        renderCell: this._renderContentItem.bind(this),
                        shouldExpand: function () {
                            return true;
                        }
                    }),
                    treePath: {
                        label: " ",
                        className: "epi-width30",
                        get: function (item) {
                            return (item.treePath || []).join(" > ");
                        },
                        ellipsis: true
                    },
                    changed: {
                        label: labsResources.changed,
                        className: "epi-width15",
                        ellipsis: true
                    },
                    changedBy: {
                        label: labsResources.by,
                        className: "epi-width10",
                        ellipsis: true
                    },
                    uri: {
                        className: "epi-width5 epi-grid-column--centered",
                        label: " ",
                        formatter: function (value) {
                            return value ? linkTemplate : "";
                        },
                        sortable: false
                    },
                    selected: {
                        label: " ",
                        className: "epi-width5 epi-grid-column--centered",
                        renderCell: function (object, value, node) {
                            var current = self.get("allContentLinks") || [];
                            var canBePublished = typeof object.canBePublished !== "undefined" ? object.canBePublished : true;
                            var readOnly = !canBePublished || object.isPartOfActiveApproval;
                            if (!readOnly) {
                                current.push(object.contentLink);
                            }
                            self.set({allContentLinks: current});
                            self.set({selectedContentLinks: current});
                            var title = "";
                            if (!canBePublished) {
                                title = publishResources.notmodifiedsincelastpublish;
                            }
                            if (object.isPartOfActiveApproval) {
                                title = labsResources.command.partofapproval
                            }
                            var checkBox = new CheckBox({
                                value: object.contentLink,
                                checked: !readOnly,
                                readOnly: readOnly,
                                title: title
                            });
                            self.own(checkBox, checkBox.on("change", function (isChecked) {
                                var current = self.get("selectedContentLinks");
                                if (isChecked) {
                                    current.push(object.contentLink);
                                } else {
                                    current = current.filter(function (item) {
                                        return item !== object.contentLink;
                                    });
                                }
                                self.set({selectedContentLinks: current});
                            }));
                            checkBox.placeAt(node, "first");
                        }
                    }
                },
                store: this.store,
                query: {
                    id: this.contentLink
                },
                showHeader: true
            }, this.defaultGridMixin);

            this.inherited(arguments);

            this.grid = new this._gridClass(gridSettings, this.gridNode);
            this.own(this.grid);
            this.own(on.once(this.grid, "dgrid-refresh-complete", function () {
                self.set("_defaultSelectedContent", self.get("selectedContentLinks"));
            }));
        },

        startup: function () {
            this.inherited(arguments);
            this.own(this.grid.on(".dgrid-column-uri a:click", this._onChangeContext.bind(this)));
        },

        fetchData: function () {
            this.grid.refresh();
        },

        _afterStoreQuery: function (results) {
            var hasItems = results.length > 0;
            this.noDataMessageNode.innerHTML = labsResources.noitemstopublish;
            domClass.toggle(this.noDataNode, "dijitHidden", hasItems);
            domClass.toggle(this.gridNode, "dijitHidden", !hasItems);
        },

        _onChangeContext: function (e) {
            var row = this.grid.row(e),
                newContext = {uri: row.data.uri};

            if (newContext.uri) {
                this._requestNewContext(newContext, {sender: this});
                this.emit("viewReference");
            }
        },

        _getLinkTemplate: function () {
            var node = domConstruct.create("a", {
                "class": "epi-visibleLink",
                innerHTML: resources.view.label,
                title: resources.view.tooltip
            });

            return node.outerHTML;
        }
    });
});

