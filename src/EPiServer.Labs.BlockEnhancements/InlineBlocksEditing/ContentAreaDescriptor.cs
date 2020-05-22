using System;
using System.Collections.Generic;
using EPiServer.Cms.Shell.UI.ObjectEditing.EditorDescriptors;
using EPiServer.Core;
using EPiServer.Shell.ObjectEditing;
using EPiServer.Shell.ObjectEditing.EditorDescriptors;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [EditorDescriptorRegistration(TargetType = typeof(ContentArea),
        EditorDescriptorBehavior = EditorDescriptorBehavior.OverrideDefault)]
    public class ContentAreaDescriptor : ContentAreaEditorDescriptor
    {
        private readonly BlockEnhancementsOptions _options;

        public ContentAreaDescriptor(BlockEnhancementsOptions options)
        {
            _options = options;
            ClientEditingClass = "episerver-labs-block-enhancements/editors/content-area-editor";
        }

        public override void ModifyMetadata(ExtendedMetadata metadata, IEnumerable<Attribute> attributes)
        {
            base.ModifyMetadata(metadata, attributes);
            metadata.OverlayConfiguration["customType"] =
                "episerver-labs-block-enhancements/editors/content-area";
            metadata.OverlayConfiguration["blockEnhancementsOptions"] = _options;
            metadata.EditorConfiguration["blockEnhancementsOptions"] = _options;
        }
    }
}
