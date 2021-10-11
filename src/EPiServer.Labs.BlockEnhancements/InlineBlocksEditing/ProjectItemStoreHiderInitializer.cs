using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Cms.Shell.UI.Rest;
using EPiServer.Cms.Shell.UI.Rest.Approvals;
using EPiServer.Cms.Shell.UI.Rest.Projects;
using EPiServer.Cms.Shell.UI.Rest.Projects.Internal;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework;
using EPiServer.Framework.Configuration;
using EPiServer.Framework.Initialization;
using EPiServer.Framework.Localization;
using EPiServer.ServiceLocation;
using EPiServer.Shell.UI.Messaging.Internal;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [ModuleDependency(typeof(Web.InitializationModule))]
    public class ProjectItemStoreHiderInitializer : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Intercept<ProjectLoaderService>(
                (locator, defaultProjectLoaderService) => new CustomProjectLoaderService(defaultProjectLoaderService,
                    ServiceLocator.Current.GetInstance<ProjectRepository>(),
                    ServiceLocator.Current.GetInstance<CurrentProject>(),
                    ServiceLocator.Current.GetInstance<ContentLoaderService>(),
                    ServiceLocator.Current.GetInstance<ISiteConfigurationRepository>(),
                    ServiceLocator.Current.GetInstance<IConfigurationSource>(),
                    ServiceLocator.Current.GetInstance<LocalBlockResolver>()));

            context.Services.Intercept<ProjectService>(
                (locator, defaultProjectService) => new CustomProjectService(defaultProjectService,
                    ServiceLocator.Current.GetInstance<ProjectRepository>(),
                    ServiceLocator.Current.GetInstance<ProjectPublisher>(),
                    ServiceLocator.Current.GetInstance<ContentService>(),
                    ServiceLocator.Current.GetInstance<ContentChangeManager>(),
                    ServiceLocator.Current.GetInstance<LanguageSelectorFactory>(),
                    ServiceLocator.Current.GetInstance<CurrentProject>(),
                    ServiceLocator.Current.GetInstance<ISiteConfigurationRepository>(),
                    ServiceLocator.Current.GetInstance<IConfigurationSource>(),
                    ServiceLocator.Current.GetInstance<ApprovalService>(),
                    ServiceLocator.Current.GetInstance<LocalizationService>(),
                    ServiceLocator.Current.GetInstance<LocalBlockResolver>()));

            context.Services.Intercept<PushMessenger>(
                (locator, defaultPushMessenger) => new CustomPushMessenger(defaultPushMessenger,
                    ServiceLocator.Current.GetInstance<LocalBlockResolver>(),
                    ServiceLocator.Current.GetInstance<ProjectService>()));
        }

        public void Initialize(InitializationEngine context)
        {

        }

        public void Uninitialize(InitializationEngine context)
        {

        }
    }
}
