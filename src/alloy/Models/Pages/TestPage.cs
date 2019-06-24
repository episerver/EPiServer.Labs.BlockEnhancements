using System.ComponentModel.DataAnnotations;
using EPiServer.DataAbstraction;
using EPiServer.DataAnnotations;

namespace AlloyTemplates.Models.Pages
{
    [ContentType(GUID = "DA06F097-5C32-4C9A-8A4F-22D43F9E8B5A", GroupName = Global.GroupNames.Specialized)]
    public class TestPage : SitePageData
    {
        [Display(GroupName = SystemTabNames.Content, Order = 320)]
        public virtual string Text1 { get; set; }
    }
}
