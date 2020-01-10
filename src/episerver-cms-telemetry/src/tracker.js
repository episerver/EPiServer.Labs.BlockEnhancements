import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights = null;

const Tracker = {
    initialize(instrumentationKey, versions) {
        appInsights = new ApplicationInsights({
            config: {
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
        if (!appInsights) {
            return;
        }

        appInsights.trackEvent({ name: eventName }, data);
    }
};

export default Tracker;
