define([
    "dojo/_base/declare",
    "episerver-labs-block-enhancements/inline-editing/browsable-content-area-mixin",
    "epi-cms/widget/overlay/ContentArea"
], function (
    declare,
    browsableContentAreaMixin,
    ContentArea
) {
    return declare([ContentArea, browsableContentAreaMixin], {
        update: function (value) {
            this.onValueChange({
                propertyName: this.name,
                value: value
            });
        }
    });
});
