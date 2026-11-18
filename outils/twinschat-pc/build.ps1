# Compile l'installateur Windows de TwinsChat vers public/telechargements/TwinsChat-Setup.exe.
# Utilise le compilateur C# livré avec Windows (.NET Framework 4) : rien à installer.
#   powershell -ExecutionPolicy Bypass -File outils/twinschat-pc/build.ps1

$ErrorActionPreference = "Stop"
$ici = $PSScriptRoot
$sortie = Join-Path $ici "..\..\public\telechargements"
$csc = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"

New-Item -ItemType Directory -Force $sortie | Out-Null
& $csc /nologo /codepage:65001 /optimize+ /target:winexe `
  "/win32icon:$(Join-Path $ici 'twinschat.ico')" `
  "/out:$(Join-Path $sortie 'TwinsChat-Setup.exe')" `
  /r:Microsoft.CSharp.dll /r:System.Core.dll /r:System.Windows.Forms.dll `
  (Join-Path $ici "TwinsChat.cs")
if ($LASTEXITCODE -ne 0) { throw "Échec de la compilation ($LASTEXITCODE)" }
Get-Item (Join-Path $sortie "TwinsChat-Setup.exe") | Select-Object Name, Length
