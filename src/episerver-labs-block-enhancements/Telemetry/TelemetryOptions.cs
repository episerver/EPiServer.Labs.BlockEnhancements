namespace EPiServer.Labs.BlockEnhancements.Telemetry
{
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
    }
}
