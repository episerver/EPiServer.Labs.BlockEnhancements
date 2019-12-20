using EPiServer.Shell.Services.Rest;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace EPiServer.Labs.BlockEnhancements.Telemetry.Internal
{
    [RestStore("telemetryconfig")]
    public class TelemetryConfigStore : RestControllerBase
    {
        [HttpGet]
        public async Task<ActionResult> Get()
        {
            return Rest(new
            {
                instrumentationKey = await GetInstrumentationKey()
            });
        }

        private async Task<string> GetInstrumentationKey()
        {
            // hardcoded instrumentation key from the production subscription
            // https://portal.azure.com/#@episerver.net/resource/subscriptions/d08856e3-820a-4d39-8954-8b8916e966be/resourceGroups/cmsuitelemetryrg/providers/microsoft.insights/components/cmsui-telemetry-services-ai/overview
            return await Task.FromResult("e4b8b0bc-c592-4797-8a7e-61cf60978363");
        }
    }
}
