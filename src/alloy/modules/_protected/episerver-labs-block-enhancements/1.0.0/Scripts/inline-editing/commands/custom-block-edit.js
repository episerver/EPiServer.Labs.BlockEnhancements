define([
        "dojo/_base/declare",
        "epi-cms/contentediting/command/BlockEdit",
        "epi/i18n!epi/cms/nls/episerver.shared.action"
    ],

    function (
        declare,
        BlockEdit,
        actionStrings
    ) {
        return declare([BlockEdit], {
            category: null,

            _labelSetter: function(value) {
                if (this.label === actionStrings.view) {
                    this.inherited(arguments);
                } else {
                    this.label = actionStrings.view;
                    setTimeout(function() {
                        this.set("label", actionStrings.view);
                    }.bind(this), 0);
                }
            },

            _iconClassSetter: function(value) {
                if (this.iconClass === "epi-iconSearch") {
                    this.inherited(arguments);
                } else {
                    this.iconClass = "epi-iconSearch";
                    setTimeout(function() {
                        this.set("iconClass", "epi-iconSearch");
                    }.bind(this), 0);
                }
            }
        });
    });
