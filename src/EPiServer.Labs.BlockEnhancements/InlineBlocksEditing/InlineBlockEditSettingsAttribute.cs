using System;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    /// <summary>
    /// Attribute used to configure inlin blocks editor dialog
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class InlineBlockEditSettingsAttribute: Attribute
    {
        public bool ShowCategoryProperty { get; set; } = false;
        public bool ShowNameProperty { get; set; } = true;
        public string HiddenGroups { get; set; } = "Advanced";
    }
}
