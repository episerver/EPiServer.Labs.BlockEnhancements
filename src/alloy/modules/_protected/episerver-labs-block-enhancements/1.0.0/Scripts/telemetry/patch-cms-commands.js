define([
    "dojo/when",
    "epi-cms/contentediting/command/_ChangeContentStatus",
    "epi-cms/contentediting/command/Publish",
    "episerver-labs-block-enhancements/tracker",
], function (
    when,
    _ChangeContentStatus,
    PublishCommand,
    tracker) {
    return function () {
        PublishCommand.prototype.commandType = "default";
        PublishCommand.prototype.trackCommand = true;

        var originalExecute = _ChangeContentStatus.prototype.execute;
        _ChangeContentStatus.prototype.execute = function () {
            if (!this.trackCommand){
                return originalExecute.apply(this, arguments);
            }

            function trackPublishCommand () {
                    var isPage = this.model.contentData.capabilities.isPage;
                    var isBlock = this.model.contentData.capabilities.isBlock;

                    // dont track if it's not a block or a page
                    if (!isPage && !isBlock) {
                        return;
                    }

                    var additionalData = this._getTrackingData && this._getTrackingData();

                    tracker.track("publish", Object.assign({
                        "command-type": this.commandType,
                        "content-type": isPage ? "page" : "block"
                    }, additionalData));
            }

            var result = originalExecute.apply(this, arguments);
            when(result).then(trackPublishCommand.bind(this));
            return result;
        }

        _ChangeContentStatus.prototype.execute.nom = "execute"
    }
});
