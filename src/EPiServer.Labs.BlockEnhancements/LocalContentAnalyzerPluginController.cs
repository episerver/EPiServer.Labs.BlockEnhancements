using System.Web.Mvc;
using EPiServer.PlugIn;
using EPiServer.Shell;
using PlugInArea = EPiServer.PlugIn.PlugInArea;

namespace EPiServer.Labs.BlockEnhancements
{
    [GuiPlugIn(Area = PlugInArea.AdminMenu, UrlFromModuleFolder = "LocalContentAnalyzerPlugin", DisplayName = "Local content analyzer")]
    public class LocalContentAnalyzerPluginController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            var moduleUrl = Paths.ToResource("episerver-labs-block-enhancements", string.Empty);

            return View("Index", new LocalContentAnalyzerViewModel
            {
                ModuleUrl = moduleUrl
            });
        }
    }
}
