define([
    "dojo/topic",
    "epi-cms/contentediting/ContentModelServerSync",
    "episerver-labs-block-enhancements/tracker"
], function (
    topic,
    ContentModelServerSync,
    Tracker
) {
    return function() {
        var _intervalInSeconds = .5;
        var _lastFocus = 0;
        var _viewName = "";

        _patchContentModelServerSync();

        topic.subscribe("widgetFocus", _onFocus);
        topic.subscribe("/epi/shell/action/viewchanged", _onViewChanged);
        topic.subscribe("/epi/cms/action/switcheditmode", _onSwitchedEditMode);

        function _patchContentModelServerSync() {
            var originalPublishContentSavedMessage = ContentModelServerSync.prototype._publishContentSavedMessage;
            ContentModelServerSync.prototype._publishContentSavedMessage = function (result) {
                _onSave();
                originalPublishContentSavedMessage.apply(this, arguments);
            };
            ContentModelServerSync.prototype._publishContentSavedMessage.nom = "_publishContentSavedMessage";
        }

        function _onViewChanged(type, args, data) {
            _viewName = data.viewName;
            _lastFocus = 0;
        }

        function _onSwitchedEditMode() {
            if (_viewName !== "onpageedit" && _viewName !== "formedit" && _viewName !== "view") {
                return;
            }

            // When clicking switching button, the page in Preview is switched to APE
            _viewName = _viewName === "formedit" ? "onpageedit" : "formedit";
            _lastFocus = 0;
        }

        function _onFocus(ctx) {
            if (_viewName !== "onpageedit" && _viewName !== "formedit")
                return;

            if (_lastFocus > 0)
                return;

            var currentTime = Date.now();
            _lastFocus = currentTime;
        }

        function _onSave() {
            if (_viewName !== "onpageedit" && _viewName !== "formedit")
                return;

            if (_lastFocus === 0)
                return;

            var secondsSpentEditing = (Date.now() - _lastFocus)/1000;
            if (secondsSpentEditing > _intervalInSeconds) {
                _handleTracking(secondsSpentEditing);
                _lastFocus = 0;
            }
        }

        function _handleTracking(secondsSpentEditing) {
            Tracker.track("editContentSaved", Object.assign({
                editMode: _viewName,
                spentTime: secondsSpentEditing
            }));
        }
    }
});
