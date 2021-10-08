using System.Collections.Generic;
using System.Linq;
using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Cms.Shell.UI.Rest.Projects;
using EPiServer.Cms.Shell.UI.Rest.Projects.Internal;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Configuration;
using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class CustomProjectLoaderService : ProjectLoaderService
    {
        private readonly ProjectLoaderService _defaultProjectLoaderService;
        private readonly LocalBlockResolver _localBlockResolver;

        public CustomProjectLoaderService(ProjectLoaderService defaultProjectLoaderService,
            ProjectRepository projectRepository, CurrentProject currentProject,
            ContentLoaderService contentLoaderService, ISiteConfigurationRepository siteConfigurationRepository,
            IConfigurationSource configurationSource, LocalBlockResolver localBlockResolver) : base(projectRepository,
            currentProject, contentLoaderService, siteConfigurationRepository, configurationSource)
        {
            _defaultProjectLoaderService = defaultProjectLoaderService;
            _localBlockResolver = localBlockResolver;
        }

        public override ProjectItem GetProjectItem(int projectItemId)
        {
            var projectItem = _defaultProjectLoaderService.GetProjectItem(projectItemId);
            return GetLocalOnly(new [] { projectItem }).FirstOrDefault();
        }

        private IEnumerable<ProjectItem> GetLocalOnly(IEnumerable<ProjectItem> projectItems)
        {
            if (!_localBlockResolver.ShouldFilterOutLocalBlocks())
                return projectItems;

            return projectItems.Where(x =>
                !_localBlockResolver.IsLocal(x.ContentLink.ToReferenceWithoutVersion()));
        }

        public override RangedItems<ProjectItem> GetItems(int projectId, int? start, int? end)
        {
            var rangedItems = _defaultProjectLoaderService.GetItems(projectId, start, end);
            return EnsureLocalOnly(rangedItems);
        }

        public override RangedItems<ProjectItem> GetItems(IEnumerable<ContentReference> contentReferences)
        {
            var rangedItems = _defaultProjectLoaderService.GetItems(contentReferences);
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
