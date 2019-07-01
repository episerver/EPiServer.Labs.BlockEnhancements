using System.Web;
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

        //TODO: remove once we upgrade dependencies to CMS UI 11.10
        private bool IsPublished(IContent content)
        {
            var versionable = content as IVersionable;
            if (versionable != null)
                return versionable.Status == VersionStatus.Published;
            return true;
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
                    if (IsPublished(content))
                    {
                        var defaultContent = _defaultContentAreaLoader.Get(contentAreaItem);
                        return defaultContent;
                    }
                    contentAreaItem.ContentLink = commonDraft.ContentLink;
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
