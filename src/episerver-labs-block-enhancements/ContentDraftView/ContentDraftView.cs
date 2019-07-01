using System.Web;

namespace EPiServer.Labs.BlockEnhancements.ContentDraftView
{
    public static class ContentDraftView
    {
        public static bool IsInContentDraftViewMode => HttpContext.Current != null && HttpContext.Current.Request["commondrafts"] == "true";
    }
}