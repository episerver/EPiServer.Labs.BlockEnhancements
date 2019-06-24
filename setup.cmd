@ECHO OFF

SET AlloyMVC=src\alloy

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
