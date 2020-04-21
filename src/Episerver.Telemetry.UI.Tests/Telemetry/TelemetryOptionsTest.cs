using Xunit;

namespace Episerver.Telemetry.UI.Tests.Telemetry
{
    public class TelemetryOptionsTest
    {
        [Fact]
        public void IsTelemetryEnabled_WhenIsDxcEnvironment_IsFalse_ShouldBeFalse()
        {
            var options = new TelemetryOptions
            {
                IsDxcEnvironment = false
            };

            Assert.False(options.IsTelemetryEnabled());
        }

        [Fact]
        public void IsTelemetryEnabled_WhenOptedIn_IsFalse_ShouldBeFalse()
        {
            var options = new TelemetryOptions
            {
                OptedIn = false
            };

            Assert.False(options.IsTelemetryEnabled());
        }

        [Fact]
        public void IsTelemetryEnabled_WhenOptedInAndIsDxcEnvironment_AreTrue_ShouldBeTrue()
        {
            var options = new TelemetryOptions
            {
                IsDxcEnvironment = true,
                OptedIn = true
            };

            Assert.True(options.IsTelemetryEnabled());
        }
    }
}
