using EPiServer.Licensing;
using EPiServer.Security;
using EPiServer.Shell.Services.Rest;
using EPiServerProfile = EPiServer.Personalization.EPiServerProfile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace EPiServer.Labs.BlockEnhancements.Telemetry.Internal
{
    [RestStore("telemetryconfig")]
    public class TelemetryConfigStore : RestControllerBase
    {
        private readonly TelemetryOptions _telemetryOptions;
        private readonly LicensingOptions _licensingOptions;
        private readonly IPrincipalAccessor _principalAccessor;

        public TelemetryConfigStore(TelemetryOptions telemetryOptions, LicensingOptions licensingOptions, IPrincipalAccessor principalAccessor)
        {
            _telemetryOptions = telemetryOptions;
            _licensingOptions = licensingOptions;
            _principalAccessor = principalAccessor;

            HashHandler = new SiteSecurity();
        }

        [HttpGet]
        public async Task<RestResult> Get()
        {
            return Rest(new TelemetryConfigModel
            {
                InstrumentationKey = await GetInstrumentationKey().ConfigureAwait(false),
                IsEnabled = await IsTelemetryEnabled().ConfigureAwait(false),
                Client = GetClientHash(),
                User = GetUserHash(),
                Versions = GetVersions()
            });
        }

        private string GetClientHash()
        {
            var licenseKey = _licensingOptions.LicenseKey;
            if (licenseKey != null)
            {
                return HashString(licenseKey);
            }

            try
            {
                var license = LoadLicense(_licensingOptions.LicenseFilePath);
                return HashString(license?.LicensedCompany);
            }
            catch
            {
                return null;
            }
        }

        private Dictionary<string, string> GetVersions()
        {
            string GetAssemblyVersion(Type type)
            {
                return type.Assembly.GetName().Version.ToString();
            }

            var result = new Dictionary<string, string>
            {
                ["CmsUI"] = GetAssemblyVersion(typeof(RestControllerBase)),
                ["BlockEnhancements"] = GetAssemblyVersion(typeof(BlockEnhancementsModule))
            };
            return result;
        }

        private async Task<string> GetInstrumentationKey()
        {
            // hardcoded instrumentation key from the production subscription
            // https://portal.azure.com/#@episerver.net/resource/subscriptions/d08856e3-820a-4d39-8954-8b8916e966be/resourceGroups/cmsuitelemetryrg/providers/microsoft.insights/components/cmsui-telemetry-services-ai/overview
            return await Task.FromResult("e4b8b0bc-c592-4797-8a7e-61cf60978363");
        }

        private string GetUserHash()
        {
            var username = _principalAccessor.CurrentName();
            var email = LoadEmailFromProfile(username);
            return HashString(email ?? username);
        }

        private string HashString(string data)
        {
            if (data == null)
            {
                return null;
            }
            return HashHandler.GenerateStringHash(Encoding.Unicode.GetBytes(data));
        }

        private async Task<bool> IsTelemetryEnabled()
        {
            return await Task.FromResult(_telemetryOptions.IsTelemetryEnabled());
        }

        // Allow mocking the generated hash in unit tests.
        internal IHashHandler HashHandler { get; set; }

        // Delegate license loading to allow mocking in unit tests.
        internal Func<string, LicenseData> LoadLicense = (string licenseFilePath) =>
        {
            var key = RSA.Create();
            key.FromXmlString(CloudLicenseConsts.PublicKey);
            return LicenseData.Load(licenseFilePath, null, key).FirstOrDefault();
        };

        // Delegate profile loading to allow mocking in unit tests.
        internal Func<string, string> LoadEmailFromProfile = (string username) => EPiServerProfile.Get(username)?.Email;
    }
}
