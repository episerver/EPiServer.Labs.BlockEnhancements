using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using EPiServer.Framework.Serialization;
using EPiServer.Licensing;
using EPiServer.Security;
using EPiServer.Shell.Modules;
using EPiServer.Shell.Services.Rest;
using EPiServerProfile = EPiServer.Personalization.EPiServerProfile;

namespace Episerver.Telemetry.UI.Internal
{
    [RestStore("telemetryconfig")]
    public class TelemetryConfigStore : RestControllerBase
    {
        private readonly TelemetryOptions _telemetryOptions;
        private readonly LicensingOptions _licensingOptions;
        private readonly IPrincipalAccessor _principalAccessor;
        private readonly ModuleTable _moduleTable;
        private readonly IObjectSerializer _objectSerializer;

        public TelemetryConfigStore(
            TelemetryOptions telemetryOptions,
            LicensingOptions licensingOptions,
            IPrincipalAccessor principalAccessor,
            ModuleTable moduleTable,
            IObjectSerializer objectSerializer)
        {
            _telemetryOptions = telemetryOptions;
            _licensingOptions = licensingOptions;
            _principalAccessor = principalAccessor;
            _moduleTable = moduleTable;
            _objectSerializer = objectSerializer;
        }

        [HttpGet]
        public async Task<RestResult> Get()
        {
            if (!_telemetryOptions.IsTelemetryEnabled())
            {
                return Rest(TelemetryConfigModel.Disabled);
            }

            var telemetryConfigModel = new TelemetryConfigModel
            {
                Client = GetClientHash(),
                User = GetUserHash(),
                Versions = GetVersions()
            };

            var configuration = await GetTelemetryConfiguration(telemetryConfigModel).ConfigureAwait(false);
            if (configuration == null)
            {
                return Rest(TelemetryConfigModel.Disabled);
            }

            telemetryConfigModel.Configuration = configuration;

            return Rest(telemetryConfigModel);
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
            return _moduleTable.GetModules().ToDictionary(_ => _.Name, _ => _.ResolveVersion().ToString());
        }

        /// <summary>
        /// Gets the telemetry configuration from azure function endpoint.
        /// </summary>
        /// <returns>
        /// A dictionary containing the configuration; otherwise null if the request to
        /// the azure function failed.
        /// </returns>
        private async Task<IDictionary<string, object>> GetTelemetryConfiguration(TelemetryConfigModel telemetryConfigModel)
        {
            var endpointUrl = new Uri("https://cmsui.episerver.net/api/telemetryconfig");
            var uriBuilder = new UriBuilder(endpointUrl);
            var query = HttpUtility.ParseQueryString(uriBuilder.Query);
            query.Add("client", telemetryConfigModel.Client);
            query.Add("user", telemetryConfigModel.User);
            query.Add("version", telemetryConfigModel.Versions["CMS"]);

            uriBuilder.Query = query.ToString();
            var url = uriBuilder.Uri.ToString();
            try
            {
                using (var response = await GetRequestAsync(url).ConfigureAwait(false))
                using (var content = response.Content)
                {
                    if (!response.IsSuccessStatusCode)
                    {
                        return null;
                    }
                    var raw = await content.ReadAsStringAsync().ConfigureAwait(false);
                    return _objectSerializer.Deserialize<IDictionary<string, object>>(raw);
                }
            }
            catch (HttpRequestException)
            {
                // Occurs when the request fails due to server issues or timeout.
                return null;
            }
        }

        private string GetUserHash()
        {
            var username = _principalAccessor.CurrentName();
            var email = LoadEmailFromProfile(username);
            return HashString(string.IsNullOrEmpty(email) ? username : email);
        }

        private string HashString(string data)
        {
            if (data == null)
            {
                return null;
            }

            using (var sha512 = SHA512.Create())
            {
                var hash = sha512.ComputeHash(Encoding.Unicode.GetBytes(data));
                return Convert.ToBase64String(hash).TrimEnd('=');
            }
        }

        // Delegate get request to allow mocking in unit tests.
        internal Func<string, Task<HttpResponseMessage>> GetRequestAsync = async (string requestUri) =>
        {
            using (var client = new HttpClient())
            {
                return await client.GetAsync(requestUri).ConfigureAwait(false);
            }
        };

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
