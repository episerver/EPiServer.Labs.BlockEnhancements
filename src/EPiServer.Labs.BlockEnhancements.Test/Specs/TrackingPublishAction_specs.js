define([
    "tdd/stub-module",

    "dojo/Deferred",
    "epi/dependency",
    "epi-cms/contentediting/command/Publish",
    "epi-cms/contentediting/command/BlockInlinePublish",
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
        const trackEventFn = sinon.stub();

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
                "episerver-labs-block-enhancements/telemetry/tracker": {
                    trackEvent: trackEventFn
                },
                "episerver-telemetry-ui/track-projects": {
                    getProjectState: sinon.stub().returns(new Deferred().resolve(true))
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

                it("it should call tracker with publishResult dimension `true`", () => {
                    publishCommand.execute();
                    expect(trackEventFn).to.have.been.calledWith("publish", sinon.match.has("publishResult", true));
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

                it("it should call tracker with publishResult dimension `false`", () => {
                    publishCommand.execute();
                    expect(trackEventFn).to.have.been.calledWith("publish", sinon.match.has("publishResult", false));
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

                it("it should call tracker with publishResult dimension `true`", () => {
                    publishCommand.execute();
                    expect(trackEventFn).to.have.been.calledWith("publish", sinon.match.has("publishResult", true));
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

                it("it should call tracker with publishResult dimension `false`", () => {
                    publishCommand.execute();
                    expect(trackEventFn).to.have.been.calledWith("publish", sinon.match.has("publishResult", false));
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

                it("it should call tracker with publishResult dimension `true`", () => {
                    //TODO: test smart publish success scenario
                    smartPublishCommand.execute();
                    expect(trackEventFn).to.have.been.calledWith("publish", sinon.match.has("publishResult", true));
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

                it("it should call tracker with publishResult dimension `false`", () => {
                    smartPublishCommand.execute();
                    expect(trackEventFn).to.have.been.calledWith("publish", sinon.match.has("publishResult", false));
                });
            });
        });
    });
});
