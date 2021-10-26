using System.Collections.Generic;
using System.Linq;
using EPiServer.Cms.Shell.UI.Rest;
using EPiServer.Cms.Shell.UI.Rest.Internal;
using EPiServer.Core;
using EPiServer.Data;
using EPiServer.Data.Dynamic;
using EPiServer.ServiceLocation;
using EPiServer.Web.Routing;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [EPiServerDataStore(AutomaticallyCreateStore = true, AutomaticallyRemapStore = true)]
    public class VersionSpecific : IDynamicData
    {
        public Identity Id { get; set; }

        [EPiServerDataIndex]
        public string ParentContentLink { get; set; }

        public int BlockId { get; set; }
        public int BlockWorkId { get; set; }
    }

    [ServiceConfiguration(typeof(VersionSpecificRepository))]
    public class VersionSpecificRepository
    {
        private readonly DynamicDataStoreFactory _dataStoreFactory;
        private readonly object _lock = new object();

        public VersionSpecificRepository(DynamicDataStoreFactory dataStoreFactory)
        {
            _dataStoreFactory = dataStoreFactory;
        }

        private DynamicDataStore GetStore()
        {
            return _dataStoreFactory.GetStore(typeof(VersionSpecific)) ?? _dataStoreFactory.CreateStore(typeof(VersionSpecific));
        }

        public VersionSpecific Load(ContentReference parentContentLink, ContentReference blockContentLink)
        {
            var contentLink = parentContentLink.ToString();
            var pageBlocks = GetStore().Items<VersionSpecific>().Where(x => x.ParentContentLink == contentLink).ToList();
            return pageBlocks.FirstOrDefault(x => x.BlockId == blockContentLink.ID);
        }

        public void Save(ContentReference contentLink, ContentReference blockContentLink)
        {
            lock (_lock)
            {
                var versionSpecific = Load(contentLink, blockContentLink) ?? new VersionSpecific();
                versionSpecific.ParentContentLink = contentLink.ToString();
                versionSpecific.BlockId = blockContentLink.ID;
                versionSpecific.BlockWorkId = blockContentLink.WorkID;

                GetStore().Save(versionSpecific);
            }
        }
    }

    [ServiceConfiguration(typeof(IContentVersionMapper))]
    internal class DDSContentVersionMapper : IContentVersionMapper
    {
        private readonly IContentLoader _contentLoader;
        private readonly CurrentContentContext _currentContentContext;
        private readonly VersionSpecificRepository _versionSpecificRepository;
        private readonly IContentRouteHelper _contentRouteHelper;

        public DDSContentVersionMapper(IContentLoader contentLoader, CurrentContentContext currentContentContext,
            VersionSpecificRepository versionSpecificRepository, IContentRouteHelper contentRouteHelper)
        {
            _contentLoader = contentLoader;
            _currentContentContext = currentContentContext;
            _versionSpecificRepository = versionSpecificRepository;
            _contentRouteHelper = contentRouteHelper;
        }

        public IContent GetVersionSpecificToCurrentPage(ContentReference publicReference)
        {
            // fallback to route helper if _currentContentContext is empty (it will be empty only outside Forms view)
            var node = _currentContentContext.ContentLink ?? _contentRouteHelper.ContentLink;

            if (node == null)
            {
                return null;
            }

            var result = _versionSpecificRepository.Load(node, publicReference);
            if (result == null)
            {
                return null;
            }

            var versionSpecificToCurrentPage = new ContentReference(result.BlockId, result.BlockWorkId);
            return _contentLoader.Get<IContent>(versionSpecificToCurrentPage);
        }

        public IContent AddVersionSpecificReference(ContentReference parentContentLink, ContentReference blockContentLink, string languageBranch)
        {
            var _latestContentVersionResolver = ServiceLocator.Current.GetInstance<LatestContentVersionResolver>();

            //TODO: instead of just fetching common draft we should find the specific draft for the saved block
            var draft = _latestContentVersionResolver.GetDraftLink(blockContentLink);
            if (draft == null)
            {
                return null;
            }

            var item = _contentLoader.Get<IContent>(draft);

            _versionSpecificRepository.Save(parentContentLink, draft);

            return item;
        }

        public IEnumerable<ContentReference> ListVersionSpecificReference(ContentReference contentVersion)
        {
            throw new System.NotImplementedException();
        }

        public void RemoveMappings(ContentReference contentLink)
        {
            throw new System.NotImplementedException();
        }
    }
}
