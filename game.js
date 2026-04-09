/* ─── Navegação entre telas de intro ─── */
function goSlide(n) {
  document.querySelectorAll('.intro-slide').forEach(el => el.classList.remove('active-slide'));
  const targets = { 1: 'intro-screen', 2: 'intro-story-screen', 3: 'intro-phases-screen' };
  const el = document.getElementById(targets[n]);
  if (el) el.classList.add('active-slide');
}

/* ═══════════════════════════════════════════
   GAME ENGINE v6 — Escape Room Dinâmico
═══════════════════════════════════════════ */

const SENHAS_FASE = ['7392', '4815', '2067', '9341'];

/* ─── Estado Global ─── */
let phase              = 0;
let qIdx               = 0;
let tries              = 6;
let totalErrors        = 0;
let inventory          = [];
let objsDone           = {};
let objDialogIdx       = {};   // controla qual diálogo de cada objeto foi exibido
let termActive         = false;
let currentQuestaoMode = null;
let questoesDone       = 0;
let startTime          = 0;
let alarmInterval      = null;
let typewriterTimeout  = null;

/* ─── Sons via Web Audio API ─── */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBeep(freq = 440, dur = 0.1, type = 'square', vol = 0.08) {
  try {
    const ctx = getAudio();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch(e) {}
}

function playSuccess() {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => playBeep(f, 0.15, 'sine', 0.1), i * 80));
}

function playError() {
  [200, 150].forEach((f, i) =>
    setTimeout(() => playBeep(f, 0.2, 'sawtooth', 0.08), i * 120));
}

function playAlarmTick() {
  playBeep(880, 0.05, 'square', 0.04);
}

function playDoorUnlock() {
  [392, 494, 587, 698].forEach((f, i) =>
    setTimeout(() => playBeep(f, 0.2, 'triangle', 0.12), i * 100));
}

/* ─── Normalização de respostas ─── */
function norm(s) {
  return s.toLowerCase()
    .replace(/\s/g, '')
    // potências superscript
    .replace(/²/g, '2').replace(/³/g, '3').replace(/⁴/g, '4').replace(/ˣ/g, 'x')
    // traço unicode longo/médio → hífen comum
    .replace(/[−–—]/g, '-')
    // ponto de multiplicação unicode → vazio (xsen = x·sen)
    .replace(/[·•*]/g, '')
    // aspas
    .replace(/['']/g, "'")
    // parênteses opcionais em funções simples: ex = e^x, sen(x) aceito com ou sem ()
    ;
}

/* ─── Inicialização ─── */
function startGame() {
  document.querySelectorAll('.intro-slide').forEach(el => el.classList.remove('active-slide'));
  startTime   = Date.now();
  phase       = 0;
  totalErrors = 0;
  inventory   = [];
  loadPhase();
}

function loadPhase() {
  const f = FASES[phase];
  qIdx         = 0;
  questoesDone = 0;
  tries        = 6;
  objsDone     = {};
  objDialogIdx = {};

  stopAlarm();

  // Remove itens específicos da fase anterior ao avançar
  if (phase > 0) inventory = inventory.filter(i => !['💾', '🪪', '🔦'].includes(i.emoji));

  updateHUD();

  const g = document.getElementById('girotto');
  g.style.left   = f.girotto_start.left;
  g.style.bottom = f.girotto_start.bottom;

  document.getElementById('door-frame').classList.remove('open');
  document.getElementById('door-lock').classList.remove('unlocked');
  document.getElementById('door-key-display').textContent = '🔒 TRANCADA';

  // Aplicar classe de fundo temático
  const canvas = document.getElementById('scene-canvas');
  canvas.className = '';
  if (f.bgClass) canvas.classList.add(f.bgClass);

  // Efeito de apagão na fase 3
  const apagaoEl = document.getElementById('apagao-overlay');
  if (f.apagao) {
    apagaoEl.classList.add('active');
    setTimeout(() => apagaoEl.classList.remove('active'), 2000);
  } else {
    apagaoEl.classList.remove('active');
  }

  renderWall(f);
  renderObjects(f);
  renderTutor(f);
  clearDialog();

  // Mensagem de entrada com efeito de digitação
  const entradaMsg = `Estou preso na <strong>${f.nome}</strong>. Preciso explorar tudo...`;
  addDialog(entradaMsg, 'girotto');
  addDialog(null, 'system', `<span style="color:var(--amber)">⚠ PROTOCOLO <strong>${f.tipo.toUpperCase()}</strong> ATIVADO.</span><br><span style="color:var(--dim);font-size:0.75rem;">${f.ambiencia}</span>`);

  // Alarme visual na fase 2
  if (f.alarme) startAlarm();

  updateInventoryUI();
  updateTriesUI();
  document.getElementById('hud-room').textContent     = f.nome;
  document.getElementById('hud-progress').textContent = `Fase ${f.id}/4`;
  document.getElementById('hud-tipo').textContent     = f.tipo;
}

/* ─── Efeito de Alarme ─── */
function startAlarm() {
  const hud = document.getElementById('hud');
  let tick = 0;
  alarmInterval = setInterval(() => {
    tick++;
    hud.style.borderBottomColor = tick % 2 === 0 ? 'rgba(231,76,60,0.8)' : 'rgba(80,140,255,0.2)';
    document.body.style.boxShadow = tick % 2 === 0
      ? 'inset 0 0 60px rgba(231,76,60,0.08)'
      : 'none';
    if (tick % 4 === 0) playAlarmTick();
  }, 500);
}

function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  const hud = document.getElementById('hud');
  hud.style.borderBottomColor = '';
  document.body.style.boxShadow = '';
}

/* ─── Renderização da Cena ─── */
function renderWall(f) {
  const wd = document.getElementById('wall-detail');
  const details = [
    /* Fase 1 — Sala dos Professores */
    `<div style="position:absolute;top:8%;left:5%;font-size:0.6rem;color:rgba(80,140,255,0.12);letter-spacing:2px;writing-mode:vertical-lr;">CESUPA SECURITY v2.0</div>
     <div style="position:absolute;top:5%;right:8%;width:60px;height:60px;border:1px solid rgba(80,140,255,0.12);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;opacity:0.35;">🎓</div>
     <div style="position:absolute;bottom:25%;left:3%;font-size:2.5rem;opacity:0.06;">∫</div>
     <div style="position:absolute;bottom:28%;right:5%;font-size:1.8rem;opacity:0.08;">+C</div>`,

    /* Fase 2 — Corredor */
    `<div style="position:absolute;top:8%;left:8%;font-size:0.6rem;color:rgba(231,76,60,0.25);line-height:2.2;animation:blink 1s infinite;">🚨 ALARME ATIVO<br>🚨 CONTENÇÃO EM CURSO<br>🚨 SETOR B BLOQUEADO</div>
     <div style="position:absolute;top:5%;right:6%;font-size:0.7rem;color:rgba(80,140,255,0.15);">CORREDOR A → B</div>
     <div style="position:absolute;bottom:26%;left:2%;font-size:2.5rem;opacity:0.05;color:#e74c3c;">u</div>
     <div style="position:absolute;bottom:26%;right:4%;font-size:1.8rem;opacity:0.07;">du</div>`,

    /* Fase 3 — Elevador */
    `<div style="position:absolute;top:6%;right:10%;font-size:0.7rem;color:rgba(80,140,255,0.15);">B1 ▼ TÉRREO</div>
     <div style="position:absolute;top:6%;right:16%;width:1px;height:40px;background:rgba(80,140,255,0.1);"></div>
     <div style="position:absolute;top:12%;left:5%;font-size:0.6rem;color:rgba(255,200,0,0.2);animation:blink 2s infinite;">⚡ PANE — MODO EMERGÊNCIA ⚡</div>
     <div style="position:absolute;bottom:26%;left:3%;font-size:2rem;opacity:0.08;">∫u dv</div>`,

    /* Fase 4 — Portão */
    `<div style="position:absolute;top:5%;left:50%;transform:translateX(-50%);font-size:0.65rem;color:rgba(243,156,18,0.3);letter-spacing:3px;animation:blink 2s infinite;">⚠ PORTÃO PRINCIPAL — ACESSO RESTRITO ⚠</div>
     <div style="position:absolute;bottom:26%;left:3%;font-size:2rem;opacity:0.08;color:var(--gold);">∫ₐᵇ</div>
     <div style="position:absolute;top:15%;right:5%;font-size:0.65rem;color:rgba(243,156,18,0.15);line-height:2;">🌙 CAMPUS EXTERIOR<br>📍 ESTACIONAMENTO</div>`
  ];
  wd.innerHTML = details[phase] || '';
}

function renderObjects(f) {
  const cont = document.getElementById('obj-container');
  cont.innerHTML = '';
  f.objetos.forEach(obj => {
    const div = document.createElement('div');
    div.className  = 'obj';
    div.id         = 'obj-' + obj.id;
    div.style.top  = obj.top;
    div.style.left = obj.left;
    div.style.fontSize = '2.2rem';
    div.innerHTML  = `<span>${obj.emoji}</span><div class="obj-label">${obj.label}</div>`;
    div.onclick    = () => interactObj(obj.id);
    cont.appendChild(div);

    // Pulsar objetos importantes que ainda não foram interagidos
    if (obj.questao === 'all') div.classList.add('pulsing');
  });
}

function renderTutor(f) {
  const tc = document.getElementById('tab-tutor-content');
  tc.innerHTML = `
    <div class="tutor-card">
      <h3>${f.tutorial.titulo}</h3>
      <div style="font-size:0.82rem;color:var(--dim);line-height:1.8;">${f.tutorial.html}</div>
    </div>
    <div class="tutor-card" style="margin-top:0;">
      <h3>⚠️ REGRAS DO SISTEMA</h3>
      <div style="font-size:0.8rem;color:var(--dim);line-height:1.7;">
        ${f.questoes[0].definida
          ? '• Integral <strong style="color:var(--white)">definida</strong>: resultado é um <strong style="color:var(--white)">número</strong>. <span style="color:var(--red)">Sem + C!</span>'
          : '• Integral <strong style="color:var(--white)">indefinida</strong>: sempre inclua <strong style="color:var(--amber)">+ C</strong> na resposta.'
        }<br>
        • Espaços são ignorados: <code style="color:var(--cyan)">x^2+C</code> = <code style="color:var(--cyan)">x^2 + C</code><br>
        • Use <code style="color:var(--cyan)">^</code> para potências: x³ → <code style="color:var(--cyan)">x^3</code>
      </div>
    </div>
    <div class="tutor-card" style="margin-top:0;">
      <h3>∫ TABELA DE INTEGRAIS</h3>
      <div style="font-size:0.75rem;color:var(--dim);line-height:1.0;">
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['1.','∫ du','u + C'],
            ['2.','∫ uⁿ du','uⁿ⁺¹/(n+1) + C'],
            ['3.','∫ du/u','ln|u| + C'],
            ['4.','∫ eᵘ du','eᵘ + C'],
            ['5.','∫ sen u du','−cos u + C'],
            ['6.','∫ cos u du','sen u + C'],
            ['7.','∫ tg u du','ln|sec u| + C'],
            ['8.','∫ sec²u du','tg u + C'],
          ].map(([n,i,r]) => `
            <tr style="border-bottom:1px solid rgba(90,130,176,0.15);">
              <td style="padding:3px 4px;color:rgba(90,130,176,0.6);width:16px;">${n}</td>
              <td style="padding:3px 6px;color:var(--cyan);font-style:italic;min-width:90px;">${i}</td>
              <td style="padding:3px 4px;color:var(--white);">${r}</td>
            </tr>`).join('')}
        </table>
      </div>
    </div>
    <div class="tutor-card" style="margin-top:0;">
      <h3>📐 DERIVADAS ESSENCIAIS</h3>
      <div style="font-size:0.75rem;color:var(--dim);line-height:1.0;">
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['1.','xⁿ','n·xⁿ⁻¹'],
            ['2.','eˣ','eˣ'],
            ['3.','ln x','1/x'],
            ['4.','sen x','cos x'],
            ['5.','cos x','−sen x'],
            ['6.','tg x','sec²x'],
          ].map(([n,f,d]) => `
            <tr style="border-bottom:1px solid rgba(90,130,176,0.15);">
              <td style="padding:3px 4px;color:rgba(90,130,176,0.6);width:16px;">${n}</td>
              <td style="padding:3px 6px;color:var(--cyan);min-width:70px;">y = ${f}</td>
              <td style="padding:3px 4px;color:var(--white);">y' = ${d}</td>
            </tr>`).join('')}
        </table>
      </div>
    </div>`;
}

/* ─── Interação com Objetos ─── */
function interactObj(id) {
  const f   = FASES[phase];
  const obj = f.objetos.find(o => o.id === id);
  if (!obj) return;

  // Se já coletou item não-questão, ignora
  if (objsDone[id] && obj.questao === null && !obj.dica) return;

  moveGirotto(obj.left);
  playBeep(660, 0.08, 'sine', 0.06);

  // Item requer outro item no inventário
  if (obj.requer_item) {
    const temItem = inventory.some(i => i.emoji === obj.requer_item);
    if (!temItem) {
      addDialog(obj.dialog_sem_item || `Preciso de ${obj.requer_item} para usar isso.`);
      showNotif(`⚠ Precisa do ${obj.requer_item} no inventário!`);
      shakeEl('obj-' + id);
      return;
    }
  }

  // Selecionar diálogo rotativo — cada objeto tem uma bolha única no diário (substituída a cada clique)
  const dialogs = obj.dialogs || [obj.dialog];
  const idx = objDialogIdx[id] || 0;
  const msg = dialogs[idx % dialogs.length];
  objDialogIdx[id] = idx + 1;

  if (msg) addDialog(msg, 'girotto', null, 'obj-' + id);

  // Objeto coletável
  if (obj.item && !objsDone[id]) {
    inventory.push({ emoji: obj.item, desc: obj.item_desc });
    updateInventoryUI();
    objsDone[id] = true;
    const el = document.getElementById('obj-' + id);
    el.classList.add('collected');
    // Efeito de brilho ao coletar
    el.style.filter = 'brightness(3) drop-shadow(0 0 20px gold)';
    setTimeout(() => el.classList.contains('collected') && (el.style.filter = ''), 600);
    showNotif(`✨ ${obj.item} coletado!`);
    playBeep(880, 0.2, 'sine', 0.1);
    return;
  }

  // Dica
  if (obj.dica && !objsDone[id]) {
    objsDone[id] = true;
    switchTab('tutor');
    showNotif('💡 Dica registrada na Caderneta!');
    flashPanel('tab-tutor-content');
    return;
  }

  // Questão
  if (obj.questao === 'all') {
    currentQuestaoMode = 'all';
    if (questoesDone >= 3) {
      revelarSenha();
      return;
    }
    qIdx = questoesDone;
    objsDone[id] = true;
    document.getElementById('obj-' + id).classList.remove('pulsing');
    setTimeout(() => openTerminal(), 300);
  }
}

/* ─── Porta ─── */
function interactDoor() {
  if (questoesDone < 3) {
    addDialog(`A porta está trancada. Faltam ${3 - questoesDone} desafio(s) para liberar a senha.`, 'girotto');
    showNotif(`⚠ Resolva ${3 - questoesDone} questão(ões) primeiro!`);
    shakeEl('door-frame');
    playError();
    return;
  }
  openDoorPassword();
}

function openDoorPassword() {
  document.getElementById('door-pw-overlay').classList.add('show');
  document.getElementById('door-pw-input').value = '';
  document.getElementById('door-pw-fb').textContent = '';
  document.getElementById('door-pw-fb').className = 'fb';
  setTimeout(() => document.getElementById('door-pw-input').focus(), 100);
}

function confirmDoorPassword() {
  const input = document.getElementById('door-pw-input').value.trim();
  const fb    = document.getElementById('door-pw-fb');
  const senha = SENHAS_FASE[phase];

  if (input === senha) {
    fb.className  = 'fb ok';
    fb.textContent = '✓ SENHA CORRETA! Porta desbloqueada!';
    playDoorUnlock();
    setTimeout(() => {
      document.getElementById('door-pw-overlay').classList.remove('show');
      unlockDoor();
    }, 1000);
  } else {
    fb.className  = 'fb err';
    fb.textContent = '✗ Senha incorreta. Verifique o Diário — a senha de 4 dígitos foi revelada lá.';
    penalize(1);
    playError();
    const inp = document.getElementById('door-pw-input');
    inp.classList.add('err');
    setTimeout(() => inp.classList.remove('err'), 800);
  }
}

function unlockDoor() {
  document.getElementById('door-lock').classList.add('unlocked');
  document.getElementById('door-key-display').textContent = '🔓 ABERTA';
  stopAlarm();
  setTimeout(() => document.getElementById('door-frame').classList.add('open'), 400);
  setTimeout(() => showPhaseWin(), 900);
}

/* ─── Terminal de Questão ─── */
function openTerminal() {
  const f = FASES[phase];
  const q = f.questoes[qIdx];
  termActive = true;

  document.getElementById('term-title').textContent =
    `PROTOCOLO ${qIdx + 1}/3 — ${f.tipo.toUpperCase()}`;

  document.getElementById('term-contexto').textContent = q.contexto || '';

  document.getElementById('q-counter').textContent = `QUESTÃO ${qIdx + 1} DE 3`;
  document.getElementById('q-text').textContent    = q.q;

  const sw = document.getElementById('steps-wrap');
  sw.innerHTML = '';
  q.passos.forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'step';
    d.id        = 'step-' + i;
    d.innerHTML = `<span class="step-n">0${i + 1}</span>
                   <span class="step-t">${p}</span>
                   <span class="step-ic" id="sic-${i}">→</span>`;
    sw.appendChild(d);
  });

  const qp = document.getElementById('q-progress');
  qp.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('div');
    d.className = 'qp' + (i < questoesDone ? ' done' : i === qIdx ? ' curr' : '');
    qp.appendChild(d);
  }

  const inp = document.getElementById('ans-input');
  inp.value     = '';
  inp.className = 'ans-input';
  inp.disabled  = false;
  inp.placeholder = q.definida ? 'Digite o número (ex: 42)' : 'Ex: x^2 + C';

  document.getElementById('fb').className        = 'fb';
  document.getElementById('btn-confirm').disabled = false;

  // Atualizar HUD de tentativas no terminal
  updateTermTriesUI();

  document.getElementById('terminal-overlay').classList.add('show');
  setTimeout(() => inp.focus(), 100);
}

function closeTerminal() {
  document.getElementById('terminal-overlay').classList.remove('show');
  termActive = false;
}

/* ─── Verificação de Resposta ─── */
function confirm() {
  if (!termActive) return;

  const f   = FASES[phase];
  const q   = f.questoes[qIdx];
  const inp = document.getElementById('ans-input');
  const fb  = document.getElementById('fb');
  const btn = document.getElementById('btn-confirm');
  const raw = inp.value.trim();

  if (!raw) {
    inp.classList.add('err');
    setTimeout(() => inp.classList.remove('err'), 400);
    return;
  }

  const nr = norm(raw);
  const isDefinida = q.definida;

  // Erro pedagógico: +C em definida
  if (isDefinida && nr.includes('+c')) {
    inp.className = 'ans-input err';
    fb.className  = 'fb warn';
    fb.textContent = '⚠ Integral definida retorna um NÚMERO — sem + C! O resultado é a área calculada.';
    playError();
    penalize(2);
    return;
  }

  // Erro pedagógico: faltou +C em indefinida
  if (!isDefinida && !nr.includes('+c')) {
    inp.className = 'ans-input err';
    fb.className  = 'fb warn';
    fb.textContent = '⚠ Faltou o + C! Toda integral indefinida exige a constante de integração.';
    playError();
    penalize(2);
    return;
  }

  const ok = q.resp.some(r => norm(r) === nr);

  if (ok) {
    inp.className = 'ans-input ok';
    fb.className  = 'fb ok';
    fb.textContent = `✓ CORRETO! Gabarito: ${q.gabarito}`;
    btn.disabled   = true;
    playSuccess();

    // Animar passos
    q.passos.forEach((_, i) => setTimeout(() => {
      const s = document.getElementById('step-' + i);
      if (s) {
        s.className = 'step ok';
        document.getElementById('sic-' + i).textContent = '✓';
      }
    }, i * 180));

    questoesDone++;
    addDialog(`✅ Correto! Resposta: <strong>${q.gabarito}</strong>. Fragmento ${questoesDone}/3 coletado.`);
    updateQProgress();

    // Efeito de flash verde
    flashScene('#2ecc71');

    setTimeout(() => {
      closeTerminal();
      if (questoesDone >= 3) {
        revelarSenha();
        FASES[phase].objetos.forEach(obj => {
          if (obj.questao === 'all') {
            const el = document.getElementById('obj-' + obj.id);
            if (el) el.style.opacity = '0.4';
          }
        });
      } else {
        qIdx++;
        setTimeout(() => openTerminal(), 700);
      }
    }, 1800);

  } else {
    inp.className = 'ans-input err';
    fb.className  = 'fb err';
    fb.textContent = '✗ Resposta incorreta. Revise os passos e tente novamente.';
    playError();
    flashScene('#e74c3c');

    const s = document.getElementById('step-1');
    if (s) {
      s.className = 'step err';
      document.getElementById('sic-1').textContent = '✗';
      setTimeout(() => {
        s.className = 'step';
        document.getElementById('sic-1').textContent = '→';
      }, 1500);
    }
    penalize(1);
  }
}

/* ─── Flash de cena ─── */
function flashScene(color) {
  const flash = document.getElementById('scene-flash');
  flash.style.background = color;
  flash.style.opacity = '0.18';
  setTimeout(() => flash.style.opacity = '0', 300);
}

/* ─── Revelar Senha no Diário ─── */
const MSGS_SENHA = [
  '💾 O pen-drive desbloqueou os arquivos! Código de acesso revelado:',
  '🪪 Crachá autenticado — alarmes desativados! Código do corredor liberado:',
  '🔦 Sistema reiniciado com a lanterna! Elevador liberado. Senha gerada:',
  '🪪 Crachá da Alessandra aceito — portão desbloqueado! Código de saída:'
];

function revelarSenha() {
  const senha = SENHAS_FASE[phase];
  const ctx   = MSGS_SENHA[phase];

  addDialog(`🔓 Todos os desafios concluídos! ${ctx}`);

  const content = document.getElementById('tab-dialog-content');
  const b = document.createElement('div');
  b.className = 'dialog-bubble system senha-bubble';
  b.innerHTML = `
    <div style="text-align:center;padding:0.4rem 0;">
      <div style="font-size:0.65rem;letter-spacing:3px;color:var(--dim);margin-bottom:0.5rem;">🔑 SENHA DA PORTA</div>
      <div style="font-size:2.4rem;font-weight:900;letter-spacing:14px;color:#00d4ff;
                  text-shadow:0 0 30px rgba(0,212,255,0.9);font-family:'Orbitron',monospace;padding:0.3rem 0;">
        ${senha}
      </div>
      <div style="font-size:0.63rem;color:var(--dim);margin-top:0.5rem;letter-spacing:1px;animation:blink 1s infinite;">
        ▶ CLIQUE NA PORTA E INSIRA ESTE CÓDIGO
      </div>
    </div>`;
  content.appendChild(b);
  content.scrollTop = content.scrollHeight;
  switchTab('dialog');

  showNotif(`🔑 Senha: ${senha} — Use na PORTA!`);
  playDoorUnlock();

  // Fazer a porta pulsar
  document.getElementById('door').classList.add('door-ready');
}

function updateQProgress() {
  const dots = document.querySelectorAll('.qp');
  dots.forEach((d, i) => {
    d.className = 'qp' + (i < questoesDone ? ' done' : i === qIdx ? ' curr' : '');
  });
}

function penalize(n) {
  tries -= n;
  totalErrors++;
  updateTriesUI();
  updateTermTriesUI();
  shakeEl('tries-hud');

  if (tries <= 0) {
    setTimeout(() => {
      closeTerminal();
      document.getElementById('defeat-overlay').classList.add('show');
    }, 700);
  }
}

/* ─── HUD / UI ─── */
function updateHUD() {
  updateTriesUI();
  updateInventoryUI();
}

function updateTriesUI() {
  const el = document.getElementById('tries-hud');
  const hearts = Array.from({length: 6}, (_, i) => i < tries ? '❤️' : '🖤').join('');
  el.innerHTML = hearts;
  el.className = 'hud-tries';
  if (tries <= 2)      el.classList.add('crit');
  else if (tries <= 3) el.classList.add('warn');
}

function updateTermTriesUI() {
  const el = document.getElementById('term-tries');
  if (!el) return;
  const hearts = Array.from({length: 6}, (_, i) => i < tries ? '❤️' : '🖤').join('');
  el.innerHTML = `<span style="font-size:0.65rem;color:var(--dim);letter-spacing:1px;">TENTATIVAS:</span> ${hearts}`;
}

function updateInventoryUI() {
  [0, 1].forEach(i => {
    const sl = document.getElementById('inv' + i);
    if (inventory[i]) {
      sl.textContent = inventory[i].emoji;
      sl.classList.add('filled');
      sl.title = inventory[i].desc;
    } else {
      sl.textContent = '';
      sl.classList.remove('filled');
      sl.title = 'Vazio';
    }
  });
}

function moveGirotto(targetLeft) {
  document.getElementById('girotto').style.left = targetLeft;
}

function shakeEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

function flashPanel(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background = 'rgba(0,212,255,0.08)';
  setTimeout(() => el.style.background = '', 800);
}

function showNotif(msg) {
  const n = document.getElementById('notif');
  n.innerHTML = msg;
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 2800);
}

/* ─── Diálogo / Abas ─── */
function clearDialog() {
  document.getElementById('tab-dialog-content').innerHTML = '';
}

function addDialog(msg, type = 'girotto', customMsg = null, msgKey = null) {
  const content = document.getElementById('tab-dialog-content');
  // Se msgKey fornecida, substituir bolha anterior com mesma chave
  if (msgKey) {
    const existing = content.querySelector('[data-msg-key="' + msgKey + '"]');
    if (existing) {
      existing.innerHTML = customMsg || msg;
      content.scrollTop = content.scrollHeight;
      return;
    }
  }
  const b = document.createElement('div');
  b.className = 'dialog-bubble' + (type !== 'girotto' ? ' ' + type : '');
  if (msgKey) b.dataset.msgKey = msgKey;
  b.innerHTML = customMsg || msg;
  content.appendChild(b);
  content.scrollTop = content.scrollHeight;
  switchTab('dialog');
}

function switchTab(tab) {
  ['dialog', 'tutor'].forEach(t => {
    document.getElementById('tab-' + t + '-content').classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });
}

/* ─── Vitória / Derrota ─── */
function showPhaseWin() {
  const f      = FASES[phase];
  const isLast = phase === FASES.length - 1;

  document.getElementById('pw-icon').textContent  = isLast ? '🏆' : '🔓';
  document.getElementById('pw-title').textContent = isLast ? 'FUGA COMPLETA!' : 'PORTA ABERTA!';
  document.getElementById('pw-title').style.color = isLast ? 'var(--gold)' : 'var(--green)';
  document.getElementById('pw-text').innerHTML    = f.win_msg;
  document.getElementById('pw-btn').textContent   = isLast ? '🏆 VER RESULTADO FINAL' : 'AVANÇAR ▶';

  document.getElementById('phase-win').classList.add('show');
}

function advancePhase() {
  document.getElementById('phase-win').classList.remove('show');

  // Efeito de transição entre fases
  const canvas = document.getElementById('scene-canvas');
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.4s';

  setTimeout(() => {
    phase++;
    if (phase >= FASES.length) showVictory();
    else {
      loadPhase();
      canvas.style.opacity = '1';
    }
  }, 400);
}

function retryPhase() {
  document.getElementById('defeat-overlay').classList.remove('show');
  tries = 6;
  loadPhase();
}

function showVictory() {
  stopAlarm();
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  // Classificação por erros
  let rank = '🥇 MESTRE DO CÁLCULO';
  let rankColor = 'var(--gold)';
  if (totalErrors > 10) { rank = '🥈 CALCULISTA'; rankColor = 'var(--dim)'; }
  else if (totalErrors > 5) { rank = '🥈 INTEGRADOR'; rankColor = 'var(--cyan)'; }

  document.getElementById('v-erros').textContent = totalErrors;
  document.getElementById('v-time').textContent  = mm + ':' + ss;
  document.getElementById('v-rank').textContent  = rank;
  document.getElementById('v-rank').style.color  = rankColor;
  document.getElementById('victory-screen').classList.add('show');
  spawnConfetti();
  setTimeout(() => { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => playBeep(f,0.3,'sine',0.12), i*120)); }, 500);
}

function restartAll() {
  document.getElementById('victory-screen').classList.remove('show');
  phase = 0; totalErrors = 0; inventory = []; tries = 6;
  document.getElementById('intro-screen').style.display = 'flex';
}

function spawnConfetti() {
  const wrap   = document.getElementById('confetti-wrap');
  const colors = ['#f1c40f','#2ecc71','#00d4ff','#e74c3c','#9b59b6','#ffffff'];
  wrap.innerHTML = '';
  for (let i = 0; i < 100; i++) {
    const c = document.createElement('div');
    c.className        = 'confetto';
    c.style.left       = Math.random() * 100 + '%';
    c.style.top        = '-10px';
    c.style.width      = (Math.random() * 10 + 4) + 'px';
    c.style.height     = (Math.random() * 10 + 4) + 'px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (Math.random() * 2 + 2) + 's';
    c.style.animationDelay    = (Math.random() * 3) + 's';
    c.style.borderRadius      = Math.random() > 0.5 ? '50%' : '2px';
    wrap.appendChild(c);
  }
}

/* ─── Eventos ─── */
document.getElementById('btn-confirm').addEventListener('click', confirm);
document.getElementById('ans-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirm();
});
