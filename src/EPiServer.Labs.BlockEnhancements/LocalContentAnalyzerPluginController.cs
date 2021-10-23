using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.PlugIn;

namespace EPiServer.Labs.BlockEnhancements
{
    public class LocalContentAnalyzerViewModel
    {
        public int BlockInstancesCount { get; set; }
        public int LocalBlockInstancesCount { get ; set ; }
        public int SharedBlockInstancesCount { get ; set ; }
        public int SharedBlocksReferencedJustOnceCount { get ; set ; }
        public string LocalBlockRatio { get ; set ; }
        public int UnusedSharedBlocks { get ; set ; }
        public int RealSharedBlocks { get ; set ; }
    }

    [GuiPlugIn(Area = PlugInArea.AdminMenu, UrlFromModuleFolder = "LocalContentAnalyzerPlugin", DisplayName = "Local content analyzer")]
    public class LocalContentAnalyzerPluginController : Controller
    {
        private readonly IContentModelUsage _contentModelUsage;
        private readonly IContentTypeRepository _contentTypeRepository;
        private readonly IContentRepository _contentRepository;

        public LocalContentAnalyzerPluginController(IContentModelUsage contentModelUsage,
            IContentTypeRepository contentTypeRepository, IContentRepository contentRepository)
        {
            _contentModelUsage = contentModelUsage;
            _contentTypeRepository = contentTypeRepository;
            _contentRepository = contentRepository;
        }

        // GET
        public ActionResult Index()
        {
            return View("Index", CalculateModel());
        }

        private LocalContentAnalyzerViewModel CalculateModel()
        {
            var blockTypes = _contentTypeRepository.List().Where(x => x.Base == ContentTypeBase.Block);
            var count = 0;
            var localCount = 0;
            var sharedBlocks = new List<ContentReference>();
            foreach (var blockType in blockTypes)
            {
                var listContentOfContentType = _contentModelUsage.ListContentOfContentType(blockType);
                var localBlocks = listContentOfContentType.Where(x => _contentRepository.IsLocalContent(x.ContentLink));
                sharedBlocks.AddRange(listContentOfContentType.Except(localBlocks).Select(x => x.ContentLink));
                localCount += localBlocks.Count();
                count += listContentOfContentType.Count;
            }

            var sharedBlocksReferencedJustOnceCount = 0;
            var unusedSharedBlocks = 0;
            foreach (var contentReference in sharedBlocks)
            {
                var referencesCount = _contentRepository.GetReferencesToContent(contentReference, false).ToList();
                if (referencesCount.Count == 1)
                {
                    sharedBlocksReferencedJustOnceCount++;
                }
                if (!referencesCount.Any())
                {
                    unusedSharedBlocks++;
                }
            }

            return new LocalContentAnalyzerViewModel
            {
                BlockInstancesCount = count,
                LocalBlockInstancesCount = localCount,
                SharedBlockInstancesCount = count - localCount,
                SharedBlocksReferencedJustOnceCount = sharedBlocksReferencedJustOnceCount,
                UnusedSharedBlocks = unusedSharedBlocks,
                RealSharedBlocks = count - localCount - unusedSharedBlocks - sharedBlocksReferencedJustOnceCount,
                LocalBlockRatio = Math.Round((decimal)localCount / count * 100) + "%"
            };
        }
    }
}
