using EPiServer.ServiceLocation;

namespace Episerver.Telemetry.UI
{
    [Options]
    public class TelemetryOptions
    {
        /// <summary>
        /// Opt in to the collection of usage telemetry.
        /// </summary>
        /// <remarks>
        /// Setting this to <code>false</code> does not imply opt out; usage telemetry
        /// will always be collected in DXC environments.
        /// </remarks>
        public bool OptedIn { get; set; } = false;

        /// <summary>
        /// Indicates whether the application is running in a DXC environment.
        /// </summary>
        internal bool IsDxcEnvironment { get; set; } = false;

        /// <summary>
        /// Gets a value indicating if telemetry is enabled.
        /// </summary>
        /// <returns><code>true</code> if in DXC or if the customer has opted in; otherwise <code>false</code></returns>
        internal bool IsTelemetryEnabled() => IsDxcEnvironment || OptedIn;
    }
}
