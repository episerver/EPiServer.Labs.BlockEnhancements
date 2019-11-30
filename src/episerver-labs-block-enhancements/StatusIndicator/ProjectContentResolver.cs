using System.Linq;
using EPiServer.Core;
using EPiServer.DataAbstraction;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.StatusIndicator
{
    [ServiceConfiguration(ServiceType = typeof(ProjectContentResolver))]
    public class ProjectContentResolver
    {
        private readonly ProjectRepository _projectRepository;

        public ProjectContentResolver(ProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        public ContentReference GetProjectReference(ContentReference publishedReference, int projectId)
        {
            var items = _projectRepository.ListItems(projectId);
            if (items == null)
            {
                return publishedReference;
            }

            var item = items.FirstOrDefault(x => x.ContentLink.ToReferenceWithoutVersion() == publishedReference.ToReferenceWithoutVersion());
            return item == null ? publishedReference : items.FirstOrDefault(x => x.ContentLink.ID == item.ContentLink.ID).ContentLink;
        }
    }
}
