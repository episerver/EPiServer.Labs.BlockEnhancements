using System.Net;
using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.Initialization;
using EPiServer.ServiceLocation;

namespace Episerver.Telemetry.UI.Internal
{
    [ModuleDependency(typeof(CmsCoreInitialization))]
    internal class TelemetryInitialization : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Configure<TelemetryOptions>(TelemetryOptionsTransform.Transform);
        }

        public void Initialize(InitializationEngine context)
        {
            // Azure function requires TLS 1.2, this is not enabled by default in .NET 4.5,
            // enable it once during initialization.
            ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;
        }

        public void Uninitialize(InitializationEngine context) { }
    }
}
