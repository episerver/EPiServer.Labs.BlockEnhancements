define([
    "dojo/when",
    "epi-cms/contentediting/command/Publish",
    "epi-cms/project/command/PublishProject",
    "episerver-labs-block-enhancements/publish-with-local-content-items/command",
    "episerver-labs-block-enhancements/telemetry/tracker",
    "episerver-telemetry-ui/track-projects"
], function (
    when,
    PublishCommand,
    PublishProjectCommand,
    SmartPublishCommand,
    tracker,
    trackProjects) {
    return function () {
        PublishCommand.prototype.commandType = "default";

        function trackPublishCommand (publishResult, model, commandType, additionalData) {
            var isPage = model.contentData.capabilities.isPage;
            var isBlock = model.contentData.capabilities.isBlock;
            // dont track if it's not a block or a page
            if (!isPage && !isBlock) {
                return;
            }

            trackProjects.getProjectState().then(function (isProjectSelected) {
                tracker.trackEvent("publish", Object.assign({
                    commandType: commandType,
                    contentType: isPage ? "page" : "block",
                    publishResult: publishResult,
                    isProjectSelected: isProjectSelected
                }, additionalData));
            });
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

        var originalPublishProjectExecute = PublishProjectCommand.prototype.execute;
        PublishProjectCommand.prototype.execute = function () {
            originalPublishProjectExecute.apply(this, arguments);

            // Track how many items are being published (which are only those marked as Ready to publish)
            tracker.trackEvent("publish", Object.assign({
                commandType: "project",
                itemsCount: this.model.selectedProject.itemStatusCount.checkedin
            }));
        }

        PublishProjectCommand.prototype.execute.nom = "execute";

        var originalSmartPublishExecute = SmartPublishCommand.prototype.execute;
        SmartPublishCommand.prototype.execute = function () {
            var isPage = this.model.contentData.capabilities.isPage;
            var isBlock = this.model.contentData.capabilities.isBlock;
            if (isPage || isBlock){
                tracker.trackEvent("click", {
                    action: "openSmartPublishDialogue",
                    contentType: isPage ? "page" : "block"
                });
            }

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
