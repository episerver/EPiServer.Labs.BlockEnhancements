@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;%PATH%

REM Set Release or Debug configuration.
IF "%1"=="Release" (set CONFIGURATION=Release) ELSE (set CONFIGURATION=Debug)
ECHO Testing in %CONFIGURATION%

REM Run karma tests
CALL yarn karma
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

EXIT /B %ERRORLEVEL%
