@echo off
cd /d "%~dp0"
echo ================================================
echo   WhatsApp Monitor — Instalacao
echo ================================================
echo.
echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado.
    echo Baixe em: https://nodejs.org  (versao LTS)
    echo Instale e rode este bat novamente.
    pause
    exit
)
echo Node.js OK.
echo.
echo Instalando dependencias...
npm install whatsapp-web.js qrcode-terminal express cors
echo.
echo ================================================
echo   Pronto! Rode INICIAR.bat para comecar.
echo ================================================
pause
