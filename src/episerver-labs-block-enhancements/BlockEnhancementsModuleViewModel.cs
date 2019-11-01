using EPiServer.Framework.Web.Resources;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Modules;

namespace EPiServer.Labs.BlockEnhancements
{
    [Options]
    public class BlockEnhancementsOptions
    {
        public bool InlineEditing { get; set; } = true;
        public bool StatusIndicator { get; set; } = true;
        public bool InlinePublish { get; set; } = true;
        public bool PublishWithLocalContentItems { get; set; } = true;
        public bool ContentDraftView { get; set; } = true;
        public bool ContentAreaBrowse { get; set; } = true;
        public bool InlineCreate { get; set; } = true;
    }

    public class BlockEnhancementsModule : ShellModule
    {
        public BlockEnhancementsModule(string name, string routeBasePath, string resourceBasePath)
            : base(name, routeBasePath, resourceBasePath)
        {
        }

        /// <inheritdoc />
        public override ModuleViewModel CreateViewModel(ModuleTable moduleTable, IClientResourceService clientResourceService)
        {
            var options = ServiceLocator.Current.GetInstance<BlockEnhancementsOptions>();
            return new BlockEnhancementsModuleViewModel(this, clientResourceService, options);
        }
    }

    public class BlockEnhancementsModuleViewModel : ModuleViewModel
    {
        public BlockEnhancementsModuleViewModel(ShellModule shellModule, IClientResourceService clientResourceService, BlockEnhancementsOptions options) :
            base(shellModule, clientResourceService)
        {
            Options = options;
        }

        public BlockEnhancementsOptions Options { get; }
    }
}
