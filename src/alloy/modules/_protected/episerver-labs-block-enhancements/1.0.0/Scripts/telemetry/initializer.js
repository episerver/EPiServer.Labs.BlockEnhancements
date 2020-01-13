define([
    "epi/dependency",
    "episerver-labs-block-enhancements/tracker",
], function(dependency, tracker){
    return function() {
        dependency.resolve("epi.storeregistry")
            .get("episerver.labs.blockenhancements.telemetry")
            .get().then(function(telemetry){
            tracker.initialize(telemetry.isEnabled, telemetry.instrumentationKey, telemetry.versions);
            tracker.track("hello-world");
        });
    }
});
