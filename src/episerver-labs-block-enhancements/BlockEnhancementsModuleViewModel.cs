using System;
using System.Collections.Generic;
using EPiServer.Framework.Web.Resources;
using EPiServer.ServiceLocation;
using EPiServer.Shell.Modules;
using EPiServer.Shell.Services.Rest;

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
            string GetAssemblyVersion(Type type)
            {
                return type.Assembly.GetName().Version.ToString();
            }

            var options = ServiceLocator.Current.GetInstance<BlockEnhancementsOptions>();

            var model = new BlockEnhancementsModuleViewModel(this, clientResourceService, options);
            model.InstalledModules["CmsUI"] = GetAssemblyVersion(typeof(RestControllerBase));
            model.InstalledModules["BlockEnhancements"] = GetAssemblyVersion(typeof(BlockEnhancementsModule));
            return model;
        }
    }

    public class BlockEnhancementsModuleViewModel : ModuleViewModel
    {
        public BlockEnhancementsModuleViewModel(ShellModule shellModule, IClientResourceService clientResourceService, BlockEnhancementsOptions options) :
            base(shellModule, clientResourceService)
        {
            Options = options;
            InstalledModules = new Dictionary<string, string>();
        }

        public BlockEnhancementsOptions Options { get; }

        public Dictionary<string, string> InstalledModules { get; }
    }
}
