using System.Collections.Generic;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using EPiServer.Cms.Shell.UI.Rest.Models;
using EPiServer.Core;
using EPiServer.Labs.BlockEnhancements.StatusIndicator;
using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements
{
    [RestStore("episerverlabsblockenhancements")]
    public class BlockEnhancementsStore : RestControllerBase
    {
        private readonly LatestContentResolver _latestContentResolver;
        private readonly DependenciesResolver _dependenciesResolver;

        public BlockEnhancementsStore(LatestContentResolver latestContentResolver,
            DependenciesResolver dependenciesResolver)
        {
            _latestContentResolver = latestContentResolver;
            _dependenciesResolver = dependenciesResolver;
        }

        public RestResultBase GetLatestVersions(IEnumerable<ContentReference> ids)
        {
            var queryString = ControllerContext.HttpContext.Request.QueryString;
            return Rest(_latestContentResolver.GetLatestVersions(ids, queryString));
        }

        [HttpGet]
        public ActionResult Get(ContentReference id)
        {
            var dependencies = _dependenciesResolver.GetUnpublishedDependencies(id);
            return Rest(dependencies);
        }
    }
}
