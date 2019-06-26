using System.Collections.Generic;
using System.Globalization;
using System.Web.Mvc;
using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Core;
using EPiServer.Globalization;
using EPiServer.Labs.BlockEnhancements.StatusIndicator;
using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements
{
    [RestStore("episerverlabsblockenhancements")]
    public class BlockEnhancementsStore : RestControllerBase
    {
        private readonly IContentRepository _contentRepository;
        private readonly ContentLoaderService _contentLoaderService;
        private readonly LanguageResolver _languageResolver;
        private readonly LatestContentResolver _latestContentResolver;

        public BlockEnhancementsStore(ContentLoaderService contentLoaderService, IContentRepository contentRepository,
            LanguageResolver languageResolver, LatestContentResolver latestContentResolver)
        {
            _contentLoaderService = contentLoaderService;
            _contentRepository = contentRepository;
            _languageResolver = languageResolver;
            _latestContentResolver = latestContentResolver;
        }

        public IEnumerable<ContentReference> GetLocalDescendants(ContentReference contentAssetFolderLink,
            CultureInfo preferredCulture)
        {
            bool IsCorrectStatus(ExtendedVersionStatus versionStatus)
            {
                return versionStatus == ExtendedVersionStatus.CheckedOut ||
                       versionStatus == ExtendedVersionStatus.CheckedIn ||
                       versionStatus == ExtendedVersionStatus.Rejected ||
                       versionStatus == ExtendedVersionStatus.PreviouslyPublished;
            }

            var descendents = _contentRepository.GetDescendents(contentAssetFolderLink);

            var list = new List<ContentReference>();
            foreach (var contentReference in descendents)
            {
                var innerContent = _contentRepository.Get<IContent>(contentReference);
                if (!(innerContent is BlockData))
                {
                    continue;
                }

                if (IsCorrectStatus(innerContent.GetCalculatedStatus()))
                {
                    list.Add(innerContent.ContentLink);
                    continue;
                }

                var block = innerContent as IVersionable;

                if (block.Status != VersionStatus.Published)
                {
                    continue;
                }

                var contentVersion = _contentLoaderService.GetCommonDraft(innerContent.ContentLink, preferredCulture);
                if (contentVersion == null)
                {
                    continue;
                }

                var status = (ExtendedVersionStatus) (int) contentVersion.Status;
                if (IsCorrectStatus(status))
                {
                    list.Add(contentVersion.ContentLink);
                }
            }

            return list;
        }

        public RestResultBase GetLatestVersions(IEnumerable<ContentReference> ids)
        {
            var queryString = ControllerContext.HttpContext.Request.QueryString;
            return Rest(_latestContentResolver.GetLatestVersions(ids, queryString));
        }

        [HttpGet]
        public ActionResult Get(ContentReference id)
        {
            return Rest(GetLocalDescendants(id, _languageResolver.GetPreferredCulture()));
        }
    }
}
