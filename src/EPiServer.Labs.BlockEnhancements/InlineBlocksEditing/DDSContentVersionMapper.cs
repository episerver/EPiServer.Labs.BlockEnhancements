using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Web;
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
        private readonly ServiceAccessor<HttpContextBase> _httpContextAccessor;

        public DDSContentVersionMapper(IContentLoader contentLoader, CurrentContentContext currentContentContext,
            VersionSpecificRepository versionSpecificRepository, IContentRouteHelper contentRouteHelper,
            ServiceAccessor<HttpContextBase> httpContextAccessor)
        {
            _contentLoader = contentLoader;
            _currentContentContext = currentContentContext;
            _versionSpecificRepository = versionSpecificRepository;
            _contentRouteHelper = contentRouteHelper;
            _httpContextAccessor = httpContextAccessor;
        }

        public IContent GetVersionSpecificToCurrentPage(ContentReference publicReference)
        {
            var routedNode = _httpContextAccessor().Request.RequestContext.RouteData.DataTokens[RoutingConstants.NodeKey];
            var node = routedNode != null
                ? ContentReference.Parse(routedNode.ToString())
                : _currentContentContext.ContentLink;

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
            var draft = _latestContentVersionResolver.GetLatestVersion(blockContentLink, new NameValueCollection());
            if (draft == null)
            {
                return null;
            }

            var item = _contentLoader.Get<IContent>(draft.ContentLink);

            _versionSpecificRepository.Save(parentContentLink, draft.ContentLink);

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
