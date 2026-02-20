# WhatsApp Monitor

Dashboard pessoal para monitorar mensagens diretas e menções em grupos do WhatsApp, com board de task com o intuito de aumentar a produtividade.



## Instalação

1- No arquivo monitor.js alterar os campos SEU_CELULAR, SEU_NOMES ou APELIDOS
1. Rodar `INSTALAR.bat` 
2. Rodar `INICIAR.bat`
3. Escanear o QRCode
4. Abrir o `dashboard.html` no navegador




```js


Para fazer backup das suas tasks, copie o `whatsapp_data.json`.

---

## Problemas comuns

**"node não é reconhecido"**
→ Node.js não instalado. Baixe em nodejs.org e instale.

**QR não aparece / erro de browser já rodando**
→ Feche todos os processos node: `taskkill /f /im node.exe` no CMD, depois rode `INICIAR.bat` novamente.

**Dashboard não carrega dados**
→ Certifique-se que o `INICIAR.bat` está rodando (não feche o terminal).

**Mensagens não aparecem**
→ O monitor captura apenas mensagens novas (após iniciar). Use o botão `↻ varrer` para buscar mensagens não lidas das últimas 24h.
