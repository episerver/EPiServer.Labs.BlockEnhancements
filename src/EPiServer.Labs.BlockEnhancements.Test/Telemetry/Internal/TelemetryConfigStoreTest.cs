using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using EPiServer.Framework.Serialization.Json.Internal;
using EPiServer.Labs.BlockEnhancements.Telemetry;
using EPiServer.Labs.BlockEnhancements.Telemetry.Internal;
using EPiServer.Licensing;
using EPiServer.Security;
using EPiServer.Shell.Modules;
using Moq;
using Xunit;

namespace EPiServer.Labs.BlockEnhancements.Test.Telemetry.Internal
{
    public class TelemetryConfigStoreTest
    {
        private readonly TelemetryOptions _telemetryOptions;
        private readonly LicensingOptions _licensingOptions;
        private readonly HttpResponseMessage _httpResponseMessage;
        private readonly TelemetryConfigStore _telemetryConfigStore;

        public TelemetryConfigStoreTest()
        {
            var hashHandler = new Mock<IHashHandler>();
            hashHandler
                .Setup(_ => _.GenerateStringHash(It.IsAny<byte[]>()))
                .Returns((byte[] data) => "hashed-" + Encoding.Unicode.GetString(data) + "=");

            var principalAccessor = Mock.Of<IPrincipalAccessor>();
            principalAccessor.Principal = new GenericPrincipal(new GenericIdentity("username"), null);

            var moduleTable = new Mock<ModuleTable>();
            moduleTable
                .Setup(_ => _.GetModules())
                .Returns(new[] { new ShellModule("module-name", null, null) });

            _telemetryOptions = new TelemetryOptions { OptedIn = true };
            _licensingOptions = new LicensingOptions();
            _httpResponseMessage = new HttpResponseMessage
            {
                Content = new StringContent("{\"key\":true}")
            };
            _telemetryConfigStore = new TelemetryConfigStore(_telemetryOptions, _licensingOptions, principalAccessor, moduleTable.Object, new JsonObjectSerializer())
            {
                GetRequestAsync = (string url) => Task.FromResult(_httpResponseMessage),
                HashHandler = hashHandler.Object
            };
        }

        [Fact]
        public async void HashString_ShouldTrimTrailingEquals()
        {
            _licensingOptions.LicenseKey = "=";
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("hashed-", result.GetData<TelemetryConfigModel>().Client);
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
            Assert.Equal("hashed-key", result.GetData<TelemetryConfigModel>().Client);
        }

        [Fact]
        public async void GetClientHash_WhenLicenseKey_IsNull_AndWhenLicenseFile_IsNotNull_ShouldSetClient_AsHashedLicensedCompany()
        {
            _licensingOptions.LicenseKey = null;
            _telemetryConfigStore.LoadLicense = (string licenseFilePath) => new LicenseData { LicensedCompany = "company" };
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("hashed-company", result.GetData<TelemetryConfigModel>().Client);
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
            Assert.Equal("hashed-username", result.GetData<TelemetryConfigModel>().User);
        }

        [Fact]
        public async void GetUserHash_WhenProfileEmail_IsNotNull_ShouldSetUser_AsHashedEmail()
        {
            _telemetryConfigStore.LoadEmailFromProfile = (string username) => "user@domain.com";
            var result = await _telemetryConfigStore.Get();
            Assert.Equal("hashed-user@domain.com", result.GetData<TelemetryConfigModel>().User);
        }

        [Fact]
        public async void GetVersions_ShouldSetVersions_AsDictionary()
        {
            var result = await _telemetryConfigStore.Get();
            Assert.Contains("module-name", result.GetData<TelemetryConfigModel>().Versions);
        }
    }
}
