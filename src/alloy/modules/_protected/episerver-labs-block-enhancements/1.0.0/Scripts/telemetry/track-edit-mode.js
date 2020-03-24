define([
    "dojo/topic",
    "epi-cms/contentediting/ContentModelServerSync",
    "episerver-labs-block-enhancements/tracker"
], function (
    topic,
    ContentModelServerSync,
    Tracker
) {
    return function () {
        var viewName = "";

        var heartbeatInterval = 60;
        var heartbeatTimeoutId;

        patchContentModelServerSync();

        topic.subscribe("/epi/shell/action/viewchanged", onViewChanged);
        topic.subscribe("/epi/cms/action/switcheditmode", onSwitchedEditMode);

        function patchContentModelServerSync() {
            var originalPublishContentSavedMessage = ContentModelServerSync.prototype._publishContentSavedMessage;
            ContentModelServerSync.prototype._publishContentSavedMessage = function (result) {
                trackContentSaved();
                originalPublishContentSavedMessage.apply(this, arguments);
            };
            ContentModelServerSync.prototype._publishContentSavedMessage.nom = "_publishContentSavedMessage";
        }

        function onViewChanged(type, args, data) {
            viewName = data.viewName;

            trackHeartbeat("loadPage");
        }

        function onSwitchedEditMode() {
            if (viewName !== "onpageedit" && viewName !== "formedit" && viewName !== "view") {
                return;
            }

            // When clicking switching button, the page in Preview is switched to APE
            viewName = viewName === "formedit" ? "onpageedit" : "formedit";

            trackHeartbeat("switchMode");
        }

        function trackHeartbeat(commandType) {
            Tracker.track("editing", {
                editMode: viewName,
                commandType: commandType || "heartbeat"
            });

            clearTimeout(heartbeatTimeoutId);
            heartbeatTimeoutId = setTimeout(trackHeartbeat, heartbeatInterval * 1000);
        }

        function trackContentSaved() {
            Tracker.track("editContentSaved", {
                editMode: viewName
            });
        }
    }
});
