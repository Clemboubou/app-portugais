@echo off
title Debug App Portugais

set LOGFILE=debug.log
echo === Demarrage debug === > %LOGFILE%

echo === Test echo >> %LOGFILE%
echo ========================================
echo   DEBUG - App Portugais
echo ========================================
echo.

echo === Check Node.js >> %LOGFILE%
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js non trouve. >> %LOGFILE%
    echo [ERREUR] Node.js non trouve.
    pause
    exit /b 1
)
echo === Node.js OK >> %LOGFILE%
node --version

echo === Check Ollama >> %LOGFILE%
ollama --version >nul 2>&1
if errorlevel 1 (
    echo [ATTENTION] Ollama non installe >> %LOGFILE%
    echo [ATTENTION] Ollama non installe - fonctions IA desactivees.
) else (
    echo === Ollama OK >> %LOGFILE%
    echo [OK] Ollama detecte
)

echo === Check dossier >> %LOGFILE%
cd /d "%~dp0"
echo === Dossier: %cd% >> %LOGFILE%

echo === Check node_modules >> %LOGFILE%
if not exist "node_modules\" (
    echo === npm install requis >> %LOGFILE%
    echo Installation des packages...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] npm install a echoue. >> %LOGFILE%
        echo [ERREUR] npm install a echoue.
        pause
        exit /b 1
    )
    echo === npm install OK >> %LOGFILE%
) else (
    echo === node_modules present >> %LOGFILE%
    echo [OK] node_modules present
)

echo === Check base de donnees >> %LOGFILE%
if not exist "portugais.db" (
    echo === Creation BDD... >> %LOGFILE%
    echo Creation de la base de donnees...
    call npx drizzle-kit push --config=drizzle.config.ts
    if errorlevel 1 (
        echo [ERREUR] drizzle-kit push a echoue. >> %LOGFILE%
        echo [ERREUR] drizzle-kit push a echoue.
        pause
        exit /b 1
    )
    echo === Seed... >> %LOGFILE%
    echo Remplissage du curriculum...
    call npx tsx src/scripts/seed.ts
    if errorlevel 1 (
        echo [ERREUR] seed a echoue. >> %LOGFILE%
        echo [ERREUR] seed a echoue.
        pause
        exit /b 1
    )
    echo === BDD creee >> %LOGFILE%
) else (
    echo === BDD presente >> %LOGFILE%
    echo [OK] Base de donnees presente
)

echo === Lancement serveur >> %LOGFILE%
echo.
echo ========================================
echo   Lancement du serveur
echo ========================================
echo Adresse : http://localhost:3000
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

echo === npm run dev >> %LOGFILE%
call npm run dev

echo === Fin >> %LOGFILE%
