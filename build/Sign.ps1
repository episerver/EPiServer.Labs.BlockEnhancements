Param([String]$WindowsSDKPath)

if(!$WindowsSDKPath) {
    Write-Host "WindowsSDKPath is a required parameter"
    exit 1
}
Write-Host "SDK tools path: " + $WindowsSDKPath

$sn = $WindowsSDKPath + "\sn.exe"
if (!(Test-Path $sn)) {
    Write-Error ($sn + " not found")
    exit 1
}

function Try-GetCert([String]$certFingerprint)
{
    $certArray = Get-ChildItem -Recurse -File cert:\ | Where-Object {$_.notafter -ge (get-date).AddDays(30) -AND $_.Thumbprint -match $certFingerprint}
    if ($certArray -eq $null)
    {
        return $null;
    }
    return $certArray[0];
}

# Copied from CMS-UI repository. When making any changes please remember to update the other file as well.
function Get-Cert()
{
    # First attempt to get cert based on environment variable
    if (Test-Path env:EPISERVER_CS_CERTIFICATE_THUMBPRINT)
    {
        $certFingerprint = (Get-Item env:EPISERVER_CS_CERTIFICATE_THUMBPRINT).Value
    }
    else
    {
        # If environment variable is not defined, try new (27th of May 2019) cert fingerprint
        $certFingerprint = "EABEA65470D9B25F92B09C202EB3DED15FD0B0A9"
    }

    $cert = Try-GetCert($certFingerprint)
    if ($cert -ne $null)
    {
        return $cert;
    }

    # Fallback to old cert
    return Try-GetCert("5825c5ccf7fa5195f0a11f7a144d3e13922c7047")
}

$rootDir = Get-Location
function ResolveAssemblies($root, $base) {
    $path = Join-Path ($root) ($base);
    $srcProjects = @(Get-ChildItem -Directory -Path $path);

    $assemblies = @()
    foreach($item in $srcProjects)
    {
        $assemblies += (Get-ChildItem -Recurse -Path (Join-Path ($path) "\$($item.Name)") -File -Filter ($item.Name + ".dll"))
    }

    return $assemblies
}

$assemblies = ResolveAssemblies $rootDir ".\src"

Write-Host "Signing assemblies"
$signError = $false
foreach ($assembly in $assemblies)
{
    Write-Host (" Signing " + $assembly.FullName)
    $LASTEXITCODE = 0
    &"$WindowsSDKPath\sn.exe" -q -Rc  $assembly.FullName "EPiServerProduct"
    if ($LASTEXITCODE -ne 0)
    {
        exit $LASTEXITCODE
    }
}

$url = "http://timestamp.verisign.com/scripts/timstamp.dll"
$cert = Get-Cert
if ($cert -eq $null)
{
    Write-Error "No certificate has been found, or it is about to expire"
    exit 1
}

Write-Host "Signing files"
$authentiCodeSignedFiles = $assemblies + (Get-ChildItem -File -Recurse -Path (Join-Path ($rootDir) ".\build\packaging") | Where-Object {$_.Name -match ".ps1$" -or $_.Name -match ".psm1$"})
foreach($item in $authentiCodeSignedFiles) {
    Write-Host (" Authenticode signing " + $item.FullName)
    Set-AuthenticodeSignature -FilePath $item.FullName -Certificate $cert -TimestampServer $url -WarningAction Stop | Out-Null
}
