using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Threading.Tasks;
using EPiServer.Framework.Serialization.Json.Internal;
using EPiServer.Licensing;
using EPiServer.Security;
using EPiServer.Shell.Modules;
using Episerver.Telemetry.UI.Internal;
using Moq;
using Xunit;

namespace Episerver.Telemetry.UI.Tests.Telemetry.Internal
{
    public class TelemetryConfigStoreTest
    {
        private readonly TelemetryOptions _telemetryOptions;
        private readonly LicensingOptions _licensingOptions;
        private readonly HttpResponseMessage _httpResponseMessage;
        private readonly TelemetryConfigStore _telemetryConfigStore;
        private readonly IPrincipalAccessor _principalAccessor;

        public TelemetryConfigStoreTest()
        {
            _principalAccessor = Mock.Of<IPrincipalAccessor>();
            _principalAccessor.Principal = new GenericPrincipal(new GenericIdentity("username"), null);

            var moduleTable = new Mock<ModuleTable>();
            moduleTable
                .Setup(_ => _.GetModules())
                .Returns(new[] { new ShellModule("CMS", null, null) });

            _telemetryOptions = new TelemetryOptions { OptedIn = true };
            _licensingOptions = new LicensingOptions
            {
                LicenseKey = "LicenseKey"
            };
            _httpResponseMessage = new HttpResponseMessage
            {
                Content = new StringContent("{\"key\":true}")
            };
            _telemetryConfigStore = new TelemetryConfigStore(_telemetryOptions, _licensingOptions, _principalAccessor, moduleTable.Object, new JsonObjectSerializer())
            {
                GetRequestAsync = (string url) => Task.FromResult(_httpResponseMessage),
            };
        }

        [Fact]
        public async void HashString_ShouldTrimTrailingEquals()
        {
            var result = await _telemetryConfigStore.Get();
            Assert.False(result.GetData<TelemetryConfigModel>().Client.EndsWith("="));
        }

        [Fact]
        public async void Get_WhenIsTelemetryEnabled_IsFalse_ShouldSetDisableTelemetry_AsTrue()
        {
            _telemetryOptions.OptedIn = false;
            var result = await _telemetryConfigStore.Get();
            Assert.True(result.GetData<TelemetryConfigModel>().Configuration["disableTelemetry"] as bool?);
        }

        [Fact]
        public async void Get_WhenIsTelemetryEnabled_IsFalse_ShouldNotCallAzureFunction()
        {
            _telemetryOptions.OptedIn = false;
            bool isDelegateCalled = false;
            _telemetryConfigStore.GetRequestAsync = (url) =>
            {
                isDelegateCalled = true;
                return Task.FromResult(_httpResponseMessage);
            };
            var result = await _telemetryConfigStore.Get();
            Assert.False(isDelegateCalled);
        }

        [Fact]
        public async void Get_WhenIsTelemetryEnabled_IsTrue_ShouldCallAzureFunction()
        {
            bool isDelegateCalled = false;
            _telemetryConfigStore.GetRequestAsync = (url) =>
            {
                isDelegateCalled = true;
                return Task.FromResult(_httpResponseMessage);
            };
            var result = await _telemetryConfigStore.Get();
            Assert.True(isDelegateCalled);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNotNull_ShouldSetClient_AsHashedLicenseKey()
        {
            _licensingOptions.LicenseKey = "key";
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("6Xs43pBpSkS2IjoYdY5NgQIWAY6gZwK7IQ2/BQB4I2umzGflnF0Ck1yAK3dRYN0vaqnaVGaNczOzJnUJWLE2Hg", result.GetData<TelemetryConfigModel>().Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndWhenLicenseFile_IsNotNull_ShouldSetClient_AsHashedLicensedCompany()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryConfigStore.LoadLicense = (string licenseFilePath) => new LicenseData { LicensedCompany = "company" };
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("dR3n/AJAZiZtVmBnrJrEn+a9mlZiZjYSGrhEEFYiAl8vbA1HduH80e0oQJLdVgewrDIPZZLxUIgTayhaLT8ONQ", result.GetData<TelemetryConfigModel>().Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndWhenLicenseFile_IsNull_ShouldSetClient_AsNull()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryConfigStore.LoadLicense = (string licenseFilePath) => null;
            var result = await _telemetryConfigStore.Get();
            Assert.Null(result.GetData<TelemetryConfigModel>().Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndLoadLicense_ThrowsLicenseException_ShouldSetClient_AsNull()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryConfigStore.LoadLicense = (string licenseFilePath) => throw new LicenseException();
            var result = await _telemetryConfigStore.Get();
            Assert.Null(result.GetData<TelemetryConfigModel>().Client);
        }

        [Fact]
        public async void GetConfiguration_ShouldReturnResponse_AsDictionary()
        {
            var result = await _telemetryConfigStore.Get();
            Assert.Contains("key", result.GetData<TelemetryConfigModel>().Configuration);
        }

        [Fact]
        public async void GetConfiguration_WhenResponseCode_IsNotSuccessful_ShouldReturnDisableTelemetry()
        {
            _telemetryConfigStore.GetRequestAsync = (url) =>
            {
                _httpResponseMessage.StatusCode = HttpStatusCode.NotFound;
                return Task.FromResult(_httpResponseMessage);
            };
            var result = await _telemetryConfigStore.Get();
            Assert.True(result.GetData<TelemetryConfigModel>().Configuration["disableTelemetry"] as bool?);
        }

        [Fact]
        public async void GetConfiguration_WhenRequest_ThrowsException_ShouldReturnDisableTelemetry()
        {
            _telemetryConfigStore.GetRequestAsync = (url) =>
            {
                throw new HttpRequestException();
            };
            var result = await _telemetryConfigStore.Get();
            Assert.True(result.GetData<TelemetryConfigModel>().Configuration["disableTelemetry"] as bool?);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsNull_ShouldSetUser_AsHashedUsername()
        {
            _telemetryConfigStore.LoadEmailFromProfile = (string username) => null;
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("KWAvYvtBvfvt5uSeb6LCxmsoDv7hgRO7q2Ad2snnk3u9/Hhpdm+ntJn0VAbz/OKUoLO30C7T4IHF/LQRxON2jw", result.GetData<TelemetryConfigModel>().User);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsEmpty_ShouldSetUser_AsHashedEmail()
        {
            _telemetryConfigStore.LoadEmailFromProfile = (string username) => "";
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("KWAvYvtBvfvt5uSeb6LCxmsoDv7hgRO7q2Ad2snnk3u9/Hhpdm+ntJn0VAbz/OKUoLO30C7T4IHF/LQRxON2jw", result.GetData<TelemetryConfigModel>().User);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsNotNull_ShouldSetUser_AsHashedEmail()
        {
            _telemetryConfigStore.LoadEmailFromProfile = (string username) => "user@domain.com";
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("+whYti3ku/zuRSJ4qsqGfHjtVkAesvlZpFkNJLSKGtGLgp6wHvpRuhGSGb/FPINjdNyY6KjukoaRiJbeHyh5Bg", result.GetData<TelemetryConfigModel>().User);
        }

        [Fact]
        public async void GetVersions_ShouldSetVersions_AsDictionary()
        {
            var result = await _telemetryConfigStore.Get();
            Assert.Contains("CMS", result.GetData<TelemetryConfigModel>().Versions);
        }

        [Fact]
        public async void GetConfiguration_ShouldBeCalledWithClientParameter()
        {
            _telemetryConfigStore.GetRequestAsync = url =>
            {
                Assert.Contains("client=VWBImW05ulqZaZtOwhh5gV3JA5lPvfmhz3hFAITGce2ae0uBKy9tmyiow9D7DWa7lPpB0UCW%2bV%2bAj%2bRLBqIL1g", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryConfigStore.Get();
        }

        [Fact]
        public async void GetConfiguration_ShouldBeCalledWithUserParameter()
        {
            _telemetryConfigStore.GetRequestAsync = url =>
            {
                Assert.Contains("user=KWAvYvtBvfvt5uSeb6LCxmsoDv7hgRO7q2Ad2snnk3u9%2fHhpdm%2bntJn0VAbz%2fOKUoLO30C7T4IHF%2fLQRxON2jw", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryConfigStore.Get();
        }

        [Fact]
        public async void GetConfiguration_ShouldBeCalledWithModuleParameter()
        {
            _telemetryConfigStore.GetRequestAsync = url =>
            {
                Assert.Contains("version=0.0", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryConfigStore.Get();
        }

        [Fact]
        public async void GetConfiguration_WhenLicenseIsEmpty_ShouldBeCalledWithClientParameter_AsEmpty()
        {
            _licensingOptions.LicenseKey = null;

            _telemetryConfigStore.GetRequestAsync = url =>
            {
                Assert.Contains("client=&", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryConfigStore.Get();
        }

        [Fact]
        public async void GetConfiguration_WhenPrincipalIsNull_ShouldBeCalledWithUserParameter_AsEmpty()
        {
            _principalAccessor.Principal = null;

            _telemetryConfigStore.GetRequestAsync = url =>
            {
                Assert.Contains("user=&", url);
                return Task.FromResult(_httpResponseMessage);
            };
            await _telemetryConfigStore.Get();
        }
    }
}
