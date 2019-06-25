define([
    "dojo/_base/declare",
    "epi-cms/layout/CreateContentGroupContainer"
], function (
    declare,
    CreateContentGroupContainer) {

    return declare([CreateContentGroupContainer], {
        // summary:
        //     Group container with no title
        //

        templateString: "<div class='epi-containerLayout clearfix'>\
                            <ul data-dojo-attach-point='containerNode'></ul>\
                        </div>"
    });
});
