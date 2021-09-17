using System.Collections.Specialized;
using System.Linq;
using EPiServer.Cms.Shell.UI.Rest.ContentQuery;
using EPiServer.Cms.Shell.UI.Rest.Projects;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.Globalization;
using EPiServer.Security;

namespace EPiServer.Cms.Shell.UI.Rest.Internal
{
    internal class LatestContentVersionResolver
    {
        private readonly IContentStoreModelCreator _contentStoreModelCreator;
        private readonly IContentLoader _contentLoader;
        private readonly IContentVersionRepository _contentVersionRepository;
        private readonly LanguageResolver _languageResolver;
        private readonly ProjectRepository _projectRepository;
        private readonly CurrentProject _currentProject;

        public LatestContentVersionResolver(
            IContentStoreModelCreator contentStoreModelCreator,
            IContentVersionRepository contentVersionRepository,
            LanguageResolver languageResolver,
            IContentLoader contentLoader,
            ProjectRepository projectRepository,
            CurrentProject currentProject)
        {
            _contentStoreModelCreator = contentStoreModelCreator;
            _contentVersionRepository = contentVersionRepository;
            _languageResolver = languageResolver;
            _contentLoader = contentLoader;
            _projectRepository = projectRepository;
            _currentProject = currentProject;
        }

        /// <summary>
        /// Returns the latest version in the preferred language as returned by <see cref="LanguageResolver.GetPreferredCulture"/>.
        /// Return null if there is no version in the preferred language.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="queryString"></param>
        /// <returns></returns>
        public EnhancedStructureStoreContentDataModel GetLatestVersion(ContentReference id, NameValueCollection queryString)
        {
            var preferredCulture = _languageResolver.GetPreferredCulture();

            var draftLink = GetCommonDraft(id, preferredCulture.Name);

            if (draftLink == null)
            {
                return null;
            }

            var content = _contentLoader.Get<IContent>(draftLink);
            var queryParameters = new ContentQueryParameters
            {
                AllParameters = queryString,
                CurrentPrincipal = PrincipalInfo.CurrentPrincipal
            };
            // The ContentVersionFilter modify content links.
            // We have to use this filter here to make sure that we will use proper links
            return _contentStoreModelCreator.CreateContentDataStoreModel<EnhancedStructureStoreContentDataModel>(content, queryParameters);
        }

        /// <summary>
        /// Returns the latest version in the preferred language as returned by <see cref="LanguageResolver.GetPreferredCulture"/>.
        /// Return null if there is no version in the preferred language.
        /// </summary>
        public ContentReference GetCommonDraft(ContentReference id, string preferredCultureName)
        {
            return _currentProject.ProjectId.HasValue
                ? GetDraftLink(id, preferredCultureName, _currentProject.ProjectId.Value)
                : GetDraftLink(id, preferredCultureName);
        }

        /// <summary>
        /// Returns the common draft link for the given content link in the given preferred language.
        /// Return null if there is no version in the given language.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="preferredCultureName"></param>
        /// <returns></returns>
        private ContentReference GetDraftLink(ContentReference id, string preferredCultureName)
        {
            return _contentVersionRepository.LoadCommonDraft(id, preferredCultureName)?.ContentLink;
        }

        /// <summary>
        /// Returns the latest draft link for the given content link in a project.
        /// Return the common draft if there is no version in the preferred language in the given project.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="preferredCultureName"></param>
        /// <param name="projectId"></param>
        /// <returns></returns>
        private ContentReference GetDraftLink(ContentReference id, string preferredCultureName, int projectId)
        {
            var projectItemReference = GetProjectItemReference(id, projectId, preferredCultureName);

            // return the project item reference if it exists, otherwise try to get the common draft
            if (projectItemReference != null)
            {
                return projectItemReference;
            }

            return GetDraftLink(id, preferredCultureName);
        }

        public ContentReference GetProjectItemReference(ContentReference contentLink, int projectId, string language)
        {
            var items = _projectRepository.ListItems(projectId);

            var item = items.FirstOrDefault(
                x => ContentReferenceExtensions.ToReferenceWithoutVersion((ContentReference)x.ContentLink) == contentLink.ToReferenceWithoutVersion()
                     && (x.Language?.Name == language)
            );
            return item?.ContentLink;
        }
    }
}
