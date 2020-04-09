define([
    "epi/throttle"
], function (throttle) {
    var isActive = true;
    var _timeoutId;

    var idleTimeout = 120; // 2 minutes

    var events = [
        'mousemove',
        'mousedown',
        'wheel',
        'keydown'
    ];

    var resetIdleState = throttle(function () {
        isActive = true;
        clearTimeout(_timeoutId);
        _timeoutId = setTimeout(function () {
            isActive = false;
        }, idleTimeout * 1000);
    }, this, 500);

    function bindEvents(doc) {
        if (!doc) {
            return;
        }
        events.forEach(function (event) {
            doc.addEventListener(event, resetIdleState);
        });
    }

    resetIdleState();
    bindEvents(document);

    return {
        isActive: function () {
            return isActive
        },
        bindEvents: bindEvents
    }
});
