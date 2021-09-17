using System.Collections.Generic;
using EPiServer.Core;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    /// <summary>
    /// A mapper that allows mapping between content versions
    /// </summary>
    public interface IContentVersionMapper
    {
        /// <summary>
        /// Gets a specific version of a content that is related to specified content/page version (if any)
        /// </summary>
        /// <param name="publicReference">The public reference (no version) to get version specific reference for</param>
        /// <returns>A version specific reference (if any)</returns>
        IContent GetVersionSpecificToCurrentPage(ContentReference publicReference);

        /// <summary>
        /// Creates a mapping between specified versions
        /// </summary>
        /// <param name="contentVersion">The content version to assign a mapping to</param>
        /// <param name="relatedVersion">The related version</param>
        /// <param name="languageBranch"></param>
        IContent AddVersionSpecificReference(ContentReference contentVersion, ContentReference relatedVersion, string languageBranch);

        /// <summary>
        /// Gets all versions that have been
        /// </summary>
        /// <param name="contentVersion"></param>
        /// <returns></returns>
        IEnumerable<ContentReference> ListVersionSpecificReference(ContentReference contentVersion);

        /// <summary>
        /// Removes all relations for specified contentLink. If <paramref name="contentLink"/> is version specific then
        /// those versions are removed if <paramref name="contentLink"/> does not specify a version all mapped versions for that
        /// content is removed.
        /// </summary>
        /// <param name="contentLink">The reference to remove mappings for</param>
        void RemoveMappings(ContentReference contentLink);
    }
}
