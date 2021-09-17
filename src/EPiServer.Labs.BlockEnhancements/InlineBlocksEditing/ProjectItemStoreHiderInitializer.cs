using EPiServer.DataAbstraction;
using EPiServer.Framework;
using EPiServer.Framework.Cache;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [ModuleDependency(typeof(Web.InitializationModule))]
    public class ProjectItemStoreHiderInitializer : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Intercept<ProjectRepository>(
                (locator, defaultProjectRepository) => new CustomProjectRepository(defaultProjectRepository,
                    ServiceLocator.Current.GetInstance<BlockEnhancementsOptions>(),
                    ServiceLocator.Current.GetInstance<IContentLoader>(),
                    ServiceLocator.Current.GetInstance<IObjectInstanceCache>()));
        }

        public void Initialize(InitializationEngine context)
        {

        }

        public void Uninitialize(InitializationEngine context)
        {

        }
    }
}
