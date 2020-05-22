using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.ServiceLocation;
using EPiServer.Shell.ObjectEditing;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    /// <summary>
    /// Metadata extender which reads <see cref="InlineBlockEditSettingsAttribute"/> and and updates block client settings
    /// </summary>
    [ServiceConfiguration(IncludeServiceAccessor = false)]
    public class BlocksEditingMetadataExtender : IMetadataExtender
    {
        /// <summary>
        /// Modifies the metadata.
        /// </summary>
        /// <param name="metadata">The metadata.</param>
        /// <param name="attributes">The attributes.</param>
        public void ModifyMetadata(ExtendedMetadata metadata, IEnumerable<Attribute> attributes)
        {
            var settings = (InlineBlockEditSettingsAttribute) metadata.Model.GetType()
                .GetCustomAttributes(typeof(InlineBlockEditSettingsAttribute), true).FirstOrDefault();
            if (settings == null)
            {
                settings = new InlineBlockEditSettingsAttribute();
            }

            metadata.CustomEditorSettings["inlineBlock"] = new
            {
                settings.ShowNameProperty,
                settings.ShowCategoryProperty,
                HiddenGroups = settings.HiddenGroups?.Split(new[] {','}, StringSplitOptions.RemoveEmptyEntries)
                    .Select(x => x.Trim())
            };
        }
    }
}
