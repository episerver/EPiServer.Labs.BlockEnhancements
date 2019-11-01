using System.Web;
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.Labs.BlockEnhancements;
using EPiServer.ServiceLocation;

namespace AlloyTemplates.Business.Initialization
{
    [InitializableModule]
    public class CustomBlockEnhancementsModule : IInitializableHttpModule
    {
        public void Initialize(InitializationEngine context)
        {
            var options = ServiceLocator.Current.GetInstance<BlockEnhancementsOptions>();
            options.InlineEditing = true;
            options.PublishWithLocalContentItems = true;
            options.ContentDraftView = true;
            options.InlinePublish = true;
            options.StatusIndicator = true;
            options.ContentAreaBrowse = true;
            options.InlineCreate = true;
        }

        public void Uninitialize(InitializationEngine context)
        {

        }

        public void InitializeHttpEvents(HttpApplication application)
        {

        }
    }
}
