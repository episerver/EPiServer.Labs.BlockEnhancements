using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using EPiServer.Cms.Shell;
using EPiServer.Cms.Shell.UI.Rest.Internal;
using EPiServer.Core;
using EPiServer.Data.Entity;
using EPiServer.DataAccess;
using EPiServer.Security;
using EPiServer.ServiceLocation;
using EPiServer.Shell.UI.Internal;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [ServiceConfiguration(typeof(IEventListener), Lifecycle = ServiceInstanceScope.Singleton)]
    internal class Events : IEventListener
    {
        private readonly IContentEvents _contentEvents;
        private readonly IContentRepository _contentLoader;
        private readonly ContentAssetHelper _contentAssetHelper;
        private readonly LatestContentVersionResolver _latestContentVersionResolver;
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;
        private readonly IContentVersionMapper _contentVersionMapper;

        public Events(IContentEvents contentEvents, IContentRepository contentLoader,
            ContentAssetHelper contentAssetHelper, LatestContentVersionResolver latestContentVersionResolver,
            BlockEnhancementsOptions blockEnhancementsOptions, IContentVersionMapper contentVersionMapper
            )
        {
            _contentEvents = contentEvents;
            _contentLoader = contentLoader;
            _contentAssetHelper = contentAssetHelper;
            _latestContentVersionResolver = latestContentVersionResolver;
            _blockEnhancementsOptions = blockEnhancementsOptions;
            _contentVersionMapper = contentVersionMapper;
        }

        public void Start()
        {
            _contentEvents.PublishedContent += PublishedContent;
            _contentEvents.SavedContent += SavedContent;
        }

        private void SavedContent(object sender, ContentEventArgs e)
        {
            if (!_blockEnhancementsOptions.LocalContentFeatureEnabled)
            {
                return;
            }

            var items = new List<ContentReference>();
            UpdateOwnerContentLinks(e.ContentLink, e.Content, items, false);
        }

        private void PublishedContent(object sender, ContentEventArgs e)
        {
            if (!_blockEnhancementsOptions.LocalContentFeatureEnabled)
            {
                return;
            }

            var publishedItems = new List<ContentReference>();
            PublishLocalContentItems(e.Content, publishedItems, false);
        }

        // publish all local block items together with the page, can potentially be optimized
        public void PublishLocalContentItems(IContent content, List<ContentReference> contentReferences, bool forceScan)
        {
            var folder = _contentAssetHelper.GetAssetFolder(content.ContentLink);
            if (folder == null && !forceScan)
            {
                return;
            }

            if (contentReferences.Contains(content.ContentLink.ToReferenceWithoutVersion()))
            {
                return;
            }

            contentReferences.Add(content.ContentLink.ToReferenceWithoutVersion());

            foreach (var propertyData in content.Property.Where(x => x.PropertyValueType == typeof(ContentArea)))
            {
                var contentArea = (ContentArea) propertyData.Value;
                if (contentArea == null)
                {
                    continue;
                }

                foreach (var contentAreaItem in contentArea.Items)
                {
                    var isLocalAsset = _contentLoader.IsLocalContent(contentAreaItem.ContentLink);
                    if (!isLocalAsset)
                    {
                        continue;
                    }

                    var draft = _latestContentVersionResolver.GetLatestVersion(contentAreaItem.ContentLink,
                        new NameValueCollection());
                    if (draft == null)
                    {
                        continue;
                    }

                    var item = _contentLoader.Get<IContent>(draft.ContentLink);
                    PublishLocalContentItems(item, contentReferences, true);

                    if ((item as IVersionable)?.Status != VersionStatus.CheckedOut)
                    {
                        continue;
                    }

                    if (item is IReadOnly readOnly)
                    {
                        item = (IContent)readOnly.CreateWritableClone();
                    }

                    _contentLoader.Save(item, SaveAction.Publish, AccessLevel.NoAccess);
                }
            }
        }

        // update all parent content ids in localblocks
        public void UpdateOwnerContentLinks(ContentReference parentContentLink, IContent content, List<ContentReference> contentReferences, bool force)
        {
            var folder = _contentAssetHelper.GetAssetFolder(content.ContentLink);
            if (folder == null && !force)
            {
                return;
            }

            if (contentReferences.Contains(content.ContentLink.ToReferenceWithoutVersion()))
            {
                return;
            }
            contentReferences.Add(content.ContentLink.ToReferenceWithoutVersion());

            foreach (var propertyData in content.Property.Where(x => x.PropertyValueType == typeof(ContentArea)))
            {
                var contentArea = (ContentArea) propertyData.Value;
                if (contentArea == null)
                {
                    continue;
                }

                foreach (var contentAreaItem in contentArea.Items)
                {
                    var isLocalAsset = _contentLoader.IsLocalContent(contentAreaItem.ContentLink);
                    if (!isLocalAsset)
                    {
                        continue;
                    }

                    var item = _contentVersionMapper.AddVersionSpecificReference(parentContentLink, contentAreaItem.ContentLink, content.LanguageBranch());
                    if (item != null)
                    {
                        UpdateOwnerContentLinks(parentContentLink, item, contentReferences, true);
                    }
                }
            }
        }

        public void Stop()
        {
            _contentEvents.PublishedContent -= PublishedContent;
            _contentEvents.SavedContent -= SavedContent;
        }
    }
}

/*
TODO: LOCALBLOCKS
1. Add ContentEvent when a block is saved in the old way or translated. We need to update ContentOwnerContentLink with the parent page version id.
2. Show overlays in languages other than master language (not caused by this PR), just a general usability issue that it's hard to translate a block in OPE
*/
