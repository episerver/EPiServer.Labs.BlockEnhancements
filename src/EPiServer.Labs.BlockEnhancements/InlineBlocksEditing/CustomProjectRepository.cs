using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Cache;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class CustomProjectRepository : ProjectRepository
    {
        private readonly ProjectRepository _defaultProjectRepository;
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;
        private readonly IContentLoader _contentLoader;
        private readonly IObjectInstanceCache _cache;
        internal const string CacheKey = "EPi:Labs:IsLocalBlock";
        private static readonly object _cacheLock = new object();

        public CustomProjectRepository(ProjectRepository defaultProjectRepository,
            BlockEnhancementsOptions blockEnhancementsOptions, IContentLoader contentLoader,
            IObjectInstanceCache cache)
        {
            _defaultProjectRepository = defaultProjectRepository;
            _blockEnhancementsOptions = blockEnhancementsOptions;
            _contentLoader = contentLoader;
            _cache = cache;
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
            return EnsureLocalOnly(_defaultProjectRepository.ListItems(id, category, language, startIndex, maxRows,
                out totalCount));
        }

        private bool IsProjectOverviewCall()
        {
            return HttpContext.Current != null && HttpContext.Current.Request.RawUrl.Contains("/project-item/");
        }

        private IEnumerable<ProjectItem> EnsureLocalOnly(IEnumerable<ProjectItem> projectItems)
        {
            return _blockEnhancementsOptions.LocalContentFeatureEnabled && IsProjectOverviewCall()
                ? projectItems.Where(x => !GetIsLocal(x.ContentLink.ToReferenceWithoutVersion()))
                : projectItems;
        }

        private bool GetIsLocal(ContentReference contentLink)
        {
            var key = CacheKey + contentLink;
            var cachedValue = _cache.Get(key);
            if (cachedValue is null)
            {
                lock (_cacheLock)
                {
                    cachedValue = _cache.Get(key);
                    if (cachedValue != null)
                    {
                        return (bool)cachedValue;
                    }

                    cachedValue = _contentLoader.IsLocalContent(contentLink);
                    _cache.Insert(key, cachedValue, null);
                }
            }
            return (bool)cachedValue;
        }

        public override IEnumerable<ProjectItem> GetItems(IEnumerable<ContentReference> contentReferences)
        {
            return EnsureLocalOnly(_defaultProjectRepository.GetItems(contentReferences));
        }

        public override void SaveItems(IEnumerable<ProjectItem> projectItems)
        {
            _defaultProjectRepository.SaveItems(projectItems);
        }

        public override void DeleteItems(IEnumerable<int> projectItems)
        {
            _defaultProjectRepository.DeleteItems(projectItems);
        }
    }
}
