using EPiServer.Shell.Services.Rest;

namespace EPiServer.Labs.BlockEnhancements.Test
{
    public static class RestResultExtensions
    {
        public static T GetData<T>(this RestResult result) => (T)result.Data;
    }
}
