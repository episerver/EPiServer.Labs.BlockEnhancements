using System.Collections.Generic;

namespace Episerver.Telemetry.UI.Internal
{
    internal class TelemetryConfigModel
    {
        public string Client { get; internal set; }

        public IDictionary<string, object> Configuration { get; internal set; }

        public string User { get; internal set; }

        public IDictionary<string, string> Versions { get; internal set; }

        internal static TelemetryConfigModel Disabled = new TelemetryConfigModel
        {
            Configuration = new Dictionary<string, object>
            {
                ["disableTelemetry"] = true
            }
        };
    }
}
