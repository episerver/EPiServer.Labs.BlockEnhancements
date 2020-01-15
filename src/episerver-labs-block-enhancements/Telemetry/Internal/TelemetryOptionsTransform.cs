using System.Collections.Specialized;
using System.Configuration;

namespace EPiServer.Labs.BlockEnhancements.Telemetry.Internal
{
    internal class TelemetryOptionsTransform
    {
        internal const string EnvironmentNameConfigKey = "episerver:EnvironmentName";

        public static void Transform(TelemetryOptions options)
            => Transform(options, ConfigurationManager.AppSettings);

        internal static void Transform(TelemetryOptions options, NameValueCollection settings)
        {
            var environmentName = settings.Get(EnvironmentNameConfigKey);
            options.IsDxcEnvironment = environmentName != null;
        }
    }
}
