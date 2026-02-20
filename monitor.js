/**
 * ╔══════════════════════════════════════════════════════╗
 * ║           WHATSAPP MONITOR — monitor.js              ║
 * ╠══════════════════════════════════════════════════════╣
 * ║  CONFIGURAÇÃO — altere apenas esta seção             ║
 * ╚══════════════════════════════════════════════════════╝
 */

// ── SEU NÚMERO (com código do país, sem + e sem espaços)
const SEU_NUMERO = '';

// ── SEUS NOMES (como as pessoas te chamam nos grupos)
//    Coloque tudo em minúsculo
const SEUS_NOMES = ['', ''];

// ── PASTA onde os dados ficam salvos
//    Troque para qualquer caminho que preferir
const PASTA_DADOS = `C:\\Users\\${require('os').userInfo().username}\\WhatsAppMonitor`;

// ── PORTA da API (não precisa mudar)
const API_PORT = 5000;

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  NÃO ALTERE ABAIXO DESTA LINHA                       ║
 * ╚══════════════════════════════════════════════════════╝
 */
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode  = require('qrcode-terminal');
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const os      = require('os');

const DATA_FILE = path.join(PASTA_DADOS, 'whatsapp_data.json');
const AUTH_DIR  = path.join(PASTA_DADOS, 'wwebjs_auth');

// Cria pasta de dados se não existir
if (!fs.existsSync(PASTA_DADOS)) fs.mkdirSync(PASTA_DADOS, { recursive: true });
console.log(`Dados salvos em: ${PASTA_DADOS}`);

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch {}
  }
  return { inbox: {}, mentions: [], tasks: [], deleted: {} };
}
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), 'utf8'); }

let connected = false;

function nowTime() { return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
function genId()   { return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }

async function processMsg(msg, chat) {
  try {
    if (msg.fromMe) return;
    const text    = (msg.body||'').trim();
    if (!text || text.length < 2) return;

    const chatId  = String(chat.id._serialized || chat.id);
    const isGroup = chat.isGroup;
    const name    = chat.name || (isGroup ? 'Grupo' : 'Contato');
    const sender  = msg._data?.notifyName || name;

    const d = loadData();

    // COL 1 — INBOX: mensagens diretas novas
    if (!isGroup) {
      if (!(d.deleted||{})['inbox_'+chatId]) {
        const prev = d.inbox[chatId] || {};
        d.inbox[chatId] = {
          chatId, name, sender,
          message: text,
          timestamp: nowTime(),
          unread: (prev.unread||0)+1,
        };
        saveData(d);
        console.log(`  [D] ${name}: ${text.slice(0,70)}`);
      }
      return;
    }

    // COL 2 — MENÇÕES: grupos onde te mencionam
    if (isGroup) {
      const t = text.toLowerCase();
      const byAt   = (msg.mentionedIds||[]).some(id => (id._serialized||id) === `${SEU_NUMERO}@c.us`);
      const byName = SEUS_NOMES.some(n => t.includes(n.toLowerCase()));
      if (!byAt && !byName) return;

      let hash = 0;
      for (let i = 0; i < text.length; i++) hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
      const mId = `m_${chatId}_${Math.abs(hash).toString(36)}`;

      if ((d.deleted||{})[mId]) return;
      if ((d.mentions||[]).find(m => m.id === mId)) return;

      d.mentions = d.mentions||[];
      d.mentions.push({ id: mId, chatId, group: name, sender, message: text, timestamp: nowTime() });
      saveData(d);
      console.log(`  [G] ${name}: ${text.slice(0,70)}`);
    }
  } catch(e) {}
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
  puppeteer: { headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] },
});

client.on('qr', qr => {
  console.log('\n══════════════════════════════════════');
  console.log('  Escaneie o QR com seu celular:');
  console.log('══════════════════════════════════════\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  connected = true;
  console.log('\n✓ WhatsApp conectado! Monitorando...\n');
});

client.on('disconnected', () => {
  connected = false;
  console.log('WhatsApp desconectado.');
});

client.on('message', async msg => {
  const chat = await msg.getChat().catch(()=>null);
  if (chat) await processMsg(msg, chat);
});

client.initialize();

// ── API ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/inbox', (req, res) => {
  const d = loadData();
  res.json(Object.values(d.inbox||{})
    .filter(i => !(d.deleted||{})['inbox_'+i.chatId])
    .sort((a,b)=>(b.timestamp||'').localeCompare(a.timestamp||'')));
});
app.delete('/api/inbox/:chatId', (req, res) => {
  const d = loadData();
  const id = decodeURIComponent(req.params.chatId);
  delete d.inbox[id];
  d.deleted['inbox_'+id] = true;
  saveData(d); res.json({ok:true});
});

app.get('/api/mentions', (req, res) => {
  const d = loadData();
  res.json((d.mentions||[]).filter(m => !(d.deleted||{})[m.id]));
});
app.delete('/api/mentions/:id', (req, res) => {
  const d = loadData();
  d.mentions = (d.mentions||[]).filter(m => m.id !== req.params.id);
  d.deleted[req.params.id] = true;
  saveData(d); res.json({ok:true});
});

app.get('/api/tasks', (req, res) => {
  const d = loadData();
  res.json((d.tasks||[]).filter(t => !(d.deleted||{})[t.id]));
});
app.post('/api/tasks', (req, res) => {
  const d = loadData();
  const t = {
    id: genId(),
    title:       req.body.title||'Sem título',
    description: req.body.description||'',
    source:      req.body.source||'',
    sourceMsg:   req.body.sourceMsg||'',
    status:      'todo',
    priority:    req.body.priority||'medium',
    createdAt:   new Date().toISOString(),
  };
  d.tasks = d.tasks||[];
  d.tasks.push(t); saveData(d); res.json(t);
});
app.patch('/api/tasks/:id', (req, res) => {
  const d = loadData();
  const t = (d.tasks||[]).find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({error:'not found'});
  Object.assign(t, req.body); saveData(d); res.json(t);
});
app.delete('/api/tasks/:id', (req, res) => {
  const d = loadData();
  d.tasks = (d.tasks||[]).filter(t => t.id !== req.params.id);
  d.deleted[req.params.id] = true;
  saveData(d); res.json({ok:true});
});

app.get('/api/status', (req, res) => {
  res.json({ connected, last_scan_fmt: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) });
});

app.post('/api/scan', async (req, res) => {
  if (!connected) return res.status(400).json({error:'desconectado'});
  res.json({ok:true});
  try {
    const chats  = await client.getChats();
    const cutoff = Date.now() - 24*60*60*1000;
    for (const chat of chats.filter(c=>c.unreadCount>0)) {
      const msgs = await chat.fetchMessages({limit:5});
      for (const msg of msgs) {
        if ((msg.timestamp*1000) < cutoff) continue;
        await processMsg(msg, chat);
      }
    }
    console.log('Varredura manual concluída.');
  } catch(e) {}
});

app.listen(API_PORT, () => console.log(`API em http://localhost:${API_PORT}`));
