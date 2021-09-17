using EPiServer.Core;
using EPiServer.Web;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    public class CustomContentAreaLoader: IContentAreaLoader
    {
        private readonly IContentAreaLoader _defaultContentAreaLoader;
        private readonly IContextModeResolver _contextModeResolver;
        private readonly IContentVersionMapper _contentVersionMapper;

        public CustomContentAreaLoader(IContentAreaLoader defaultContentAreaLoader, IContextModeResolver contextModeResolver, IContentVersionMapper contentVersionMapper)
        {
            _defaultContentAreaLoader = defaultContentAreaLoader;
            _contextModeResolver = contextModeResolver;
            _contentVersionMapper = contentVersionMapper;
        }

        public IContent Get(ContentAreaItem contentAreaItem)
        {
            var contextMode = _contextModeResolver.CurrentMode;

            if (contextMode.EditOrPreview())
            {
                var versionSpecificToCurrentContent = _contentVersionMapper.GetVersionSpecificToCurrentPage(contentAreaItem.ContentLink);
                if (versionSpecificToCurrentContent != null)
                {
                    return versionSpecificToCurrentContent;
                }
            }

            return _defaultContentAreaLoader.Get(contentAreaItem);
        }

        public DisplayOption LoadDisplayOption(ContentAreaItem contentAreaItem)
        {
            return _defaultContentAreaLoader.LoadDisplayOption(contentAreaItem);
        }
    }
}
