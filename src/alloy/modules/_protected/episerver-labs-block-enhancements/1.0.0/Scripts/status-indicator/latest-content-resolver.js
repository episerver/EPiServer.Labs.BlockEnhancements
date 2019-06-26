define([
    "dojo/Deferred",
    "epi/dependency",
    "epi-cms/core/ContentReference"
], function (Deferred, dependency, ContentReference) {
    var lightStore;
    var enhancedStore;

    function ensureStore() {
        if (!lightStore) {
            lightStore = dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        }
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

        return enhancedStore.executeMethod("GetLatestVersions", null, contentLinks).then(function(latestContentLinks) {
            return lightStore.executeMethod("List", null, latestContentLinks).then(function(contents) {
                var contentsHashMap = contents.reduce(function(map, obj) {
                    map[new ContentReference(obj.contentLink).id] = obj;
                    return map;
                }, {});
                return contentsHashMap;

            });
        }.bind(this));
    };
})
