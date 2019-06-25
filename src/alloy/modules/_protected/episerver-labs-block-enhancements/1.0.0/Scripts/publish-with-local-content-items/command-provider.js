define([
    "dojo/_base/declare",
    "dijit/Destroyable",
    "epi/shell/command/_CommandProviderMixin",
    "episerver-labs-block-enhancements/publish-with-local-content-items/command"
], function (declare, Destroyable, _CommandProviderMixin, PublishWithLocalContentItemsCommand) {

    return declare([_CommandProviderMixin, Destroyable], {

        updateCommandModel: function (model) {
            var transitionEnabled = model.contentData.transitions.some(function (transition) {
                return transition.name === "publishWithLocalContentItems";
            });

            var commands = [];
            if (transitionEnabled) {
                var publishWithLocalContentItemsCommand = new PublishWithLocalContentItemsCommand();
                this.own(publishWithLocalContentItemsCommand);
                commands.push(publishWithLocalContentItemsCommand);
            }

            this.set("commands", commands);

            this.inherited(arguments);
        }
    });
});
