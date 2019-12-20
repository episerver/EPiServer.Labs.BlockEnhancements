using System.Collections.Specialized;
using EPiServer.Labs.BlockEnhancements.Telemetry;
using EPiServer.Labs.BlockEnhancements.Telemetry.Internal;
using Xunit;

namespace EPiServer.Labs.BlockEnhancements.Test.Telemetry.Internal
{
    public class TelemetryOptionsTransformTest
    {
        [Fact]
        public void Transform_WhenEnvironmentName_IsProduction_ShouldSetIsDxcEnvironment_AsTrue()
        {
            var options = new TelemetryOptions();
            var settings = new NameValueCollection
            {
                { TelemetryOptionsTransform.EnvironmentNameConfigKey, "Production" }
            };

            TelemetryOptionsTransform.Transform(options, settings);

            Assert.True(options.IsDxcEnvironment);
        }

        [Fact]
        public void Transform_WhenEnvironmentName_IsNotProduction_ShouldSetIsDxcEnvironment_AsFalse()
        {
            var options = new TelemetryOptions();
            var settings = new NameValueCollection
            {
                { TelemetryOptionsTransform.EnvironmentNameConfigKey, "NotProduction" }
            };

            TelemetryOptionsTransform.Transform(options, settings);

            Assert.False(options.IsDxcEnvironment);
        }

        [Fact]
        public void Transform_WhenEnvironmentName_IsNull_ShouldSetIsDxcEnvironment_AsFalse()
        {
            var options = new TelemetryOptions();
            var settings = new NameValueCollection();

            TelemetryOptionsTransform.Transform(options, settings);

            Assert.False(options.IsDxcEnvironment);
        }
    }
}
