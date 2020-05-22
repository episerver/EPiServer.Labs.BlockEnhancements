using EPiServer.Approvals;
using EPiServer.Approvals.ContentApprovals;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Core;

namespace EPiServer.Labs.BlockEnhancements
{
    public class ApprovalResolver
    {
        private readonly IApprovalDefinitionRepository _approvalDefinitionRepository;

        public ApprovalResolver(IApprovalDefinitionRepository approvalDefinitionRepository)
        {
            _approvalDefinitionRepository = approvalDefinitionRepository;
        }

        public bool IsPartOfActiveApproval(IContent content)
        {
            var definition = _approvalDefinitionRepository.ResolveAsync(content.ContentLink).ConfigureAwait(false)
                .GetAwaiter().GetResult();
            var isEnabled = definition != null && definition.Definition != null && definition.Definition.IsEnabled;
            var extendedVersionStatus = content.GetCalculatedStatus();
            var isReadyToPublish = extendedVersionStatus == ExtendedVersionStatus.CheckedIn;
            return isEnabled && !isReadyToPublish;
        }
    }
}
