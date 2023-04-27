@echo off
set "source_directory=D:\Workspaces\MasterComputerScienceThesis\data\dockerfiles"
set "destination_directory=D:\Workspaces\MasterComputerScienceThesis\tool\rep"

for %%i in ("%source_directory%\*.*") do (
    echo Running hadolint on "%%i"...
    hadolint --ignore DL3004 "%%i" > "%destination_directory%\%%~ni.txt"
    echo Finished processing "%%i".
)

echo All files processed.