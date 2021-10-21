define([
    "dojo/Deferred",
    "epi/routes",
    "epi/shell/XhrWrapper"
], function (
    Deferred,
    routes,
    XhrWrapper
) {
    var options = null;

    return function getOptions() {
        if (options) {
            return options;
        }

        var deferred = new Deferred();
        var xhrHandler = new XhrWrapper();

        var url = routes.getRestPath({
            moduleArea: "episerver-labs-block-enhancements",
            storeName: "episerverlabsblockenhancementsoptions"
        });

        xhrHandler.xhrGet({url: url}).then(function (result) {
            options = JSON.parse(result);
            deferred.resolve(options);
        });

        return deferred.promise;
    }
});
