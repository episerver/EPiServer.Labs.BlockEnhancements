$defaultVersion="1.0.0"
$workingDirectory = Get-Location
$nuget = "$workingDirectory\build\tools\nuget.exe"

$assemblyVersionFile = "version.cs"

$versionMatch = (Select-String -Path $assemblyVersionFile -Pattern 'AssemblyVersion[^\d]*([\d+.]+)').Matches[0]
$fileVersionMatch = (Select-String -Path $assemblyVersionFile -Pattern 'AssemblyInformationalVersion[^\d]*(.+)"').Matches[0]
$version = $versionMatch.Groups[1].Value
$assemblyFileVersion = $fileVersionMatch.Groups[1].Value

if (!$version) {
    Write-Error "Failed to parse version information"
    exit 1
}

Write-Host "Creating Alloy nuget with $fileVersionMatch version and $version client assets version"

Set-Location $workingDirectory
Start-Process -NoNewWindow -Wait -FilePath $nuget -ArgumentList "pack", "$workingDirectory\build\packaging\Alloy.Sample.BlockEnhancements.nuspec", "-Version $assemblyFileVersion", "-Properties configuration=Release", "-BasePath ./", "-Verbosity detailed"
