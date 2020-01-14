import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights = null;

const Tracker = {
    initialize(isEnabled, instrumentationKey, versions, authenticatedUserId, accountId) {
        appInsights = new ApplicationInsights({
            config: {
                disableTelemetry: !isEnabled,
                disableAjaxTracking: true,
                instrumentationKey: instrumentationKey
            }
        });
        appInsights.loadAppInsights();
        appInsights.setAuthenticatedUserContext(authenticatedUserId, accountId);
        appInsights.addTelemetryInitializer((envelope) => {
            envelope.data.versions = versions;
        });
    },

    track(eventName, data) {
        appInsights.trackEvent({ name: eventName }, data);
    }
};

export default Tracker;
