import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights = null;

const Tracker = {
    initialize(isEnabled, instrumentationKey, versions) {
        appInsights = new ApplicationInsights({
            config: {
                disableTelemetry: !isEnabled,
                disableAjaxTracking: true,
                instrumentationKey: instrumentationKey
            }
        });
        appInsights.loadAppInsights();
        appInsights.addTelemetryInitializer((envelope) => {
            envelope.data.versions = versions;
        });
    },

    track(eventName, data) {
        appInsights.trackEvent({ name: eventName }, data);
    }
};

export default Tracker;
