# WhatsApp Monitor

Dashboard pessoal para monitorar mensagens diretas e menções em grupos do WhatsApp, com board de tasks estilo Trello.

---

## Requisitos

- Windows 10 ou 11
- [Node.js LTS](https://nodejs.org) — versão 18 ou superior

---

## Instalação

1. Extraia a pasta em qualquer lugar do seu computador
2. Rode `INSTALAR.bat` (instala as dependências, ~2 minutos)
3. Rode `INICIAR.bat`
4. Escaneie o QR Code que aparecer no terminal com seu celular
   - WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho
5. Abra o `dashboard.html` no navegador

---

## Como usar

| Coluna | O que aparece |
|--------|--------------|
| **Inbox** | Última mensagem de cada conversa direta |
| **Menções** | Mensagens de grupos onde te mencionaram |
| **Tasks** | Board Trello — você arrasta da col 1 ou 2 para cá |

- **Arrastar** um card do Inbox ou Menções para Tasks abre um modal para definir título, descrição e prioridade
- **Tasks** têm 3 status: A fazer → Em andamento → Feito
- **Itens excluídos** não voltam mesmo após varredura
- **Dados salvos** em `C:\Users\[usuario]\WhatsAppMonitor\whatsapp_data.json`

---

## ⚙️ Configurar para outro usuário

Abra o arquivo `monitor.js` em qualquer editor de texto (Bloco de Notas, VS Code, etc).

No topo do arquivo, altere as 3 linhas na seção de configuração:

```js
// ── SEU NÚMERO (com código do país, sem + e sem espaços)
const SEU_NUMERO = '';
//                  ↑ substitua pelo seu número
//                  Ex: Brasil 11 98888-7777 → '5511988887777'

// ── SEUS NOMES (como as pessoas te chamam nos grupos)
const SEUS_NOMES = ['', ''];
//                  ↑ substitua pelos seus nomes/apelidos
//                  Ex: ['joão', 'jo', 'joao']
//                  Sempre em minúsculo

// ── PASTA onde os dados ficam salvos (opcional alterar)
const PASTA_DADOS = `C:\\Users\\${require('os').userInfo().username}\\WhatsAppMonitor`;
//                  ↑ por padrão usa C:\Users\[seu_usuario]\WhatsAppMonitor
//                  Para mudar: const PASTA_DADOS = 'C:\\MinhaPasta\\Monitor';
```

Salve o arquivo e rode `INICIAR.bat`.

---

## Trocar o número conectado

1. Rode `RESETAR_CONEXAO.bat`
2. Rode `INICIAR.bat`
3. Escaneie o novo QR com o número correto

---

## Iniciar automaticamente com o Windows

1. Pressione `Win + R`, digite `shell:startup`, Enter
2. Copie o arquivo `INICIAR.bat` para essa pasta
3. Pronto — o monitor vai iniciar junto com o Windows

---

## Onde ficam os dados

```
C:\Users\[usuario]\WhatsAppMonitor\
├── whatsapp_data.json   ← tasks, inbox, menções (backup este arquivo)
└── wwebjs_auth\         ← sessão do WhatsApp (não deletar)
```

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
