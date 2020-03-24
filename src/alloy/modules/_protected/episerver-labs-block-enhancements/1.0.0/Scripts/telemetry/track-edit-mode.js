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
        var _viewName = "";

        var heartbeatInterval = 60;
        var _heartbeatTimeoutId;

        _patchContentModelServerSync();

        topic.subscribe("/epi/shell/action/viewchanged", _onViewChanged);
        topic.subscribe("/epi/cms/action/switcheditmode", _onSwitchedEditMode);

        function _patchContentModelServerSync() {
            var originalPublishContentSavedMessage = ContentModelServerSync.prototype._publishContentSavedMessage;
            ContentModelServerSync.prototype._publishContentSavedMessage = function (result) {
                trackContentSaved();
                originalPublishContentSavedMessage.apply(this, arguments);
            };
            ContentModelServerSync.prototype._publishContentSavedMessage.nom = "_publishContentSavedMessage";
        }

        function _onViewChanged(type, args, data) {
            _viewName = data.viewName;

            trackHeartbeat("loadPage");
        }

        function _onSwitchedEditMode() {
            if (_viewName !== "onpageedit" && _viewName !== "formedit" && _viewName !== "view") {
                return;
            }

            // When clicking switching button, the page in Preview is switched to APE
            _viewName = _viewName === "formedit" ? "onpageedit" : "formedit";

            trackHeartbeat("switchMode");
        }

        function trackHeartbeat(commandType) {
            Tracker.track("editing", {
                editMode: _viewName,
                commandType: commandType || "heartbeat"
            });

            clearTimeout(_heartbeatTimeoutId);
            _heartbeatTimeoutId = setTimeout(trackHeartbeat, heartbeatInterval * 1000);
        }

        function trackContentSaved() {
            Tracker.track("editContentSaved", {
                editMode: _viewName
            });
        }
    }
});
