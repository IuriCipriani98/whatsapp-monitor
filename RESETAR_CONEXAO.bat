@echo off
cd /d "%~dp0"
echo Isso vai desconectar o WhatsApp atual e pedir novo QR.
echo.
set /p confirm=Tem certeza? (s/n): 
if /i "%confirm%" neq "s" exit

taskkill /f /im node.exe >nul 2>&1

:: Descobre pasta de dados e apaga auth
for /f "tokens=*" %%i in ('node -e "const os=require('os');console.log('C:\\\\Users\\\\'+os.userInfo().username+'\\\\WhatsAppMonitor\\\\wwebjs_auth')"') do set AUTH=%%i

if exist "%AUTH%" (
    rmdir /s /q "%AUTH%"
    echo Sessao removida. Rode INICIAR.bat para escanear novo QR.
) else (
    echo Pasta de sessao nao encontrada: %AUTH%
)
pause
