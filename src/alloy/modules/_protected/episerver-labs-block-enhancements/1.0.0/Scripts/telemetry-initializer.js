define([
    "epi/dependency",
    "episerver-labs-block-enhancements/tracker",
], function(dependency, tracker){
    return function(versions) {
        dependency.resolve("epi.storeregistry")
            .get("episerver.labs.blockenhancements.telemetry")
            .get().then(function(telemetry){
                if(telemetry.isEnabled){
                    tracker.initialize(telemetry.instrumentationKey, versions);
                    tracker.track("hello-world");
                }
            });
    }
});
