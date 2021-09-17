using System.Web.Mvc;
using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements
{
    [RestStore("episerverlabsblockenhancementsoptions")]
    public class BlockEnhancementsOptionsStore : RestControllerBase
    {
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;

        public BlockEnhancementsOptionsStore(BlockEnhancementsOptions blockEnhancementsOptions)
        {
            _blockEnhancementsOptions = blockEnhancementsOptions;
        }

        public ActionResult Get()
        {
            var actionResult = Rest(_blockEnhancementsOptions);
            actionResult.SafeResponse = true;
            return actionResult;
        }
    }
}
