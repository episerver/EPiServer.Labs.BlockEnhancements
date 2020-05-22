using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.DataAnnotations;
using EPiServer.Labs.BlockEnhancements.InlineBlocksEditing;

namespace AlloyTemplates.Models.Blocks
{
    /// <summary>
    /// Used to insert editorial content edited using a rich-text editor
    /// </summary>
    [SiteContentType(
        GUID = "67F617A4-2175-4360-975E-75EDF2B924A7",
        GroupName = SystemTabNames.Content)]
    [SiteImageUrl]
    [InlineBlockEditSettings(ShowNameProperty = false)]
    public class EditorialBlock : SiteBlockData
    {
        [Display(GroupName = SystemTabNames.Content)]
        [CultureSpecific]
        public virtual XhtmlString MainBody { get; set; }

        public virtual ContentArea NestedContentArea { get; set; }
    }
}
