@echo off
chcp 65001 >nul 2>&1
title App Portugais

echo ========================================
echo   App Portugais Europeen - Lancement
echo ========================================
echo.

REM --- Node.js ---
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js non trouve.
    echo Telechargez-le sur https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js %%v

REM --- Ollama ---
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo [ATTENTION] Ollama non installe - fonctions IA desactivees.
    echo.
) else (
    echo [OK] Ollama detecte
    start /min "" ollama serve
    timeout /t 3 /nobreak >nul

    ollama list 2>nul | findstr /i "llama3" >nul
    if %errorlevel% neq 0 (
        echo Telechargement llama3...
        ollama pull llama3
    ) else (
        echo [OK] llama3 present
    )

    ollama list 2>nul | findstr /i "mistral" >nul
    if %errorlevel% neq 0 (
        echo Telechargement mistral...
        ollama pull mistral
    ) else (
        echo [OK] mistral present
    )

    ollama list 2>nul | findstr /i "command-r" >nul
    if %errorlevel% neq 0 (
        echo Telechargement command-r (environ 4 Go)...
        ollama pull command-r
    ) else (
        echo [OK] command-r present
    )
)

echo.
echo ========================================
echo   Dependances npm
echo ========================================

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installation des packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERREUR] npm install a echoue.
        pause
        exit /b 1
    )
) else (
    echo [OK] node_modules present
)

echo.
echo ========================================
echo   Base de donnees
echo ========================================

if not exist "portugais.db" (
    echo Creation de la base de donnees...
    call npx drizzle-kit push --config=drizzle.config.ts
    echo Remplissage du curriculum...
    call npx tsx src/scripts/seed.ts
) else (
    echo [OK] Base de donnees presente
)

echo.
echo ========================================
echo   Lancement du serveur
echo ========================================
echo.
echo Adresse : http://localhost:3000
echo Appuyez sur Ctrl+C pour arreter.
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

call npm run dev
