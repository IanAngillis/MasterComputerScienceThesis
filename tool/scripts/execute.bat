CD .\..\..\Dinghy-main\Dinghy-main\
call script.bat
CD .\..\..\tool\
call npm run build && node .\build\tool.js
CD .\scripts