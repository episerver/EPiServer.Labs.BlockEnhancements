using System;
using EPiServer.Core;
using EPiServer.ServiceLocation;
using EPiServer.Shell.UI.Internal;

namespace AlloyTemplates.Business.Initialization
{
    [ServiceConfiguration(typeof(IEventListener), Lifecycle = ServiceInstanceScope.Singleton)]
    public class PublishValidation: IEventListener
    {
        private readonly IContentEvents _contentEvents;

        public PublishValidation(IContentEvents contentEvents)
        {
            _contentEvents = contentEvents;
        }

        public void Start()
        {
            _contentEvents.PublishingContent += _contentEvents_PublishingContent;
        }

        public void Stop()
        {
            _contentEvents.PublishingContent -= _contentEvents_PublishingContent;
        }

        private void _contentEvents_PublishingContent(object sender, EPiServer.ContentEventArgs e)
        {
            if (string.Compare(e.Content.Name, "DoNotPublish", StringComparison.CurrentCultureIgnoreCase) == 0)
            {
                e.CancelAction = true;
                e.CancelReason = "Can't publish";
            }
        }
    }
}
