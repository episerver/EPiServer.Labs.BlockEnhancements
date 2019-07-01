define([
    "dojo/_base/declare",
    "dojo/topic",
    "dijit/Destroyable"
], function (
    declare,
    topic,
    Destroyable
) {

    return declare([Destroyable], {
        _isInDraftView: false,

        constructor: function (options) {
            this.own(
                topic.subscribe("/epi/setcommondraftview", this._setCommonDraftView.bind(this))
            );
        },

        setIsInDraftView: function (isInDraftView) {
            this._isInDraftView = isInDraftView;
            topic.publish("/epi/setcommondraftview", this._isInDraftView);
        },

        isInDraftView: function () {
            return this._isInDraftView;
        },

        _setCommonDraftView: function (isInDraftView) {
            this._isInDraftView = isInDraftView;
            this.isInCommonDraftViewChanged(isInDraftView);
        },

        isInCommonDraftViewChanged: function (isInDraftView) {
        }
    });
});

