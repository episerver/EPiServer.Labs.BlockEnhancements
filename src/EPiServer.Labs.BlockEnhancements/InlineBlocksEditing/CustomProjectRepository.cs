using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using EPiServer.Core;
using EPiServer.DataAbstraction;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class CustomProjectRepository : ProjectRepository
    {
        private readonly ProjectRepository _defaultProjectRepository;
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;
        private readonly IContentLoader _contentLoader;

        public CustomProjectRepository(ProjectRepository defaultProjectRepository,
            BlockEnhancementsOptions blockEnhancementsOptions, IContentLoader contentLoader)
        {
            _defaultProjectRepository = defaultProjectRepository;
            _contentLoader = contentLoader;
            _blockEnhancementsOptions = blockEnhancementsOptions;
        }

        public override Project Get(int id)
        {
            return _defaultProjectRepository.Get(id);
        }

        public override void Save(Project project)
        {
            _defaultProjectRepository.Save(project);
        }

        public override void Delete(int id)
        {
            _defaultProjectRepository.Delete(id);
        }

        public override IEnumerable<Project> List(ProjectStatus? status, int startIndex, int maxRows, out int totalCount)
        {
            return _defaultProjectRepository.List(status, startIndex, maxRows, out totalCount);
        }

        public override ProjectItem GetItem(int id)
        {
            return _defaultProjectRepository.GetItem(id);
        }

        public override IEnumerable<ProjectItem> ListItems(int id, string category, CultureInfo language,
            int startIndex, int maxRows, out int totalCount)
        {
            return _defaultProjectRepository.ListItems(id, category, language, startIndex, maxRows, out totalCount);
        }

        public override IEnumerable<ProjectItem> GetItems(IEnumerable<ContentReference> contentReferences)
        {
            return _defaultProjectRepository.GetItems(contentReferences);
        }

        /// <summary>
        /// If IsLocalFeatureEnabled is `true` then we won't create a ProjectItem for local content items at all
        /// </summary>
        /// <param name="projectItems"></param>
        public override void SaveItems(IEnumerable<ProjectItem> projectItems)
        {
            _defaultProjectRepository.SaveItems(_blockEnhancementsOptions.LocalContentFeatureEnabled
                ? projectItems.Where(x => !_contentLoader.IsLocalContent(x.ContentLink.ToReferenceWithoutVersion()))
                : projectItems);
        }

        public override void DeleteItems(IEnumerable<int> projectItems)
        {
            _defaultProjectRepository.DeleteItems(projectItems);
        }
    }
}
