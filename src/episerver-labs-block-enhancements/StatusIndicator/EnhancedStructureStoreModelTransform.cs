using EPiServer.Cms.Shell.UI.Rest.Models;
using EPiServer.Cms.Shell.UI.Rest.Models.Transforms;
using EPiServer.Cms.Shell.UI.Rest.Models.Transforms.Internal;
using EPiServer.Core;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.StatusIndicator
{
    public class EnhancedStructureStoreContentDataModel : StructureStoreContentDataModel
    {
        public bool IsPartOfActiveApproval { get; set; }
    }

    [ServiceConfiguration(typeof(IModelTransform), Lifecycle = ServiceInstanceScope.Singleton)]
    public class EnhancedStructureStoreModelTransform : TransformBase<EnhancedStructureStoreContentDataModel>
    {
        private readonly StructureStoreModelTransform _baseTransform;
        private readonly ApprovalResolver _approvalResolver;

        public EnhancedStructureStoreModelTransform(StructureStoreModelTransform baseTransform, ApprovalResolver approvalResolver)
        {
            _baseTransform = baseTransform;
            _approvalResolver = approvalResolver;
        }

        public override void TransformInstance(IContent source, EnhancedStructureStoreContentDataModel target, IModelTransformContext context)
        {
            _baseTransform.TransformInstance(source, target, context);
            target.IsPartOfActiveApproval = _approvalResolver.IsPartOfActiveApproval(source);
        }
    }
}
