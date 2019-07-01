using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.ServiceLocation;
using EPiServer.Web;
using EPiServer.Web.Mvc.Html;

namespace EPiServer.Labs.BlockEnhancements.ContentDraftView
{
    [ModuleDependency(typeof(EPiServer.Web.InitializationModule))]
    public class ContentDraftViewInitializer : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Intercept<IContentAreaLoader>(
                (locator, defaultContentAreaLoader) => new CustomContentAreaLoader(defaultContentAreaLoader));

            context.Services.Intercept<ContentAreaRenderer>(
                (locator, defaultContentAreaRenderer) => new DraftContentAreaRenderer(defaultContentAreaRenderer));
        }
        public void Initialize(InitializationEngine context) { }
        public void Uninitialize(InitializationEngine context) { }
    }
}
