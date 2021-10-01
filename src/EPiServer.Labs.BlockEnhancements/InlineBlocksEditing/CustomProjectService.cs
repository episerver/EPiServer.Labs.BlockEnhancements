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

        private RangedItems<ProjectItem> EnsureLocalOnly(RangedItems<ProjectItem> projectItems)
        {
            if (!_localBlockResolver.ShouldFilterOutLocalBlocks())
                return projectItems;

            var filtered = projectItems.Items.Where(x =>
                !_localBlockResolver.IsLocal(x.ContentLink.ToReferenceWithoutVersion()));
            return new RangedItems<ProjectItem>(filtered, new ItemRange
            {
                Total = filtered.Count(),
                Start = 0,
                End = filtered.Count() - 1
            });
        }
    }
}
