define([], function () {
    return function (telemetry) {
        var customProperties = {
            versions: telemetry.versions,
            resolutions: getResolutions()
        }

        function getResolutions() {
            var windowInnerWidth = window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth;
            var windowInnerHeight = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight

            return {
                screenWidth: screen.width,
                screenHeight: screen.height,
                windowInnerWidth: windowInnerWidth,
                windowInnerHeight: windowInnerHeight
            }
        }

        return customProperties
    }
});
