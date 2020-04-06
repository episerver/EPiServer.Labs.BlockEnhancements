define([
    "dojo/topic",
    "dojo/when",
    "epi/dependency",
    "epi-cms/contentediting/ContentModelServerSync",
    "epi-cms/contentediting/PageDataController",
    "episerver-labs-block-enhancements/telemetry/idle-timer",
    "episerver-labs-block-enhancements/tracker"
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

        topic.subscribe("/epi/shell/action/viewchanged", onViewChanged);
        topic.subscribe("/epi/cms/action/switcheditmode", onSwitchedEditMode);

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
            if (idleTimer.isActive()) {
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
