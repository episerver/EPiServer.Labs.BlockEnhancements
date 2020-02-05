define([
    "dojo/when",
    "epi-cms/contentediting/command/Publish",
    "episerver-labs-block-enhancements/publish-with-local-content-items/command",
    "episerver-labs-block-enhancements/tracker"
], function (
    when,
    PublishCommand,
    SmartPublishCommand,
    tracker) {
    return function () {
        PublishCommand.prototype.commandType = "default";

        function trackPublishCommand (publishResult, model, commandType, additionalData) {
            var isPage = model.contentData.capabilities.isPage;
            var isBlock = model.contentData.capabilities.isBlock;

            // dont track if it's not a block or a page
            if (!isPage && !isBlock) {
                return;
            }

            tracker.track("publish", Object.assign({
                "command-type": commandType,
                "content-type": isPage ? "page" : "block",
                "publish-result": publishResult
            }, additionalData));
        }

        var originalExecute = PublishCommand.prototype.execute;
        PublishCommand.prototype.execute = function () {
            var result = originalExecute.apply(this, arguments);
            when(result).then(function (publishResult) {
                // Called either by the success of the built-in Publish command
                // and success&failure of the Inline Publish.
                var publishSuccess;
                if (typeof (publishResult) === "undefined") {
                    publishSuccess = true;
                } else {
                    publishSuccess = !!publishResult;
                }

                trackPublishCommand(publishSuccess, this.model, this.commandType);
            }.bind(this)).otherwise(function () {
                // Triggered only for the publish failed of the built-in Publish command
                trackPublishCommand(false, this.model, this.commandType);
            }.bind(this));
            return result;
        };

        PublishCommand.prototype.execute.nom = "execute";

        var originalSmartPublishExecute = SmartPublishCommand.prototype.execute;
        SmartPublishCommand.prototype.execute = function () {
            var result = originalSmartPublishExecute.apply(this, arguments);
            when(result).then(function (trackingData) {
                trackPublishCommand(true, this.model, "smart", trackingData);
            }.bind(this)).otherwise(function (trackingResult) {
                if (trackingResult.userCanceled) {
                    return;
                }
                trackPublishCommand(false, this.model, "smart", trackingResult);
            }.bind(this));
            return result;
        };

        SmartPublishCommand.prototype.execute.nom = "execute";
    };
});
