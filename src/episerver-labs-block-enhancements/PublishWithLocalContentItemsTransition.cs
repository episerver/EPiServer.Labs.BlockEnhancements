using System;
using System.Threading.Tasks;
using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Cms.Shell.UI.Rest.StatusTransition;
using EPiServer.Core;
using EPiServer.Globalization;
using EPiServer.Security;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements
{
    [ServiceConfiguration(typeof(IStatusTransition))]
    public class PublishWithLocalContentItemsTransition : IStatusTransition
    {
        private readonly IContentLoader _contentLoader;
        private readonly ContentLoaderService _contentLoaderService;
        private readonly LanguageResolver _languageResolver;

        public PublishWithLocalContentItemsTransition(IContentLoader contentLoader,
            ContentLoaderService contentLoaderService, LanguageResolver languageResolver)
        {
            _contentLoader = contentLoader;
            _contentLoaderService = contentLoaderService;
            _languageResolver = languageResolver;
        }

        public string Name => "publishWithLocalContentItems";

        public async Task<bool> CanTransitionAsync(StatusTransitionArguments arguments)
        {
            if (!(arguments.Content is PageData))
            {
                return false;
            }

            if (arguments.HasApprovalDefinition && arguments.VersionStatus != ExtendedVersionStatus.CheckedIn)
            {
                return false;
            }

            var canPublishContent = await IsDefaultPublishAvailable(arguments).ConfigureAwait(false);
            if (canPublishContent)
            {
                return true;
            }

            var content = arguments.Content as ContentData;

            var pageContentAssetsIDStr = (string) content.GetValue("PageContentAssetsID");
            if (string.IsNullOrEmpty(pageContentAssetsIDStr))
            {
                return false;
            }

            var pageContentAssetsID = new Guid(pageContentAssetsIDStr);
            var folder = _contentLoader.Get<IContent>(pageContentAssetsID);

            var descendents = _contentLoader.GetDescendents(folder.ContentLink);

            foreach (var contentReference in descendents)
            {
                var innerContent = _contentLoader.Get<IContent>(contentReference);
                if (!(innerContent is BlockData))
                {
                    continue;
                }

                if (IsCorrectStatus(innerContent.GetCalculatedStatus()))
                {
                    return true;
                }

                var block = innerContent as IVersionable;

                if (block.Status == VersionStatus.Published)
                {
                    var contentVersion = _contentLoaderService.GetCommonDraft(innerContent.ContentLink,
                        _languageResolver.GetPreferredCulture());
                    if (contentVersion != null)
                    {
                        var status = (ExtendedVersionStatus) (int) contentVersion.Status;
                        if (IsCorrectStatus(status))
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        private Task<bool> IsDefaultPublishAvailable(StatusTransitionArguments arguments)
        {
            // If there is an approval configured for the content and the content isn't ready to publish
            // we return false
            if (arguments.HasApprovalDefinition && arguments.VersionStatus != ExtendedVersionStatus.CheckedIn)
            {
                return Task.FromResult(false);
            }

            if (arguments.IsContentLocked || !IsCorrectStatus(arguments.VersionStatus))
            {
                return Task.FromResult(false);
            }

            var result =
                _contentLoaderService.HasEditAccess(arguments.Content, arguments.Principal, AccessLevel.Publish);

            return Task.FromResult(result);
        }

        private static bool IsCorrectStatus(ExtendedVersionStatus versionStatus)
        {
            return versionStatus == ExtendedVersionStatus.CheckedOut ||
                   versionStatus == ExtendedVersionStatus.CheckedIn ||
                   versionStatus == ExtendedVersionStatus.Rejected ||
                   versionStatus == ExtendedVersionStatus.PreviouslyPublished;
        }
    }
}
