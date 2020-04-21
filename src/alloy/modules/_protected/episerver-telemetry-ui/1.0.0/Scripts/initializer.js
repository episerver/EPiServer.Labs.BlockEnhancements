define([
    "dojo/_base/declare",
    "epi/dependency",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/_Module",
    "episerver-telemetry-ui/tracker",
    "episerver-telemetry-ui/get-custom-properties"
], function (
    declare,
    dependency,
    routes,
    JsonRest,
    _Module,
    tracker,
    getCustomProperties
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);
            var registry = dependency.resolve("epi.storeregistry");

            registry.add("episerver-telemetry-ui.store",
                new JsonRest({
                    target: routes.getRestPath({ moduleArea: "episerver-telemetry-ui", storeName: "telemetryconfig" })
                })
            );
            var options = this._settings.options;

            dependency.resolve("epi.storeregistry")
                .get("episerver-telemetry-ui.store")
                .get().then(function (telemetry) {
                    // Prevent errors when initializing tracker without the instrumentationKey
                    if (telemetry.configuration && telemetry.configuration.instrumentationKey) {
                        tracker.initialize(telemetry.configuration, getCustomProperties(telemetry), telemetry.user, telemetry.client);
                        tracker.track("feature-options", options);
                    }
                });
        }
    });
});
