@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;.\build\tools\;%PATH%

CALL yarn --cwd src/episerver-cms-telemetry build
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

EXIT /B %errorlevel%
