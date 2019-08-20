using EPiServer.Core;
using EPiServer.Editor;
using EPiServer.Globalization;
using EPiServer.ServiceLocation;
using EPiServer.Cms.Shell;
using EPiServer.Web;

namespace EPiServer.Labs.BlockEnhancements.ContentDraftView
{
    public class CustomContentAreaLoader: IContentAreaLoader
    {
        private readonly IContentAreaLoader _defaultContentAreaLoader;

        public CustomContentAreaLoader(IContentAreaLoader defaultContentAreaLoader)
        {
            _defaultContentAreaLoader = defaultContentAreaLoader;
        }

        public IContent Get(ContentAreaItem contentAreaItem)
        {
            if (PageEditing.PageIsInEditMode && ContentDraftView.IsInContentDraftViewMode)
            {
                var languageResolver = ServiceLocator.Current.GetInstance<LanguageResolver>();
                var commonDraft = ServiceLocator.Current.GetInstance<IContentVersionRepository>()
                    .LoadCommonDraft(contentAreaItem.ContentLink, languageResolver.GetPreferredCulture().Name);
                if (commonDraft != null)
                {
                    var contentLoader = ServiceLocator.Current.GetInstance<IContentLoader>();

                    var content = contentLoader.Get<IContent>(commonDraft.ContentLink);
                    if (content.IsPublished())
                    {
                        var defaultContent = _defaultContentAreaLoader.Get(contentAreaItem);
                        return defaultContent;
                    }

                    if (!contentAreaItem.IsReadOnly)
                    {
                        contentAreaItem.ContentLink = commonDraft.ContentLink;
                    }

                    return content;
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
