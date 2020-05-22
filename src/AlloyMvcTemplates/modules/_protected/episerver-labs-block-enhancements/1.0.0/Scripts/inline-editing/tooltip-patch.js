define([
    "dijit/Tooltip",
    "dijit/registry"
], function (Tooltip, registry) {
    var activeTooltips = [];

    var originalOpen = Tooltip.prototype.open;
    Tooltip.prototype.open = function () {
        originalOpen.apply(this, arguments);
        activeTooltips.push(this.get("id"));
    };

    var originalClose = Tooltip.prototype.close;
    Tooltip.prototype.close = function () {
        originalClose.apply(this, arguments);
        var tooltipIdIndex = activeTooltips.indexOf(this.get("id"));
        if (tooltipIdIndex !== -1) {
            activeTooltips.splice(tooltipIdIndex, 1);
        }
    };

    return {
        hideAll: function () {
            activeTooltips.forEach(function (tooltipId) {
                var widget = registry.byId(tooltipId);
                if (widget) {
                    widget.close();
                }
            })
        }
    }
});
