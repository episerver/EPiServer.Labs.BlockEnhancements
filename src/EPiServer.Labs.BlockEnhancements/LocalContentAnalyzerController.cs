using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using Castle.Facilities.TypedFactory.Internal;
using EPiServer.Cms.Shell;
using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Localization;
using EPiServer.Security;
using EPiServer.ServiceLocation;
using EPiServer.Shell;
using EPiServer.Shell.Services.Rest;
using EPiServer.Web;

namespace EPiServer.Labs.BlockEnhancements
{
    public class LocalContentAnalyzerController : Controller
    {
        private readonly IContentModelUsage _contentModelUsage;
        private readonly IContentTypeRepository _contentTypeRepository;
        private readonly IContentRepository _contentRepository;
        private readonly ContentLoaderService _contentLoaderService;
        private readonly ServiceAccessor<SiteDefinition> _currentSiteDefinition;
        private readonly ServiceAccessor<HttpContextBase> _httpContextAccessor;
        private readonly LocalizationService _localizationService;
        private readonly ContentAssetHelper _contentAssetHelper;

        public LocalContentAnalyzerController(IContentModelUsage contentModelUsage,
            IContentTypeRepository contentTypeRepository, IContentRepository contentRepository,
            ContentLoaderService contentLoaderService,
            ServiceAccessor<SiteDefinition> currentSiteDefinition, ServiceAccessor<HttpContextBase> httpContextAccessor,
            LocalizationService localizationService, ContentAssetHelper contentAssetHelper)
        {
            _contentModelUsage = contentModelUsage;
            _contentTypeRepository = contentTypeRepository;
            _contentRepository = contentRepository;
            _contentLoaderService = contentLoaderService;
            _currentSiteDefinition = currentSiteDefinition;
            _httpContextAccessor = httpContextAccessor;
            _localizationService = localizationService;
            _contentAssetHelper = contentAssetHelper;
        }

        [HttpGet]
        public ActionResult GetStatistics()
        {
            var blockTypes = _contentTypeRepository.List().Where(x => x.Base == ContentTypeBase.Block);
            var count = 0;
            var localCount = 0;
            var sharedBlocks = new List<ContentReference>();
            foreach (var blockType in blockTypes)
            {
                var listContentOfContentType = _contentModelUsage.ListContentOfContentType(blockType)
                    .Where(x => !x.ContentLink.IsExternalProvider && IsBlock(x.ContentLink))
                    .DistinctBy(x => x.ContentLink.ToReferenceWithoutVersion()).ToList();
                var localBlocks = listContentOfContentType.Where(x => _contentRepository.IsLocalContent(x.ContentLink));
                count += listContentOfContentType.Count;
                localCount += localBlocks.Count();
                var contentReferences = listContentOfContentType.Except(localBlocks);
                sharedBlocks.AddRange(contentReferences.Select(x => x.ContentLink));
            }

            var unusedSharedBlocks = 0;
            var sharedBlocksReferencedJustOnceCount = 0;
            foreach (var contentReference in sharedBlocks)
            {
                var references = GetUniqueReferences(contentReference);
                if (references.Count == 1)
                {
                    sharedBlocksReferencedJustOnceCount++;
                }

                if (!references.Any())
                {
                    unusedSharedBlocks++;
                }
            }

            return new RestResult
            {
                Data =
                    new LocalContentAnalyzerStatistics
                    {
                        BlockInstancesCount = count,
                        LocalBlockInstancesCount = localCount,
                        SharedBlockInstancesCount = count - localCount,
                        SharedBlocksReferencedJustOnceCount = sharedBlocksReferencedJustOnceCount,
                        UnusedSharedBlocks = unusedSharedBlocks,
                        RealSharedBlocks =
                            count - localCount - unusedSharedBlocks - sharedBlocksReferencedJustOnceCount,
                        LocalBlockRatio = Math.Round((decimal)localCount / count * 100) + "%",
                    },
                SafeResponse = true
            };
        }

        [HttpGet]
        public ActionResult GetSharedBlocksToConvert(string searchText = null, int maxItemsToDisplay = 50)
        {
            var blockTypes = _contentTypeRepository.List().Where(x => x.Base == ContentTypeBase.Block);
            var sharedBlocks = new List<ContentReference>();
            foreach (var blockType in blockTypes)
            {
                var listContentOfContentType = _contentModelUsage.ListContentOfContentType(blockType)
                    .Where(x => !x.ContentLink.IsExternalProvider).DistinctBy(x => x.ContentLink.ToReferenceWithoutVersion());
                var filteredSharedBlocks = listContentOfContentType.Where(x => !_contentRepository.IsLocalContent(x.ContentLink) && IsBlock(x.ContentLink));
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    filteredSharedBlocks = filteredSharedBlocks.Where(x =>
                        x.Name.ToLowerInvariant().Contains(searchText.ToLowerInvariant()));
                }
                sharedBlocks.AddRange(filteredSharedBlocks.Select(x => x.ContentLink));
            }

            var sharedBlocksToConvert = new List<Dependency>();
            var currentUser = _httpContextAccessor()?.User?.Identity?.Name;
            var you = _localizationService.GetStringByCulture("/episerver/shared/text/yousubject",
                CultureInfo.CurrentCulture);

            foreach (var contentReference in sharedBlocks)
            {
                var references = GetUniqueReferences(contentReference);
                if (references.Count != 1)
                {
                    continue;
                }

                var content = _contentRepository.Get<IContent>(contentReference.ToReferenceWithoutVersion());
                var dependency = new Dependency
                {
                    ContentLink = content.ContentLink,
                    Name = content.Name,
                    TypeIdentifier = content.GetOriginalType().Name,
                    TreePath = GetTreePath(content),
                    Uri = GetUrl(content)
                };

                if (content is IChangeTrackable changeTrackable)
                {
                    var isCurrentUser = changeTrackable.ChangedBy.Equals(currentUser,
                        StringComparison.InvariantCultureIgnoreCase);
                    dependency.Changed = TimeAgoFormatter.RelativeDate(changeTrackable.Saved);
                    dependency.ChangedBy = isCurrentUser ? you : changeTrackable.ChangedBy;
                }

                sharedBlocksToConvert.Add(dependency);
            }

            return new RestResult
            {
                Data = sharedBlocksToConvert.Take(maxItemsToDisplay),
                SafeResponse = true
            };
        }

        [HttpPost]
        public ActionResult MoveToLocalFolder(Dto dto)
        {
            var references = GetUniqueReferences(dto.ContentLink);
            if (references.Count != 1)
            {
                return new RestStatusCodeResult(HttpStatusCode.BadRequest);
            }

            var ownerId = references.FirstOrDefault()?.OwnerID;
            if (ownerId == null)
            {
                return new RestStatusCodeResult(HttpStatusCode.BadRequest);
            }

            var targetForThisFolder = _contentAssetHelper.GetOrCreateAssetFolder(ownerId)?.ContentLink;
            _contentRepository.Move(dto.ContentLink, targetForThisFolder, AccessLevel.NoAccess, AccessLevel.NoAccess);
            return new EmptyResult();
        }

        private IEnumerable<string> GetTreePath(IContent content)
        {
            return _contentLoaderService.GetAncestorNames(content, _currentSiteDefinition())
                .Select(HttpUtility.HtmlEncode);
        }

        private Uri GetUrl(IContent content)
        {
            try
            {
                var uiUrl = Configuration.Settings.Instance.UIUrl;
                var epiPrefix = uiUrl.ToString().Trim('~');
                var siteUrl = Request.Url.GetLeftPart(UriPartial.Authority) + Request.ApplicationPath + epiPrefix;
                var epiUrl = new Uri(siteUrl, UriKind.Absolute);
                return new Uri(epiUrl + "#context=" + content.GetUri(), UriKind.Absolute);
            }
            catch
            {
                return null;
            }
        }

        private bool IsBlock(ContentReference contentLink)
        {
            return _contentLoaderService.Get<IContent>(contentLink) is BlockData;
        }

        private List<ReferenceInformation> GetUniqueReferences(ContentReference contentLink)
        {
            return _contentRepository.GetReferencesToContent(contentLink, false)
                .DistinctBy(x => x.OwnerID.ToReferenceWithoutVersion()).ToList();
        }
    }

    public class Dto
    {
        public ContentReference ContentLink { get; set; }
    }

    public static class EnumerableExtensions
    {
        public static IEnumerable<T> DistinctBy<T, TKey>(this IEnumerable<T> enumerable, Func<T, TKey> keySelector)
        {
            return enumerable.GroupBy(keySelector).Select(grp => grp.First());
        }
    }
}
