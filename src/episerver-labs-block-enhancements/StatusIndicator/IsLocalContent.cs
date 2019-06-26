using System.Linq;
using EPiServer.Cms.Shell.UI.Rest.Capabilities;
using EPiServer.Core;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.StatusIndicator
{
    [ServiceConfiguration(typeof(IContentCapability))]
    internal class IsLocalContent : IContentCapability
    {
        private readonly IContentLoader _contentLoader;

        public IsLocalContent(IContentLoader contentLoader)
        {
            _contentLoader = contentLoader;
        }

        /// <summary>
        /// Gets the key that identifies this capability.
        /// </summary>
        public string Key => "isLocalContent";

        /// <summary>
        /// Determines if <see cref="IContent"/> is a <see cref="ContentFolder"/> or any subclass like ContentAssetFolder
        /// </summary>
        /// <param name="content">The <see cref="IContent"/> to test</param>
        /// <returns><code>true</code> if <see cref="IContent"/> is of type <see cref="ContentFolder"/>; otherwise <code>false</code></returns>
        public virtual bool IsCapable(IContent content)
        {
            return _contentLoader.GetAncestors(content.ContentLink).Any(x =>
                x is ContentAssetFolder folder && folder.ContentOwnerID != System.Guid.Empty);
        }

        /// <inheritdoc />
        public virtual int SortOrder => 0;
    }
}
