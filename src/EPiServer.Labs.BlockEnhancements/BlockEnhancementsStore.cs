using System.Collections.Generic;
using System.Web.Mvc;
using EPiServer.Cms.Shell.UI.Rest.Internal;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Core;
using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements
{
    [RestStore("episerverlabsblockenhancements")]
    public class BlockEnhancementsStore : RestControllerBase
    {
        private readonly LatestContentVersionResolver _latestContentVersionResolver;
        private readonly DependenciesResolver _dependenciesResolver;

        public BlockEnhancementsStore(LatestContentVersionResolver latestContentVersionResolver, DependenciesResolver dependenciesResolver)
        {
            _latestContentVersionResolver = latestContentVersionResolver;
            _dependenciesResolver = dependenciesResolver;
        }

        [HttpGet]
        public ActionResult Get(ContentReference id, IEnumerable<ContentReference> ids)
        {
            if (id != null)
            {
                var dependencies = _dependenciesResolver.GetUnpublishedDependencies(id);
                return Rest(dependencies);
            }

            var queryString = ControllerContext.HttpContext.Request.QueryString;
            var items = new List<EnhancedStructureStoreContentDataModel>();
            foreach (var itemId in ids)
            {
                items.Add(_latestContentVersionResolver.GetLatestVersion(itemId, queryString));
            }
            return Rest(items);
        }
    }
}
