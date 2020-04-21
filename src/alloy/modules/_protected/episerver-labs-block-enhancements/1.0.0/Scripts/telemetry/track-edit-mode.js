define([
    "dojo/topic",
    "dojo/when",
    "epi/dependency",
    "epi-cms/contentediting/ContentModelServerSync",
    "epi-cms/contentediting/PageDataController",
    "episerver-telemetry-ui/idle-timer",
    "episerver-telemetry-ui/tracker"
], function (
    topic,
    when,
    dependency,
    ContentModelServerSync,
    PageDataController,
    idleTimer,
    Tracker
) {
    return function () {
        var viewName = "";

        var heartbeatInterval = 60;
        var heartbeatTimeoutId;

        patchContentModelServerSync();

        // Triggered when changing view component, including Editing/Preview/Compare/ProjectView/ApprovalConfig, etc.
        // However it's not triggered by editMode switchButton.
        // Listen to this event for updating viewName.
        topic.subscribe("/epi/shell/action/viewchanged", onViewChanged);

        // Triggered when changing editMode. Listen to this event for tracking APE/OPE.
        topic.subscribe("/epi/shell/action/changeview/updatestate", onEditModeChanged);

        // The iframe exists, implies that view has been created. In this case, set viewName and start tracking.
        if (window["sitePreview"]) {
            var profile = dependency.resolve("epi.shell.Profile");
            when(profile.get("_savedView")).then(function (savedView) {
                if (savedView) {
                    viewName = savedView;
                }
                trackHeartbeat("loadPage");
            });
        }

        // Bind events on OPE iframe
        bindIframeEvents();
        patchPageDataController();

        function patchPageDataController() {
            var originalIFrameLoaded = PageDataController.prototype._iFrameLoaded;
            PageDataController.prototype._iFrameLoaded = function () {
                originalIFrameLoaded.apply(this, arguments);
                bindIframeEvents()
            };
            PageDataController.prototype._iFrameLoaded.nom = "_iFrameLoaded";
        }

        function bindIframeEvents() {
            try {
                idleTimer.bindEvents(window["sitePreview"].document);
            } catch (e) {
                // catch error in x-domain scenario
            }
        }

        function patchContentModelServerSync() {
            var originalPublishContentSavedMessage = ContentModelServerSync.prototype._publishContentSavedMessage;
            ContentModelServerSync.prototype._publishContentSavedMessage = function (result) {
                trackContentSaved();
                originalPublishContentSavedMessage.apply(this, arguments);
            };
            ContentModelServerSync.prototype._publishContentSavedMessage.nom = "_publishContentSavedMessage";
        }

        function onViewChanged(type, args, data) {
            viewName = data.viewName || "";
        }

        function onEditModeChanged(data) {
            viewName = data.viewName || "";
            trackHeartbeat("changeView");
        }

        function trackHeartbeat(commandType) {
            if (idleTimer.isActive() && viewName) {
                Tracker.track("editing", {
                    editMode: viewName,
                    commandType: commandType || "heartbeat"
                });
            }

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
