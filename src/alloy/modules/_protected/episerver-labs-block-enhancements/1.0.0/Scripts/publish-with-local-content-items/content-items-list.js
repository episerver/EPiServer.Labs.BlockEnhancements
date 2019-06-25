define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/form/CheckBox",
    "epi/shell/widget/_ModelBindingMixin",
], function(
    declare,
    domConstruct,
    _Widget,
    _TemplatedMixin,
    CheckBox,
    _ModelBindingMixin
) {
    return declare([_Widget, _TemplatedMixin, _ModelBindingMixin], {
        templateString: "<ul data-dojo-attach-point='listNode'></ul>",

        contentItems: null,

        buildRendering: function() {
            this.inherited(arguments);

            this.contentItems.forEach(function(contentItem) {
                var listItem = domConstruct.create("li", {}, this.listNode);
                var label = domConstruct.create("label", {
                    innerHTML: contentItem.name
                }, listItem);
                var checkbox = new CheckBox({ checked: true, value: contentItem.contentLink });
                checkbox.on("change", function (isChecked) {
                    var current = this.get("selectedContentItems");
                    if (isChecked) {
                        current.push(contentItem);
                    } else {
                        current = current.filter(function(item) {
                            return item !== contentItem;
                        });
                    }
                    this.set({ selectedContentItems: current });
                }.bind(this));
                checkbox.placeAt(label, "first");
            }, this);

            this.set({ selectedContentItems: this.contentItems });
        }
    });
});
