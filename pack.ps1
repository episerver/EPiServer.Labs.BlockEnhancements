$defaultVersion="1.0.0"
$workingDirectory = Get-Location
$zip = "$workingDirectory\packages\7-Zip.CommandLine.18.1.0\tools\7za.exe"
$nuget = "$workingDirectory\build\tools\nuget.exe"

function ZipCurrentModule
{
    Param ([String]$moduleName)
    Robocopy.exe $defaultVersion\ $version\ /S
    ((Get-Content -Path module.config -Raw) -Replace $defaultVersion, $version ) | Set-Content -Path module.config    
    Start-Process -NoNewWindow -Wait -FilePath $zip -ArgumentList "a", "$moduleName.zip", "$version", "module.config"
    ((Get-Content -Path module.config -Raw) -Replace $version, $defaultVersion ) | Set-Content -Path module.config
    Remove-Item $version -Force -Recurse
}

$fullVersion=[System.Reflection.Assembly]::LoadFrom("src\alloy\bin\EPiServer.Labs.BlockEnhancements.dll").GetName().Version
$version="$($fullVersion.major).$($fullVersion.minor).$($fullVersion.build)"
Write-Host "Creating nuget with $version version"

Set-Location src\alloy\modules\_protected\episerver-labs-block-enhancements
ZipCurrentModule -moduleName episerver-labs-block-enhancements
Set-Location $workingDirectory
Start-Process -NoNewWindow -Wait -FilePath $nuget -ArgumentList "pack", "$workingDirectory\src\alloy\EPiServer.Labs.BlockEnhancements.nuspec", "-Version $version"
