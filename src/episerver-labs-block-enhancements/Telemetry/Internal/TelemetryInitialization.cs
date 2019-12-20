using EPiServer.Framework;
using EPiServer.Framework.Initialization;
using EPiServer.Initialization;
using EPiServer.ServiceLocation;

namespace EPiServer.Labs.BlockEnhancements.Telemetry.Internal
{
    [ModuleDependency(typeof(CmsCoreInitialization))]
    internal class TelemetryInitialization : IConfigurableModule
    {
        public void ConfigureContainer(ServiceConfigurationContext context)
        {
            context.Services.Configure<TelemetryOptions>(TelemetryOptionsTransform.Transform);
        }

        public void Initialize(InitializationEngine context) { }

        public void Uninitialize(InitializationEngine context) { }
    }
}
