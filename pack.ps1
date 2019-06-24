$defaultVersion="1.0.0"
function ZipCurrentModule
{
    Param ([String]$moduleName)
    Robocopy.exe $defaultVersion\ $version\ /S
    ((Get-Content -Path module.config -Raw) -Replace $defaultVersion, $version ) | Set-Content -Path module.config
    7z a "$moduleName.zip" $version Views module.config
    git checkout module.config
    Remove-Item $version -Force -Recurse
}

msbuild /p:Configuration=Release
npm run build --prefix ./src/ui

$fullVersion=[System.Reflection.Assembly]::LoadFrom("src\alloy\bin\EPiServer.Labs.BlockEnhancements.dll").GetName().Version
$version="$($fullVersion.major).$($fullVersion.minor).$($fullVersion.build)"
Write-Host "Creating nuget with $version version"

Set-Location src\alloy\modules\_protected\episerver-labs-block-enhancements
ZipCurrentModule -moduleName episerver-labs-block-enhancements

Set-Location ..\..\..\
nuget pack EPiServer.Labs.BlockEnhancements.nuspec -Version $version
Set-Location ..\..\
Move-Item src\alloy\EPiServer.Labs.BlockEnhancements.$version.nupkg EPiServer.Labs.BlockEnhancements.$version.nupkg -Force
