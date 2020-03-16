using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using EPiServer.Approvals;
using EPiServer.Approvals.ContentApprovals;
using EPiServer.Cms.Shell;
using EPiServer.Cms.Shell.Service.Internal;
using EPiServer.Cms.Shell.UI.Rest.Models;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Core;
using EPiServer.Core.Internal;
using EPiServer.DataAbstraction;
using EPiServer.Framework.Localization;
using EPiServer.Globalization;
using EPiServer.ServiceLocation;
using EPiServer.Shell;
using EPiServer.Web;

namespace EPiServer.Labs.BlockEnhancements
{
    public class DependenciesResolver
    {
        private readonly IContentRepository _contentRepository;
        private readonly LanguageResolver _languageResolver;
        private readonly ContentLoaderService _contentLoaderService;
        private readonly ContentSoftLinkIndexer _contentSoftLinkIndexer;
        private readonly ServiceAccessor<SiteDefinition> _currentSiteDefinition;
        private readonly UIDescriptorRegistry _uiDescriptorRegistry;
        private readonly ServiceAccessor<HttpContextBase> _httpContextAccessor;
        private readonly ApprovalResolver _approvalResolver;
        private readonly LocalizationService _localizationService;

        public DependenciesResolver(ContentSoftLinkIndexer contentSoftLinkIndexer, IContentRepository contentRepository,
            LanguageResolver languageResolver, ContentLoaderService contentLoaderService,
            ServiceAccessor<SiteDefinition> currentSiteDefinition, UIDescriptorRegistry uiDescriptorRegistry,
            ServiceAccessor<HttpContextBase> httpContextAccessor,
            ApprovalResolver approvalResolver, LocalizationService localizationService)
        {
            _contentSoftLinkIndexer = contentSoftLinkIndexer;
            _contentRepository = contentRepository;
            _languageResolver = languageResolver;
            _contentLoaderService = contentLoaderService;
            _currentSiteDefinition = currentSiteDefinition;
            _uiDescriptorRegistry = uiDescriptorRegistry;
            _httpContextAccessor = httpContextAccessor;
            _approvalResolver = approvalResolver;
            _localizationService = localizationService;
        }

        private static bool IsCorrectStatus(ExtendedVersionStatus versionStatus)
        {
            return versionStatus == ExtendedVersionStatus.CheckedOut ||
                   versionStatus == ExtendedVersionStatus.CheckedIn ||
                   versionStatus == ExtendedVersionStatus.Rejected ||
                   versionStatus == ExtendedVersionStatus.PreviouslyPublished;
        }

        private ContentReference GetUnpublishedVersion(IContent innerContent, CultureInfo preferredCulture)
        {
            if (IsCorrectStatus(innerContent.GetCalculatedStatus()))
            {
                return innerContent.ContentLink;
            }

            if (!(innerContent is IVersionable block))
            {
                return null;
            }

            if (block.Status != VersionStatus.Published)
            {
                return null;
            }

            var contentVersion = _contentLoaderService.GetCommonDraft(innerContent.ContentLink, preferredCulture);
            if (contentVersion == null)
            {
                return null;
            }

            var status = (ExtendedVersionStatus) (int) contentVersion.Status;
            if (IsCorrectStatus(status))
            {
                return contentVersion.ContentLink;
            }

            var item = _contentRepository.Get<IContent>(contentVersion.ContentLink);
            if (_approvalResolver.IsPartOfActiveApproval(item))
            {
                return contentVersion.ContentLink;
            }

            return null;
        }

        private IEnumerable<ContentReference> GetDependencies(IContent content)
        {
            return _contentSoftLinkIndexer.GetLinks(content)
                .Where(x => x.SoftLinkType == ReferenceType.PageLinkReference &&
                            !(x.ReferencedContentLink is PageReference))
                .Select(x => x.ReferencedContentLink.ToReferenceWithoutVersion())
                .Where(x => x != ContentReference.EmptyReference);
        }

        private IEnumerable<ContentReference> GetLanguageAgnosticDependencies(IContent content)
        {
            var currentLanguageDependencies = GetDependencies(content);

            if (content.IsMasterLanguageBranch())
            {
                return currentLanguageDependencies;
            }

            var masterLanguage = ((ILocalizable) content).MasterLanguage;
            var masterVersion = _contentRepository.Get<IContent>(content.ContentLink.ToReferenceWithoutVersion(), masterLanguage);
            var masterVersionDependencies = GetDependencies(masterVersion);
            return currentLanguageDependencies.Union(masterVersionDependencies);
        }

        public IEnumerable<Dependency> GetUnpublishedDependencies(ContentReference contentLink)
        {
            var dependencies = new List<Dependency>();
            var root = _contentRepository.Get<IContent>(contentLink);
            var directDependencies = GetLanguageAgnosticDependencies(root).ToList();
            var you = _localizationService.GetStringByCulture("/episerver/shared/text/yousubject",
                CultureInfo.CurrentCulture);
            var currentUser = _httpContextAccessor()?.User?.Identity?.Name;
            foreach (var directDependency in directDependencies)
            {
                var content = _contentRepository.Get<IContent>(directDependency);
                if (!(content is BlockData)) continue;

                var reference = GetUnpublishedVersion(content, _languageResolver.GetPreferredCulture());
                var referenceContent = reference != null ? _contentRepository.Get<IContent>(reference) : content;
                var dependency = new Dependency
                {
                    CanBePublished = reference != null,
                    ContentLink = reference ?? content.ContentLink,

                    Name = referenceContent.Name,
                    TypeIdentifier = GetTypeIdentifier(referenceContent),
                    TreePath = GetTreePath(referenceContent),
                    Uri = referenceContent.GetUri(),
                    IsPartOfActiveApproval = _approvalResolver.IsPartOfActiveApproval(referenceContent)
                };

                if (referenceContent is IChangeTrackable changeTrackable)
                {
                    var isCurrentUser = changeTrackable.ChangedBy.Equals(currentUser,
                        StringComparison.InvariantCultureIgnoreCase);
                    dependency.Changed = TimeAgoFormatter.RelativeDate(changeTrackable.Saved);
                    dependency.ChangedBy = isCurrentUser ? you : changeTrackable.ChangedBy;
                }

                var subDependencies = GetLanguageAgnosticDependencies(referenceContent).ToList();
                foreach (var subDependency in subDependencies)
                {
                    var subContent = _contentRepository.Get<IContent>(subDependency);
                    var subReference = GetUnpublishedVersion(subContent, _languageResolver.GetPreferredCulture());
                    if (subReference == null) continue;

                    if (dependencies.SelectMany(d => d.References.Select(x => x.ContentLink)).Contains(subReference))
                    {
                        continue;
                    }

                    var subContentVersion = _contentRepository.Get<IContent>(subReference);
                    var richContentReferenceModel = new RichContentReferenceModel
                    {
                        ContentLink = subReference,
                        Language = subContentVersion.LanguageBranch(),
                        Name = subContentVersion.Name,
                        TreePath = GetTreePath(subContentVersion),
                        Uri = subContent.GetUri(),
                        TypeIdentifier = GetTypeIdentifier(subContentVersion),
                        IsPartOfActiveApproval = _approvalResolver.IsPartOfActiveApproval(subContentVersion)
                    };

                    if (subContentVersion is IChangeTrackable subContentTrackable)
                    {
                        var isCurrentUser = subContentTrackable.ChangedBy.Equals(currentUser,
                            StringComparison.InvariantCultureIgnoreCase);
                        richContentReferenceModel.Changed = TimeAgoFormatter.RelativeDate(subContentTrackable.Saved);
                        richContentReferenceModel.ChangedBy = isCurrentUser ? you : subContentTrackable.ChangedBy;
                    }

                    dependency.References.Add(richContentReferenceModel);
                }

                if (dependency.CanBePublished || dependency.References.Count > 0)
                {
                    dependencies.Add(dependency);
                }
            }

            return dependencies;
        }

        private string GetTypeIdentifier(IContent c)
        {
            return _uiDescriptorRegistry.GetTypeIdentifiers(c.GetType()).FirstOrDefault();
        }

        private IEnumerable<string> GetTreePath(IContent content)
        {
            return _contentLoaderService.GetAncestorNames(content, _currentSiteDefinition())
                .Select(HttpUtility.HtmlEncode);
        }
    }

    public class RichContentReferenceModel : ContentReferenceModel
    {
        public string Changed { get; set; }
        public string ChangedBy { get; set; }
        public bool IsPartOfActiveApproval { get; set; }
    }

    public class Dependency
    {
        public string Name { get; set; }
        public bool CanBePublished { get; set; }
        public ContentReference ContentLink { get; set; }
        public Uri Uri { get; set; }
        public List<RichContentReferenceModel> References { get; set; } = new List<RichContentReferenceModel>();
        public string TypeIdentifier { get; set; }
        public IEnumerable<string> TreePath { get; set; }
        public string Changed { get; set; }
        public string ChangedBy { get; set; }
        public bool IsPartOfActiveApproval { get; set; }
    }
}
