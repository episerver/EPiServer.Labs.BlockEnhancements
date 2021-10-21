using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.InlineBlocksEditing
{
    [ServiceConfiguration(typeof(LocalBlockConverter), Lifecycle = ServiceInstanceScope.Singleton)]
    public class LocalBlockConverter
    {

    }
}
