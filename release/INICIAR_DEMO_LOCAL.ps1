$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host 'Seafoods Premium V8 — inicialização local para demonstração/revisão' -ForegroundColor Cyan
Write-Host 'Este ambiente não processa pagamento real nem integra WhatsApp, Meta, Uber ou 99.' -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js não encontrado. Instale Node.js 22 LTS e abra uma nova janela do PowerShell.'
}

$nodeVersion = (node --version).Trim()
if ($nodeVersion -notmatch '^v22\.') {
  Write-Warning "O projeto declara Node 22.x; versão detectada: $nodeVersion. O teste desta cópia foi feito com Node 24.19.0."
}

corepack pnpm@10.4.1 install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'A instalação congelada falhou; consulte a saída acima.' }

Write-Host 'Abrindo servidor local em http://localhost:3000/ — mantenha esta janela aberta.' -ForegroundColor Green
corepack pnpm@10.4.1 dev
if ($LASTEXITCODE -ne 0) { throw 'O servidor local encerrou com erro; consulte a saída acima.' }
