using EPiServer.Cms.Shell.UI.Rest;
using EPiServer.Cms.Shell.UI.Rest.Models.Internal;
using EPiServer.Cms.Shell.UI.Rest.Models.Transforms;
using EPiServer.Core;
using EPiServer.ServiceLocation;
using EPiServer.Web.Routing;

namespace EPiServer.Labs.BlockEnhancements.StatusIndicator
{
    [ServiceConfiguration(typeof(IModelTransform), Lifecycle = ServiceInstanceScope.Singleton)]
    public class EnhancedStructureStoreModelTransform : TransformBase<EnhancedStructureStoreContentDataModel>
    {
        private readonly ApprovalResolver _approvalResolver;
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;
        private readonly IContentLoader _contentLoader;
        private readonly IContentRouteHelper _contentRouteHelper;
        private readonly CurrentContentContext _currentContentContext;

        public override TransformOrder Order => TransformOrder.TransformEnd;

        public EnhancedStructureStoreModelTransform(ApprovalResolver approvalResolver, BlockEnhancementsOptions blockEnhancementsOptions,
            IContentLoader contentLoader, IContentRouteHelper contentRouteHelper,
            CurrentContentContext currentContentContext)
        {
            _approvalResolver = approvalResolver;
            _blockEnhancementsOptions = blockEnhancementsOptions;
            _contentLoader = contentLoader;
            _contentRouteHelper = contentRouteHelper;
            _currentContentContext = currentContentContext;
        }

        public override void TransformInstance(IContent source, EnhancedStructureStoreContentDataModel target,
            IModelTransformContext context)
        {
            var isLocalContent = target.Capabilities["isLocalContent"];
            if (_blockEnhancementsOptions.LocalContentFeatureEnabled && isLocalContent)
            {
                var node = _currentContentContext.ContentLink ?? _contentRouteHelper.ContentLink;
                var parentStatus = _contentLoader.Get<IContent>(node).GetCalculatedStatus();
                target.IsPartOfActiveApproval = parentStatus == ExtendedVersionStatus.CheckedIn ||
                                          parentStatus == ExtendedVersionStatus.PreviouslyPublished ||
                                          parentStatus == ExtendedVersionStatus.DelayedPublish ||
                                          parentStatus == ExtendedVersionStatus.AwaitingApproval;
            }
            else if (_blockEnhancementsOptions.PublishPageWithBlocks)
            {
                target.IsPartOfActiveApproval = _approvalResolver.IsPartOfActiveApproval(source);
            }
        }
    }
}
