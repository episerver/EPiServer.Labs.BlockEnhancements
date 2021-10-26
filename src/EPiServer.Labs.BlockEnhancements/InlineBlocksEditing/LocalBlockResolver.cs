using System.Web;
using EPiServer.Core;
using EPiServer.Framework.Cache;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [ServiceConfiguration(typeof(LocalBlockResolver), Lifecycle = ServiceInstanceScope.Singleton)]
    public class LocalBlockResolver
    {
        private readonly IContentLoader _contentLoader;
        private readonly IObjectInstanceCache _cache;
        private readonly ServiceAccessor<HttpContextBase> _httpContextAccessor;
        private readonly BlockEnhancementsOptions _blockEnhancementsOptions;
        internal const string CacheKey = "EPi:Labs:IsLocalBlock";
        private static readonly object _cacheLock = new object();

        public LocalBlockResolver(IContentLoader contentLoader, IObjectInstanceCache cache,
            ServiceAccessor<HttpContextBase> httpContextAccessor, BlockEnhancementsOptions blockEnhancementsOptions)
        {
            _contentLoader = contentLoader;
            _cache = cache;
            _httpContextAccessor = httpContextAccessor;
            _blockEnhancementsOptions = blockEnhancementsOptions;
        }

        public bool ShouldFilterOutLocalBlocks()
        {
            return _blockEnhancementsOptions.LocalContentFeatureEnabled && _httpContextAccessor() != null &&
                   _httpContextAccessor().Request.RawUrl.Contains("/project-item/");
        }

        public bool IsLocal(ContentReference contentLink)
        {
            var key = CacheKey + contentLink;
            var cachedValue = _cache.Get(key);
            if (cachedValue is null)
            {
                lock (_cacheLock)
                {
                    cachedValue = _cache.Get(key);
                    if (cachedValue != null)
                    {
                        return (bool)cachedValue;
                    }

                    cachedValue = _contentLoader.IsLocalContent(contentLink);
                    _cache.Insert(key, cachedValue, null);
                }
            }
            return (bool)cachedValue;
        }
    }
}
