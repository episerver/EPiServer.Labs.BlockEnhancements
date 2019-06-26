using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using EPiServer.Cms.Shell.UI.Rest;
using EPiServer.Cms.Shell.UI.Rest.ContentQuery;
using EPiServer.Cms.Shell.UI.Rest.Models;
using EPiServer.Core;
using EPiServer.Globalization;
using EPiServer.Security;

namespace EPiServer.Labs.BlockEnhancements.StatusIndicator
{
    public class LatestContentResolver
    {
        private readonly IContentStoreModelCreator _contentStoreModelCreator;
        private readonly IContentLoader _contentLoader;
        private readonly IContentVersionRepository _contentVersionRepository;
        private readonly LanguageResolver _languageResolver;

        public LatestContentResolver(IContentStoreModelCreator contentStoreModelCreator, IContentVersionRepository contentVersionRepository, LanguageResolver languageResolver, IContentLoader contentLoader)
        {
            _contentStoreModelCreator = contentStoreModelCreator;
            _contentVersionRepository = contentVersionRepository;
            _languageResolver = languageResolver;
            _contentLoader = contentLoader;
        }

        public IEnumerable<ContentReference> GetLatestVersions(IEnumerable<ContentReference> ids, NameValueCollection queryString)
        {
            if (ids == null)
            {
                return null;
            }

            var draftLinks = new List<ContentReference>();
            foreach (var id in ids)
            {
                var content = _contentLoader.Get<IContent>(id) as IVersionable;
                if (content == null)
                {
                    draftLinks.Add(id);
                    continue;
                }

                if (content.Status == VersionStatus.Published)
                {
                    var contentVersion =
                        _contentVersionRepository.LoadCommonDraft(id, _languageResolver.GetPreferredCulture().Name);
                    if (contentVersion != null)
                    {
                        draftLinks.Add(contentVersion.ContentLink);
                        continue;
                    }
                }

                draftLinks.Add(id);
            }

            var contents = _contentLoader.GetItems(draftLinks,
                new LoaderOptions {LanguageLoaderOption.FallbackWithMaster()});
            var queryParameters = new ContentQueryParameters
            {
                AllParameters = queryString,
                CurrentPrincipal = PrincipalInfo.CurrentPrincipal
            };
            // The ContentVersionFilter modify content links.
            // We have to use this filter here to make sure that we will use proper links
            var contentModels = _contentStoreModelCreator
                .CreateContentDataStoreModels<StructureStoreContentDataModel>(contents, queryParameters).ToList();
            return contentModels.Select(x => x.ContentLink);
        }
    }
}
