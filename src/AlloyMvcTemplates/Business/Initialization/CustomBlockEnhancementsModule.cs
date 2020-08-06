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
                options.InlineEditing = true;
                options.PublishWithLocalContentItems = true;
                options.ContentDraftView = true;
                options.InlinePublish = true;
                options.StatusIndicator = true;
                options.ContentAreaSettings = new ContentAreaSettings
                {
                    ContentAreaBrowse = true
                };
                options.InlineCreate = true;
            });
        }

        public void Initialize(InitializationEngine context) { }

        public void Uninitialize(InitializationEngine context) { }
    }
}
