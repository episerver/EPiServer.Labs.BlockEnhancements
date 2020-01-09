powershell ./pack.ps1
powershell ./pack-alloy.ps1
REM Tell TeamCity to publish the artifacts even though the entire build isn't done
ECHO ##teamcity[publishArtifacts '*.nupkg']