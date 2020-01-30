define([
    "tdd/stub-module",

    "dojo/Deferred",
    "epi/dependency",
    "epi-cms/contentediting/command/Publish",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-publish"
], (
    stubModule,
    Deferred,
    dependency,
    PublishCommand,
    InlinePublishCommand
) => {
    describe("Publish Actions Tracking", () => {
        const trackFn = sinon.stub();

        before(function () {

            dependency.register("epi.shell.MessageService", {
                query: function () {
                    return [];
                }
            });

            dependency.register("epi.storeregistry", {
                get: function () {
                    return {};
                }
            });

            return stubModule("episerver-labs-block-enhancements/telemetry/patch-cms-commands", {
                "episerver-labs-block-enhancements/tracker": {
                    track: trackFn
                }
            }).then(function (module) {
                module();
            });
        });

        describe("Default publish command", () => {
            let publishCommand;
            beforeEach(() => {
                publishCommand = new PublishCommand();

                publishCommand.model = {
                    contentData: {
                        capabilities: {
                            isPage: true
                        }
                    }
                };

                publishCommand.set("canExecute", true);
                publishCommand.set("isAvailable", true);
            });

            describe("when publish successed", () => {

                beforeEach(() => {
                    publishCommand.model.changeContentStatus = () => {
                        const res = new Deferred();
                        res.resolve({id: "10"});
                        return res.promise;
                    };
                });

                it("it should call tracker with publish-result dimension `true`", () => {
                    publishCommand.execute();
                    expect(trackFn).to.have.been.calledWith("publish", sinon.match.has("publish-result", true));
                });
            });

            describe("when publish failed", () => {
                beforeEach(() => {
                    publishCommand.model.changeContentStatus = () => {
                        const res = new Deferred();
                        res.reject();
                        return res.promise;
                    };
                });

                it("it should call tracker with publish-result dimension `false`", () => {
                    publishCommand.execute();
                    expect(trackFn).to.have.been.calledWith("publish", sinon.match.has("publish-result", false));
                });
            });
        });

        describe("Inline publish command", () => {
            let publishCommand;
            beforeEach(() => {
                publishCommand = new InlinePublishCommand();

                publishCommand.model = {
                    contentData: {
                        capabilities: {
                            isPage: true
                        }
                    }
                };

                publishCommand.set("canExecute", true);
                publishCommand.set("isAvailable", true);
            });

            describe("when publish successed", () => {

                beforeEach(() => {
                    publishCommand.model.changeContentStatus = () => {
                        const res = new Deferred();
                        res.resolve({id: "10"});
                        return res.promise;
                    };
                });

                it("it should call tracker with publish-result dimension `true`", () => {
                    publishCommand.execute();
                    expect(trackFn).to.have.been.calledWith("publish", sinon.match.has("publish-result", true));
                });
            });

            describe("when publish failed", () => {
                beforeEach(() => {
                    publishCommand.model.changeContentStatus = () => {
                        const res = new Deferred();
                        res.reject();
                        return res.promise;
                    };
                });

                it("it should call tracker with publish-result dimension `false`", () => {
                    publishCommand.execute();
                    expect(trackFn).to.have.been.calledWith("publish", sinon.match.has("publish-result", false));
                });
            });
        });

        describe("Smart publish command", () => {

            describe("when publish successed", () => {

                it("it should call tracker with publish-result dimension `true`", () => {
                    //TODO: test smart publish success scenario

                    expect(1).to.equals(1);
                });
            });

            describe("when publish failed", () => {

                it("it should call tracker with publish-result dimension `false`", () => {
                    //TODO: test smart publish fail scenario

                    expect(1).to.equals(1);
                });
            });
        });
    });
});
