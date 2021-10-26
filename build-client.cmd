@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;%PATH%

CALL yarn --cwd src/EPiServer.Labs.BlockEnhancements/React build
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

EXIT /B %ERRORLEVEL%