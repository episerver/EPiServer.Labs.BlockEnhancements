@ECHO OFF
SETLOCAL

SET PATH=.\.ci\tools\;.\build\tools\;%PATH%

REM Ensure all the node modules are installed.
CALL yarn install
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

REM Run the setup task.
CALL yarn gulp setup
IF %errorlevel% NEQ 0 EXIT /B %errorlevel%

SET AlloyMVC=src\AlloyMvcTemplates

IF EXIST %AlloyMVC%\App_Data (
    ECHO Remove all files from the app data folder
    DEL %AlloyMVC%\App_Data\*.* /F /Q || Exit /B 1
) ELSE (
    MKDIR %AlloyMVC%\App_Data || Exit /B 1
)

REM Copy the database files to the site.
XCOPY /y/i build\Database\DefaultSiteContent.episerverdata %AlloyMVC%\App_Data\ || Exit /B 1
XCOPY /y/i/k build\database\Alloy.mdf %AlloyMVC%\App_Data\ || Exit /B 1

EXIT /B %ERRORLEVEL%
