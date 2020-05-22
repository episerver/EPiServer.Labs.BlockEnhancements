using System.ComponentModel.DataAnnotations;
using AlloyTemplates.Models.Blocks;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.DataAnnotations;

namespace AlloyTemplates.Models.Pages
{
    [ContentType(GUID = "AAA6F097-5C32-4C9A-8A4F-22D43F9E8B5A", DisplayName = "Bootstrap Page")]
    public class BootstrapPage : PageData
    {
        [Display(GroupName = SystemTabNames.Content, Order = 320)]
        [AllowedTypes(typeof(BootstrapRowBlock))]
        public virtual ContentArea Rows { get; set; }
    }

    [SiteContentType(GUID = "4444A99A-E239-41B8-9C59-20EAA5936047", DisplayName = "Bootstrap Row")]
    [SiteImageUrl]
    public class BootstrapRowBlock : SiteBlockData
    {
        public virtual ContentArea Columns { get; set; }
    }

    [SiteContentType(GUID = "5544A99A-E239-41B8-9C59-20EAA5936047", Description = "Lorem ipsum dolorum ipsum met")]
    public class VeryLongBootstrapRowBlock : SiteBlockData
    {
        public virtual ContentArea Columns { get; set; }
    }
}
