define([
    "dojo/_base/declare",
    "dijit/Destroyable",
    "epi/shell/command/_CommandProviderMixin",
    "episerver-labs-block-enhancements/publish-page-with-blocks/command"
], function (declare, Destroyable, _CommandProviderMixin, PublishPageWithBlocksCommand) {

    return declare([_CommandProviderMixin, Destroyable], {

        updateCommandModel: function () {
            var commands = [];
            var publishPageWithBlocksCommand = new PublishPageWithBlocksCommand();
            this.own(publishPageWithBlocksCommand);
            commands.push(publishPageWithBlocksCommand);

            this.set("commands", commands);

            this.inherited(arguments);
        }
    });
});
