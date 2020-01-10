using System.Collections.Generic;

namespace EPiServer.Labs.BlockEnhancements.Telemetry.Internal
{
    internal class TelemetryConfigModel
    {
        public string Client { get; internal set; }

        public string InstrumentationKey { get; internal set; }

        public bool IsEnabled { get; internal set; }

        public string User { get; internal set; }

        public IDictionary<string, string> Versions { get; internal set; }
    }
}
