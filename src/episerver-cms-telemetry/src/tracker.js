import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights = null;

const Tracker = {
    initialize(instrumentationKey) {
        appInsights = new ApplicationInsights({
            config: {
                instrumentationKey: instrumentationKey                
            }
        });
    },

    track(eventName, data) {
        if (!appInsights) {
            throw new Error("Tracker not initialized");
        }        

        appInsights.trackEvent({ name: eventName }, data);
    }
};

export default Tracker;
