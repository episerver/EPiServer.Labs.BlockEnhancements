using System.ComponentModel.DataAnnotations;
using EPiServer.DataAbstraction;
using EPiServer.Labs.BlockEnhancements.InlineBlocksEditing;

namespace AlloyTemplates.Models.Blocks
{
    [SiteContentType(GUID = "9E7F6DF5-A963-40C4-8683-211C4FA48AE1")]
    [SiteImageUrl]
    [InlineBlockEditSettings(ShowNameProperty = true, ShowCategoryProperty = true, HiddenGroups = "")]
    public class AdvancedBlock : SiteBlockData
    {
        [Display(Order = 1, GroupName = SystemTabNames.Content)]
        public virtual string Text1 { get; set; }

        [Display(Order = 2, GroupName = SystemTabNames.Content)]
        public virtual string Text2 { get; set; }

        [Display(Order = 1, GroupName = Global.GroupNames.Products)]
        public virtual string Text3 { get; set; }

        [Display(Order = 2, GroupName = Global.GroupNames.Products)]
        public virtual string Text4 { get; set; }
    }
}
