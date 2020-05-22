$defaultVersion="1.0.0"
$workingDirectory = Get-Location
$zip = "$workingDirectory\packages\7-Zip.CommandLine.18.1.0\tools\7za.exe"
$nuget = "$workingDirectory\build\tools\nuget.exe"

function ZipCurrentModule
{
    Param ([String]$moduleName)
    Robocopy.exe $defaultVersion\ $version\ /S
    Remove-Item "$moduleName.zip" -Force -Recurse -ErrorAction Ignore
    ((Get-Content -Path module.config -Raw).TrimEnd() -Replace $defaultVersion, $version ) | Set-Content -Path module.config
    Start-Process -NoNewWindow -Wait -FilePath $zip -ArgumentList "a", "$moduleName.zip", "$version", "module.config"
    ((Get-Content -Path module.config -Raw).TrimEnd() -Replace $version, $defaultVersion ) | Set-Content -Path module.config
    Remove-Item $version -Force -Recurse
}

$assemblyVersionFile = "version.cs"

$versionMatch = (Select-String -Path $assemblyVersionFile -Pattern 'AssemblyVersion[^\d]*([\d+.]+)').Matches[0]
$fileVersionMatch = (Select-String -Path $assemblyVersionFile -Pattern 'AssemblyInformationalVersion[^\d]*(.+)"').Matches[0]
$version = $versionMatch.Groups[1].Value
$assemblyFileVersion = $fileVersionMatch.Groups[1].Value

if (!$version) {
    Write-Error "Failed to parse version information"
    exit 1
}

Write-Host "Creating nuget with $fileVersionMatch version and $version client assets version"

Set-Location src\AlloyMvcTemplates\modules\_protected\episerver-labs-block-enhancements
ZipCurrentModule -moduleName episerver-labs-block-enhancements
Set-Location $workingDirectory
Start-Process -NoNewWindow -Wait -FilePath $nuget -ArgumentList "pack", "$workingDirectory\build\packaging\EPiServer.Labs.BlockEnhancements.nuspec", "-Version $assemblyFileVersion", "-Properties configuration=Release", "-BasePath ./", "-Verbosity detailed"
