define([], function () {
    var missingTranslation = "[Missing text";

    return function getTooltip(contentType) {
        var tooltip = contentType.localizedName;
        if (contentType.localizedDescription && contentType.localizedDescription.indexOf(missingTranslation) === -1) {
            tooltip += " - " + contentType.localizedDescription;
        } else if (contentType.description) {
            tooltip += " - " + contentType.description;
        }
        return tooltip;
    }
});
