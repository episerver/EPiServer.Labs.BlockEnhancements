using EPiServer.Shell.Services.Rest;

namespace Episerver.Telemetry.UI.Tests
{
    public static class RestResultExtensions
    {
        public static T GetData<T>(this RestResult result) => (T)result.Data;
    }
}
