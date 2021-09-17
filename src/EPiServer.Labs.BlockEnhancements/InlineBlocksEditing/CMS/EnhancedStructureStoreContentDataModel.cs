using EPiServer.Cms.Shell.UI.Rest.Models;

namespace EPiServer.Cms.Shell.UI.Rest.Internal
{
    internal class EnhancedStructureStoreContentDataModel : StructureStoreContentDataModel
    {
        /// <summary>
        /// Indicates if the content is part of an active approval
        /// </summary>
        /// <footer><a href="https://www.google.com/search?q=EPiServer.Cms.Shell.UI.Rest.Models.Internal.EnhancedStructureStoreContentDataModel.IsPartOfActiveApproval">`EnhancedStructureStoreContentDataModel.IsPartOfActiveApproval` on google.com</a></footer>
        public bool IsPartOfActiveApproval { get; set; }

        /// <summary>
        /// Indicates if the content has a published version in the current language
        /// </summary>
        /// <footer><a href="https://www.google.com/search?q=EPiServer.Cms.Shell.UI.Rest.Models.Internal.EnhancedStructureStoreContentDataModel.HasPublishedVersion">`EnhancedStructureStoreContentDataModel.HasPublishedVersion` on google.com</a></footer>
        public bool HasPublishedVersion { get; set; }
    }
}
