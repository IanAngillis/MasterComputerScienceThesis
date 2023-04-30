CD .\..\..\eval\
del "mapped_tool_smells.txt"
del "mapped-hadolint-smells.txt"
CD .\..\Dinghy-main\Dinghy-main\
call script.bat
CD .\..\..\tool\
call npm run build && node .\build\tool.js
CD .\scripts
call rep.bat
CD .\..\..\eval\
call node test.js
call node differences.js
CD .\..\tool\scripts

:: RUN Hadolint on files
:: RUN eval code to generate mapped-hadolint-smell
:: RUN differences generation