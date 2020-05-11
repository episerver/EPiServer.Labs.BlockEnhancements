define([
    "tdd/stub-module",

    "dojo/Deferred",
    "epi/dependency",
    "epi-cms/contentediting/command/Publish",
    "episerver-labs-block-enhancements/inline-editing/commands/inline-publish",
    "episerver-labs-block-enhancements/publish-with-local-content-items/command"
], (
    stubModule,
    Deferred,
    dependency,
    PublishCommand,
    InlinePublishCommand,
    SmartPublishCommand
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

            dependency.register("epi.cms.ProjectService", {
            });

            return stubModule("episerver-labs-block-enhancements/telemetry/patch-cms-commands", {
                "episerver-telemetry-ui/tracker-factory": {
                    getTracker: function () {
                        return {
                            track: trackFn
                        }
                    }
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
            let smartPublishCommand, mockDialogService;

            beforeEach(() => {
                mockDialogService = {
                    alert: sinon.stub(),
                    confirmation: () => {
                        const res = new Deferred();
                        res.resolve();
                        return res.promise;
                    }
                };

                let ContentDependenciesMock = function () {
                    this.get = function () {
                        return [];
                    };
                };

                const pageDataStore = {
                    get: () => {}
                };

                smartPublishCommand = new SmartPublishCommand({
                    _dialogService: mockDialogService,
                    _ContentDependenciesClass: ContentDependenciesMock,
                    _pageDataStore: pageDataStore
                });

                smartPublishCommand.set("canExecute", true);
                smartPublishCommand.set("isAvailable", true);

                smartPublishCommand.model = {
                    contentData: {
                        capabilities: {
                            isPage: true
                        },
                        transitions: [{
                            name: "publish"
                        }]
                    }
                };
            });

            describe("when publish successed", () => {

                beforeEach(() => {
                    smartPublishCommand.model.changeContentStatus = () => {
                        const res = new Deferred();
                        res.resolve({ id: "10" });
                        return res.promise;
                    };
                });

                it("it should call tracker with publish-result dimension `true`", () => {
                    //TODO: test smart publish success scenario
                    smartPublishCommand.execute();
                    expect(trackFn).to.have.been.calledWith("publish", sinon.match.has("publish-result", true));
                });
            });

            describe("when publish failed", () => {
                beforeEach(() => {
                    smartPublishCommand.model.changeContentStatus = () => {
                        const res = new Deferred();
                        res.reject();
                        return res.promise;
                    };
                });

                it("it should call tracker with publish-result dimension `false`", () => {
                    smartPublishCommand.execute();
                    expect(trackFn).to.have.been.calledWith("publish", sinon.match.has("publish-result", false));
                });
            });
        });
    });
});
