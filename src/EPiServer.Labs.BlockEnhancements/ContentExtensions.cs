using System;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Core;

namespace EPiServer.Labs.BlockEnhancements
{
    public static class ContentExtensions
    {
        public static ExtendedVersionStatus GetCalculatedStatus(this IContent content)
        {
            var versionableContent = content as IVersionable;

            if (versionableContent == null)
            {
                return ExtendedVersionStatus.Published;
            }

            if (versionableContent.HasExpired())
            {
                return ExtendedVersionStatus.Expired;
            }

            int status = (int)versionableContent.Status;
            return (ExtendedVersionStatus)status;
        }

        public static bool HasExpired(this IVersionable content)
        {
            if (content.Status == VersionStatus.Published && content.StopPublish < DateTime.Now)
            {
                return true;
            }
            return false;
        }
    }
}
