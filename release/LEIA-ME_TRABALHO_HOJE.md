# Seafoods Premium V8 — trabalho local de hoje

Esta cópia parte da evolução V8 existente e é apenas para demonstração/revisão local. A V7 publicada permanece separada e não foi alterada. Não publique este pacote por cima da V7.

## Abrir no Windows

1. Extraia o ZIP para uma pasta simples, por exemplo `C:\Seafoods\V8-Trabalho-Hoje`.
2. Instale Node.js 22 LTS, caso ainda não esteja instalado. Abra PowerShell na pasta extraída.
3. Execute:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\release\INICIAR_DEMO_LOCAL.ps1
```

4. Quando o terminal disser `Server running`, abra o endereço mostrado (normalmente `http://localhost:3000/`). Deixe o PowerShell aberto enquanto usa a demo. Para parar, pressione `Ctrl+C`.

O script instala exatamente pnpm 10.4.1 e usa `pnpm install --frozen-lockfile`. O lockfile foi corrigido sem atualizar as versões de dependências.

## O que há nesta cópia

- Vitrine/checkout demo existentes, catálogo de teste, Seafood Boil e adicionais conhecidos.
- Painel protegido de reconciliação para referências do catálogo; registros de referência ficam bloqueados até validação e aprovação comercial.
- Fluxos e painéis administrativos presentes no código desta cópia, sujeitos à configuração e às credenciais da instância.

## Limites para uso operacional

Sem ambiente privado configurado, esta execução não deve ser usada para aceitar pedidos reais como se persistissem no sistema. Ela não cobra Pix/cartão, não confirma sinal de 50%, não recebe pedidos automaticamente do WhatsApp/Instagram e não solicita corridas à Uber/99. Integrações e operações reais permanecem desligadas/não verificadas nesta cópia. Não insira dados sensíveis nem credenciais neste pacote.

## Verificações registradas

- `corepack pnpm@10.4.1 install --frozen-lockfile --force`: aprovado.
- `corepack pnpm@10.4.1 check`: aprovado.
- `corepack pnpm@10.4.1 build`: aprovado, com aviso de bundle grande.
- Testes: 64 aprovados e 4 falhas conhecidas, detalhadas no Livro Mestre e no relatório de checkpoint.

## Evidência do deployment recebido em 29/09

A URL Vercel observada fica em skeleton e `/api/trpc/auth.me` retorna `500 FUNCTION_INVOCATION_FAILED`. Portanto, o build instalado nessa URL ainda não está funcionalmente saudável. Este ZIP é uma cópia de trabalho local e relatório; **não reenvie para a Vercel ainda**. A causa do 500 requer a mensagem dos Runtime Logs autenticados do projeto. Leia `release/INCIDENT_VERCEL_API_2026-09-29.md`.
