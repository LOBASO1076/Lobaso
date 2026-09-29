# Sea System ERP / SFP-OS — Runbook de backup, restore e rollback

## Objetivo e limite desta versão

Este documento define o procedimento exigido antes de operar dados comerciais. Nenhum backup real, restore ou rollback foi executado neste preview porque não há ainda destino de storage, credenciais de operador ou ambiente de staging autorizado. O objetivo é garantir que o banco gerenciado seja exportável e recuperável sem VPS, disco local persistente ou dependência de um único provedor.

## Pré-requisitos de ativação

O operador deve provisionar storage gerenciado com retenção, acesso mínimo necessário e versionamento. O acesso ao banco deve ser server-side ou via runner controlado; segredos nunca entram em Git, frontend, HTML ou histórico de shell compartilhado. É necessário um ambiente de restauração isolado, diferente da produção, e uma janela definida de retenção e objetivo de recuperação.

| Controle | Critério de aceite |
|---|---|
| Exportação | Dump lógico ou snapshot consistente do banco, incluindo schema e dados. |
| Integridade | SHA-256 do artefato gravado ao lado do backup. |
| Proteção | Bucket/objeto privado, criptografado e versionado; acesso limitado ao operador. |
| Retenção | Política documentada por data, classe e prazo. |
| Restore | Restauração em banco isolado e comparação de tabelas, contagens e checksums. |
| Rollback | Checkpoint WebDev e plano de aplicação/DB com critério explícito de reversão. |

## Rotina recomendada

O job gerenciado deve produzir um artefato de backup, enviar para storage, registrar checksum, tamanho, timestamp, versão do schema e resultado em auditoria. Não usar `setInterval`, cron local, processo residente ou VPS. A execução deve ser idempotente por chave de data/hora e falhar de forma observável, sem apagar o backup anterior.

Uma vez por período de retenção, disparar o restore em staging isolado. Confirmar: presença das tabelas, schema esperado, contagem de `tenants`, `products`, `customers`, `orders`, `orderItems`, `payments`, `deliveries`, `outboxEvents` e `auditEvents`; verificação de checksum; execução de uma query de leitura por tenant; e impossibilidade de acessar tenant A como tenant B. Registrar a evidência do teste e a duração.

## Procedimento de incidente

Em suspeita de corrupção ou perda, interromper integrações externas e colocar o tenant em modo de manutenção. Preservar logs, checkpoints e artefatos de backup. Restaurar primeiro em ambiente isolado e validar integridade; só então decidir a reversão no ambiente alvo. Se o problema for somente aplicação, usar o checkpoint WebDev anterior. Se envolver schema, aplicar uma migration reversível ou restaurar o snapshot de banco compatível; nunca apagar tabelas como primeiro passo.

## Critério de saída

Este runbook só pode ser marcado como verificado depois de um backup real, checksum conferido, restore isolado aprovado e rollback documentado com timestamps, responsável e resultado. Até então, o estado do projeto é **preparado, não verificado**.
