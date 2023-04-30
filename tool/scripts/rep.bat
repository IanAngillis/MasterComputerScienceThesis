@echo off
set "prev_dir=%CD%"
CD .\..\..\data\dockerfiles
set "source_directory=%CD%"
CD .\..\..\tool\rep
set "destination_directory=%CD%"

echo %source_directory%

for %%i in ("%source_directory%\*.*") do (
    echo Running hadolint on "%%i"...
    hadolint "%%i" > "%destination_directory%\%%~ni.txt"
    echo Finished processing "%%i".
)

echo All files processed.
CD %prev_dir%

:: use CD to maybe build source directory for different system
