using System.Collections.Generic;
using System.Linq;
using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Cms.Shell.UI.Rest;
using EPiServer.Cms.Shell.UI.Rest.Approvals;
using EPiServer.Cms.Shell.UI.Rest.Projects;
using EPiServer.Cms.Shell.UI.Rest.Projects.Internal;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Configuration;
using EPiServer.Framework.Localization;
using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class CustomProjectService : ProjectService
    {
        private readonly ProjectService _defaultProjectService;
        private readonly LocalBlockResolver _localBlockResolver;

        public CustomProjectService(ProjectService defaultProjectService, ProjectRepository projectRepository,
            ProjectPublisher projectPublisher, ContentService contentService,
            IContentChangeManager contentChangeManager,
            LanguageSelectorFactory languageSelectorFactory, CurrentProject currentProject,
            ISiteConfigurationRepository siteConfigurationRepository, IConfigurationSource configurationSource,
            ApprovalService approvalService, LocalizationService localizationService,
            LocalBlockResolver localBlockResolver) : base(projectRepository,
            projectPublisher, contentService, contentChangeManager, languageSelectorFactory, currentProject,
            siteConfigurationRepository, configurationSource, approvalService, localizationService)
        {
            _defaultProjectService = defaultProjectService;
            _localBlockResolver = localBlockResolver;
        }

        public override ProjectItem GetProjectItem(int projectItemId)
        {
            var projectItem = _defaultProjectService.GetProjectItem(projectItemId);
            return GetLocalOnly(new [] { projectItem }).FirstOrDefault();
        }

        public override RangedItems<ProjectItem> GetItems(int projectId, int? start, int? end)
        {
            var rangedItems = _defaultProjectService.GetItems(projectId, start, end);
            return EnsureLocalOnly(rangedItems);
        }

        public override RangedItems<ProjectItem> GetItems(IEnumerable<ContentReference> contentReferences)
        {
            var rangedItems = _defaultProjectService.GetItems(contentReferences);
            return EnsureLocalOnly(rangedItems);
        }

        private IEnumerable<ProjectItem> GetLocalOnly(IEnumerable<ProjectItem> projectItems)
        {
            if (!_localBlockResolver.ShouldFilterOutLocalBlocks())
                return projectItems;

            return projectItems.Where(x =>
                x != null && x.ContentLink != null &&
                !_localBlockResolver.IsLocal(x.ContentLink.ToReferenceWithoutVersion()));
        }

        private RangedItems<ProjectItem> EnsureLocalOnly(RangedItems<ProjectItem> projectItems)
        {
            var filtered = GetLocalOnly(projectItems.Items).ToList();
            return new RangedItems<ProjectItem>(filtered, new ItemRange
            {
                Total = filtered.Count,
                Start = 0,
                End = filtered.Count - 1
            });
        }
    }
}
