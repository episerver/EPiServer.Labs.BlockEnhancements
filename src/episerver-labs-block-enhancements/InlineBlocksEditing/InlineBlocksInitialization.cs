using EPiServer.Core;
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.Shell.ObjectEditing;
using Task = System.Threading.Tasks.Task;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    /// <summary>
    /// Module used to register <see cref="BlocksEditingMetadataExtender"/>
    /// </summary>
    [ModuleDependency(typeof(Shell.UI.InitializationModule))]
    [ModuleDependency(typeof(Web.InitializationModule))]
    [ModuleDependency(typeof(Cms.Shell.InitializableModule))]
    public class InlineBlocksInitializableModule : IInitializableModule
    {
        public void Initialize(InitializationEngine context)
        {
            var task = Task.Factory.StartNew(() =>
            {
                var editorRegistry = context.Locate.Advanced.GetInstance<MetadataHandlerRegistry>();
                editorRegistry.RegisterMetadataHandler(typeof(ContentData), context.Locate.Advanced.GetInstance<BlocksEditingMetadataExtender>());
            });

            context.InitComplete += (sender, args) => task.Wait();
        }

        void IInitializableModule.Uninitialize(InitializationEngine context) { }
    }
}
