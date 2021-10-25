@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;.\build\tools\;%PATH%

msbuild /p:Configuration=Release
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

yarn --cwd src/EPiServer.Labs.BlockEnhancements/React build
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

EXIT /B %ERRORLEVEL%