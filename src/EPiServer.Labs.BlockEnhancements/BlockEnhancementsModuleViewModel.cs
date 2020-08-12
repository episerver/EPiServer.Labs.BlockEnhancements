using EPiServer.Framework.Web.Resources;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Modules;
using EPiServer.Shell.ObjectEditing.EditorDescriptors;

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
        public bool InlineCreate { get; set; } = true;
        public ContentAreaSettings ContentAreaSettings { get; set; }
    }

    /// <summary>
    /// Settings specific to ContentArea property
    /// </summary>
    public class ContentAreaSettings
    {
        /// <summary>
        /// Show the custom content item browser from within Content Area editor?
        /// </summary>
        public bool ContentAreaBrowse { get; set; } = true;

        /// <summary>
        /// EditorDescriptor behavior,
        /// </summary>
        public EditorDescriptorBehavior ContentAreaEditorDescriptorBehavior { get; set; } =
            EditorDescriptorBehavior.OverrideDefault;

        /// <summary>
        /// The UIHint value that the custom content area will be available by
        /// If you decide to specify a custom UIHint then you can change the behavior from
        /// OverrideDefault to ExtendBase if for example you have your own custom
        /// ContentArea descriptor.
        /// </summary>
        public string UIHint { get; set; }
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
