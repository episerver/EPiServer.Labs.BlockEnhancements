using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.Labs.BlockEnhancements;
using EPiServer.ServiceLocation;

namespace AlloyTemplates.Business.Initialization
{
    [InitializableModule]
    [ModuleDependency(typeof(FrameworkInitialization))]
    public class CustomBlockEnhancementsModule : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Configure<BlockEnhancementsOptions>(options =>
            {
                options.PublishWithLocalContentItems = false;
                options.StatusIndicator = true;
                options.ContentAreaSettings = new ContentAreaSettings
                {
                    ContentAreaBrowse = true
                };
                options.InlineTranslate = true;
            });
        }

        public void Initialize(InitializationEngine context) { }

        public void Uninitialize(InitializationEngine context) { }
    }
}
