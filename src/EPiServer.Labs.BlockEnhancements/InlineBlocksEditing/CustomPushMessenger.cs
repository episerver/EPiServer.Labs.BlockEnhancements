using System.Linq;
using System.Threading.Tasks;
using EPiServer.Cms.Shell.UI.Rest.Projects.Internal;
using EPiServer.Cms.Shell.UI.Rest.Projects.Internal.Models;
using EPiServer.Shell.UI.Messaging.Internal;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class CustomPushMessenger : PushMessenger
    {
        private readonly ProjectService _projectService;
        private readonly PushMessenger _defaultPushMessenger;
        private readonly LocalBlockResolver _localBlockResolver;
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;

        private const string ProjectItemKey = "/episerver/cms/project-item";

        public CustomPushMessenger(PushMessenger defaultPushMessenger, LocalBlockResolver localBlockResolver,
            ProjectService projectService, BlockEnhancementsOptions blockEnhancementsOptions)
        {
            _defaultPushMessenger = defaultPushMessenger;
            _localBlockResolver = localBlockResolver;
            _projectService = projectService;
            _blockEnhancementsOptions = blockEnhancementsOptions;
        }

        public override Task SendAsync(PushMessage message)
        {
            if (!_blockEnhancementsOptions.LocalContentFeatureEnabled)
            {
                return _defaultPushMessenger.SendAsync(message);
            }

            if (message.Topic != ProjectItemKey ||
                !(message.Data is ProjectItemEventViewModel[] projectItemEventViewModels))
            {
                return _defaultPushMessenger.SendAsync(message);
            }

            var projectItemEventViewModel = projectItemEventViewModels.FirstOrDefault();
            if (projectItemEventViewModel == null)
            {
                return _defaultPushMessenger.SendAsync(message);
            }

            var projectItem = _projectService.GetProjectItem(projectItemEventViewModel.Id);
            if (projectItem == null)
            {
                return _defaultPushMessenger.SendAsync(message);
            }

            return _localBlockResolver.IsLocal(projectItem.ContentLink)
                ? Task.CompletedTask
                : _defaultPushMessenger.SendAsync(message);
        }
    }
}
