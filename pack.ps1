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

#cleanup all by dtk folder which is used by tests
Get-ChildItem -Path out\ -Exclude dtk | Remove-Item -Recurse -Force

#copy assets and views
Copy-Item -Path src\EPiServer.Labs.BlockEnhancements\ClientResources\ -Destination out\$version\ClientResources -recurse -Force
Copy-Item src\EPiServer.Labs.BlockEnhancements\module.config out\
Copy-Item -Path src\EPiServer.Labs.BlockEnhancements\Views -Destination out\ -recurse -Force

#include version in module.config
((Get-Content -Path out\module.config -Raw).TrimEnd() -Replace '=""', "=`"$version`"" ) | Set-Content -Path out\module.config

#create zip file
Set-Location $workingDirectory\out
Start-Process -NoNewWindow -Wait -FilePath $zip -ArgumentList "a", "episerver-labs-block-enhancements.zip", "$version", "module.config", "Views"

Set-Location $workingDirectory
Start-Process -NoNewWindow -Wait -FilePath $nuget -ArgumentList "pack", "$workingDirectory\build\packaging\EPiServer.Labs.BlockEnhancements.nuspec", "-Version $assemblyFileVersion", "-Properties configuration=Release", "-BasePath ./", "-Verbosity detailed"
