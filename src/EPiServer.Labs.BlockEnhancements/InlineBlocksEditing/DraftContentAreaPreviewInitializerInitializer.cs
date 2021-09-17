using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using EPiServer.Web;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [ModuleDependency(typeof(Web.InitializationModule))]
    public class DraftContentAreaPreviewInitializerInitializer : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Intercept<IContentAreaLoader>(
                (locator, defaultContentAreaLoader) => new CustomContentAreaLoader(defaultContentAreaLoader,
                    ServiceLocator.Current.GetInstance<IContextModeResolver>(),
                    ServiceLocator.Current.GetInstance<IContentVersionMapper>()));
        }

        public void Initialize(InitializationEngine context)
        {

        }

        public void Uninitialize(InitializationEngine context)
        {

        }
    }
}
