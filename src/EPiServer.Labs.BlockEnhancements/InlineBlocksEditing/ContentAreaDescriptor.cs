using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Cms.Shell.UI.ObjectEditing.EditorDescriptors;
using EPiServer.Core;
using EPiServer.Shell.ObjectEditing;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class ContentAreaDescriptor : ContentAreaEditorDescriptor
    {
        private readonly BlockEnhancementsOptions _options;
        private readonly IContentLoader _contentLoader;

        public ContentAreaDescriptor(BlockEnhancementsOptions options, IContentLoader contentLoader)
        {
            _options = options;
            _contentLoader = contentLoader;
            ClientEditingClass = "episerver-labs-block-enhancements/editors/content-area-editor";
        }

        public override void ModifyMetadata(ExtendedMetadata metadata, IEnumerable<Attribute> attributes)
        {
            base.ModifyMetadata(metadata, attributes);

            var items = GetLocalItems(metadata);
            metadata.EditorConfiguration["localBlocks"] = items;
            metadata.OverlayConfiguration["localBlocks"] = items;

            metadata.OverlayConfiguration["customType"] =
                "episerver-labs-block-enhancements/editors/content-area";
            metadata.OverlayConfiguration["blockEnhancementsOptions"] = _options;
            metadata.EditorConfiguration["blockEnhancementsOptions"] = _options;
        }

        public IEnumerable<ContentReference> GetLocalItems(ExtendedMetadata metadata)
        {
            if (metadata.InitialValue == null || metadata.Parent?.Model == null)
            {
                return Enumerable.Empty<ContentReference>();
            }

            var localItems = (metadata.InitialValue as ContentArea)?.Items
                .Where(x => _contentLoader.IsLocalContent(x.ContentLink))
                .Select(x => x.ContentLink.ToReferenceWithoutVersion()).ToList();

            return localItems ?? Enumerable.Empty<ContentReference>();
        }
    }
}
