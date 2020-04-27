@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;.\build\tools\;%PATH%

msbuild /p:Configuration=Release

