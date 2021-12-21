using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Web.Resources;
using EPiServer.ServiceLocation;
using EPiServer.Shell;
using EPiServer.Shell.Modules;
using EPiServer.Shell.ObjectEditing.EditorDescriptors;

namespace EPiServer.Labs.BlockEnhancements
{
    [Options]
    public class BlockEnhancementsOptions
    {
        private readonly UIDescriptorRegistry _uiDescriptorRegistry;
        private readonly IContentTypeRepository _contentTypeRepository;

        public BlockEnhancementsOptions(UIDescriptorRegistry uiDescriptorRegistry, IContentTypeRepository contentTypeRepository)
        {
            _uiDescriptorRegistry = uiDescriptorRegistry;
            _contentTypeRepository = contentTypeRepository;
        }

        public bool StatusIndicator { get; set; } = true;
        public bool PublishPageWithBlocks { get; set; } = false;
        public bool InlineTranslate { get; set; } = false;
        public bool HideForThisFolder { get; set; } = true;
        public bool LocalContentFeatureEnabled { get; set; } = true;
        public bool AllowQuickEditOnSharedBlocks { get; set; } = false;

        public IEnumerable<string> IgnoredBlockTypeIdentifiersOnQuickEdit { get; private set; } = new []
        {
            "episerver.forms.core.blockbase"
        };

        public IEnumerable<Type> IgnoreQuickEditOnBlockTypes
        {
            set
            {
                if (value == null)
                {
                    return;
                }

                var contentTypesToIgnore = value.Select(x => _contentTypeRepository.Load(x));

                var ignoredTypeIdentifiers = contentTypesToIgnore
                    .Select(x =>
                        _uiDescriptorRegistry
                            .GetTypeIdentifiers(x.ModelType ??
                                                ((x is PageType) ? typeof(PageData) : typeof(IContentData)))
                            .FirstOrDefault())
                    .Where(x => x != null);
                IgnoredBlockTypeIdentifiersOnQuickEdit =
                    IgnoredBlockTypeIdentifiersOnQuickEdit.Concat(ignoredTypeIdentifiers);
            }
        }

        public IEnumerable<string> IgnoreQuickEditOnBlockTypeIdentifiers
        {
            set => IgnoredBlockTypeIdentifiersOnQuickEdit = IgnoredBlockTypeIdentifiersOnQuickEdit.Concat(value ?? Enumerable.Empty<string>());
        }

        public ContentAreaSettings ContentAreaSettings { get; set; } = new ContentAreaSettings();
    }

    /// <summary>
    /// Settings specific to ContentArea property
    /// </summary>
    public class ContentAreaSettings
    {
        /// <summary>
        /// Show the custom content item browser from within Content Area editor?
        /// </summary>
        public bool ContentAreaBrowse { get; set; } = false;

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
