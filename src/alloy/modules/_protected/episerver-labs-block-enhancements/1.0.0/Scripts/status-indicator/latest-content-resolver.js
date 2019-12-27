define([
    "dojo/Deferred",
    "epi/dependency",
    "epi-cms/core/ContentReference"
], function (Deferred, dependency, ContentReference) {
    var enhancedStore;

    function ensureStore() {
        if (!enhancedStore) {
            enhancedStore = dependency.resolve("epi.storeregistry").get("episerver.labs.blockenhancements");
        }
    }

    return function getLatestContentLinksVersion(value) {
        ensureStore();

        if (!value) {
            return new Deferred().resolve({});
        }

        var contentLinks = value.map(function(item) {
            return item.contentLink;
        });

        return enhancedStore.executeMethod("GetLatestVersions", null, contentLinks).then(function(contents) {
            return contents.reduce(function (map, obj) {
                map[new ContentReference(obj.contentLink).id] = obj;
                return map;
            }, {});
        }.bind(this));
    };
})
