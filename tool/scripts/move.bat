@echo off
setlocal EnableDelayedExpansion

set "source_directory=D:\Workspaces\MasterComputerScienceThesis\data\binnacle\github\deduplicated-sources"
set "destination_directory=D:\Workspaces\MasterComputerScienceThesis\data\chrashedfiles"

for /f "tokens=*" %%a in (error_files.txt) do (
  set "filename=%%a"
  echo Processing !filename!
  if exist "%source_directory%\!filename!" (
    echo Copying !filename! to %destination_directory%
    copy "%source_directory%\!filename!" "%destination_directory%"
  ) else (
    echo !filename! not found in %source_directory%
  )
)

echo Done.