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

        return enhancedStore.query({ ids: contentLinks }).then(function(contents) {
            return contents.reduce(function (map, obj) {
                if (obj && obj.contentLink) {
                    map[new ContentReference(obj.contentLink).id] = obj;
                }
                return map;
            }, {});
        }.bind(this));
    };
})
