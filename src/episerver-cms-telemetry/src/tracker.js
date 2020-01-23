import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights = null;

const Tracker = {
    initialize(config, versions, authenticatedUserId, accountId) {
        appInsights = new ApplicationInsights({ config });
        appInsights.loadAppInsights();
        appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId);
        appInsights.addTelemetryInitializer((envelope) => {
            envelope.data.versions = versions;
        });
    },

    track(eventName, data) {
        // appInsights is undefined if initialize has not been called.
        if (!appInsights) {
            return;
        }
        console.log("track:", eventName, data);
        appInsights.trackEvent({ name: eventName }, data);
    }
};

export default Tracker;
