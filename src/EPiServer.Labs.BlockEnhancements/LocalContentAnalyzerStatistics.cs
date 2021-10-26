using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace EPiServer.Labs.BlockEnhancements
{
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
    public class LocalContentAnalyzerStatistics
    {
        public int BlockInstancesCount { get; set; }
        public int LocalBlockInstancesCount { get ; set ; }
        public int SharedBlockInstancesCount { get ; set ; }
        public int SharedBlocksReferencedJustOnceCount { get ; set ; }
        public string LocalBlockRatio { get ; set ; }
        public int UnusedSharedBlocks { get ; set ; }
        public int RealSharedBlocks { get ; set ; }
    }
}
