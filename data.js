/* ═══════════════════════════════════════════
   DADOS DO JOGO — FASES, QUESTÕES E OBJETOS
   v6 — Escape Room Dinâmico
═══════════════════════════════════════════ */

const FASES = [

  /* ─── FASE 1: Sala dos Professores ─── */
  {
    id: 1,
    nome: 'Sala dos Professores',
    icon: '🖥️',
    tipo: 'Integral Indefinida',
    girotto_start: { left: '18%', bottom: '22%' },
    bgClass: 'bg-sala',
    ambiencia: '💡 As luzes piscam. O ar-condicionado geme.',
    alarme: false,

    tutorial: {
      titulo: '📖 Integral Indefinida',
      html: `A integral indefinida <em>"desfaz"</em> a derivada. Para <strong>xⁿ</strong>:
<div class="formula">∫ xⁿ dx = xⁿ⁺¹ / (n+1) + C</div>
O <strong>+ C</strong> é obrigatório — representa uma família de funções. Sem ele, a resposta está incompleta.
<div class="example">Ex: ∫ 2x dx = x² + C</div>`
    },

    objetos: [
      {
        id: 'janela', emoji: '🪟', label: 'JANELA', top: '18%', left: '8%',
        dialogs: [
          'Escuro lá fora. O campus está deserto — nenhuma alma viva. Só eu e esses malditos cálculos...',
          'Sem sinal de ninguém. A única saída é resolver esses protocolos matemáticos.'
        ],
        questao: null
      },
      {
        id: 'quadro', emoji: '📋', label: 'QUADRO', top: '14%', left: '30%',
        dialogs: [
          'O quadro tem anotações de aula ainda frescas. Lembro de ter escrito isso hoje cedo:\n\n"∫ xⁿ dx = xⁿ⁺¹/(n+1) + C — REGRA DA POTÊNCIA"',
          'Eu mesmo escrevi isso! Pelo menos vou usar o meu próprio conteúdo pra escapar...'
        ],
        questao: null, dica: true
      },
      {
        id: 'cafe', emoji: '☕', label: 'CAFÉ', top: '52%', left: '45%',
        dialogs: [
          'Meu café! Ainda morno... Uma nota grudada: "Girotto, a integral é o caminho. — Ass: Você mesmo às 17h"',
          'Filosofia às 17h. Típico de mim.'
        ],
        questao: null, item: '☕', item_desc: 'Café do Girotto — ainda morno'
      },
      {
        id: 'mochila', emoji: '🎒', label: 'MOCHILA', top: '55%', left: '72%',
        dialogs: [
          'Minha mochila! Deixei aqui quando saí pra buscar o café. Dentro tem o 💾 pen-drive com os desafios!',
          'Esse pen-drive tem os arquivos criptografados do sistema. Preciso usá-lo no laptop.'
        ],
        questao: null, item: '💾', item_desc: 'Pen-drive — Desafios de Integral Indefinida'
      },
      {
        id: 'laptop', emoji: '💻', label: 'LAPTOP', top: '28%', left: '58%',
        dialogs: [
          'O laptop! Com o pen-drive conectado consigo acessar o sistema de segurança.',
          'Três integrais para decifrar a senha. Vamos lá...'
        ],
        dialog_sem_item: '⚠ O laptop pede o pen-drive. Preciso encontrá-lo primeiro.',
        questao: 'all',
        requer_item: '💾'
      }
    ],

    questoes: [
      {
        q: '∫ 3x² dx',
        contexto: '🔐 ARQUIVO 1/3 — Criptografia Alpha',
        passos: [
          'Regra da potência: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C',
          'Aplique com n=2: eleve o expoente e divida pelo novo expoente',
          'Multiplique pelo coeficiente 3 e simplifique — não esqueça o + C'
        ],
        resp: ['x3+c', 'x^3+c'],
        gabarito: 'x³ + C',
        definida: false
      },
      {
        q: '∫ 4x³ dx',
        contexto: '🔐 ARQUIVO 2/3 — Criptografia Beta',
        passos: [
          'Regra da potência: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C',
          'Aplique com n=3: eleve o expoente e divida pelo novo expoente',
          'Multiplique pelo coeficiente 4 e simplifique — não esqueça o + C'
        ],
        resp: ['x4+c', 'x^4+c'],
        gabarito: 'x⁴ + C',
        definida: false
      },
      {
        q: '∫ (2x + 5) dx',
        contexto: '🔐 ARQUIVO 3/3 — Criptografia Gamma',
        passos: [
          'Separe: ∫2x dx + ∫5 dx  (linearidade da integral)',
          'Integre cada parcela individualmente pela regra da potência',
          'Some os resultados e adicione + C no final'
        ],
        resp: ['x2+5x+c', 'x^2+5x+c'],
        gabarito: 'x² + 5x + C',
        definida: false
      }
    ],

    win_msg: `A senha funcionou! <strong>A porta da Sala dos Professores</strong> se destrava com um clique metálico.<br><br>
    Girotto toma o último gole do café frio, pega sua mochila e corre para o corredor.<br>
    <em style="color:var(--dim)">— "Três salas. Chego em casa antes da meia-noite..."</em>`
  },

  /* ─── FASE 2: Corredor Principal ─── */
  {
    id: 2,
    nome: 'Corredor Principal',
    icon: '🚪',
    tipo: 'Substituição (u-sub)',
    girotto_start: { left: '12%', bottom: '22%' },
    bgClass: 'bg-corredor',
    ambiencia: '🚨 ALARME ATIVO — Sistema de contenção acionado.',
    alarme: true,

    tutorial: {
      titulo: '📖 Substituição (u-sub)',
      html: `Quando há uma função composta, use substituição:
<div class="formula">u = parte interna → du = derivada de u</div>
Troca as variáveis, resolve em <em>u</em>, depois volta para <em>x</em>.
<div class="example">Ex: ∫ 2x(x²+1) dx → u=x²+1, du=2x dx<br>= ∫ u du = u²/2 + C = (x²+1)²/2 + C</div>`
    },

    objetos: [
      {
        id: 'placa', emoji: '⚠️', label: 'PLACA DE ALARME', top: '15%', left: '10%',
        dialogs: [
          '🚨 "PROTOCOLO u-sub ATIVADO — CONTENÇÃO EM CURSO"\n\nO sensor de movimento detectou minha presença. Preciso desativar o painel antes que a segurança apareça!',
          'O alarme está contando... cada erro vai chamar mais atenção. Precisa ser rápido e correto.'
        ],
        questao: null
      },
      {
        id: 'extintor', emoji: '🧯', label: 'EXTINTOR', top: '42%', left: '28%',
        dialogs: [
          'Um adesivo grudado no extintor — alguém colou uma dica de cálculo aqui:\n\n"u-sub: 1) Achar u  2) du=derivada de u  3) Substituir  4) Integrar  5) Voltar p/ x"\n\nQuem foi esse gênio anônimo?',
          'Vou seguir esses passos risca a risca.'
        ],
        questao: null, dica: true
      },
      {
        id: 'camera', emoji: '📷', label: 'CÂMERA', top: '12%', left: '52%',
        dialogs: [
          'A câmera pisca... vermelha. Ela está gravando tudo. Uma mensagem na tela ao lado: "Prof. Girotto, sei que está aí. Resolva os cálculos ou aguarde a segurança. — Alessandra 😈"',
          'Ela realmente fez isso. Tudo bem — vou resolver e escapar antes que qualquer segurança chegue.'
        ],
        questao: null
      },
      {
        id: 'planta', emoji: '🪴', label: 'PLANTA', top: '50%', left: '48%',
        dialogs: [
          'Uma planta de plástico. Ninguém rega, ninguém cuida, mas sobrevive. Inspirador.\n\nEscondido atrás do vaso: um 🪪 crachá vermelho de acesso ao painel — e um papel com a decomposição de u-sub escrita à mão!',
          'Alguém passou por aqui antes de mim e deixou um presente estratégico.'
        ],
        questao: null, item: '🪪', item_desc: 'Crachá de Acesso — Nível Segurança B'
      },
      {
        id: 'painel', emoji: '🖲️', label: 'PAINEL DE CONTROLE', top: '28%', left: '78%',
        dialogs: [
          '🚨 O painel central do corredor! Exige autenticação por crachá e 3 senhas de integração por substituição para desativar o alarme.',
          'Cada resposta correta apaga uma sirene. Vamos silenciar isso.'
        ],
        dialog_sem_item: '⚠ O painel exige autenticação por crachá de acesso. Preciso encontrá-lo — está escondido em algum canto!',
        questao: 'all',
        requer_item: '🪪'
      }
    ],

    questoes: [
      {
        q: '∫ 2x(x²+1)³ dx',
        contexto: '🚨 SIRENE 1/3 — Desativando alarme Alpha',
        passos: [
          'Identifique a função interna: o que está elevado ao cubo?',
          'Derive essa função — verifique se o fator externo 2x aparece',
          'Integre em u, depois substitua de volta para x e adicione + C'
        ],
        resp: ['(x2+1)4/4+c', '(x^2+1)^4/4+c', '(x2+1)^4/4+c'],
        gabarito: '(x²+1)⁴/4 + C',
        definida: false
      },
      {
        q: '∫ 3x²(x³+2)² dx',
        contexto: '🚨 SIRENE 2/3 — Desativando alarme Beta',
        passos: [
          'Identifique a função interna: o que está elevado ao quadrado?',
          'Derive essa função — verifique se o fator externo 3x² aparece',
          'Integre em u, depois substitua de volta para x e adicione + C'
        ],
        resp: ['(x3+2)3/3+c', '(x^3+2)^3/3+c', '(x3+2)^3/3+c'],
        gabarito: '(x³+2)³/3 + C',
        definida: false
      },
      {
        q: '∫ cos(x)·sen(x) dx',
        contexto: '🚨 SIRENE 3/3 — Desativando alarme Gamma',
        passos: [
          'Qual das duas funções simplifica ao derivar? Escolha ela como u',
          'Verifique se a derivada de u aparece como fator na integral',
          'Integre em u (regra da potência), volte para x e adicione + C'
        ],
        resp: ['sen2(x)/2+c', 'sen^2(x)/2+c', 'sin2(x)/2+c', 'sin^2(x)/2+c'],
        gabarito: 'sen²(x)/2 + C',
        definida: false
      }
    ],

    win_msg: `🔕 As sirenes param. Silêncio absoluto no corredor.<br><br>
    As grades eletrônicas se recolhem com um zumbido suave. Girotto respira fundo.<br><br>
    Corre até o elevador — mas os botões estão apagados. <strong>Sem energia.</strong><br>
    <em style="color:var(--dim)">— "Claro. Claro que o elevador não funciona."</em>`
  },

  /* ─── FASE 3: Elevador (Apagão) ─── */
  {
    id: 3,
    nome: 'Elevador — Pane Elétrica',
    icon: '🛗',
    tipo: 'Integração por Partes',
    girotto_start: { left: '20%', bottom: '20%' },
    bgClass: 'bg-elevador',
    ambiencia: '🔦 PANE ELÉTRICA — Operando no modo emergência.',
    alarme: false,
    apagao: true,

    tutorial: {
      titulo: '📖 Integração por Partes',
      html: `Usada quando o produto de duas funções não tem substituição óbvia:
<div class="formula">∫ u dv = uv − ∫ v du</div>
Escolha <strong>u</strong> = função que simplifica ao derivar<br>Escolha <strong>dv</strong> = o resto.
<div class="example">Regra LIATE para escolher u:<br><strong>L</strong>og → <strong>I</strong>nverso trig → <strong>A</strong>lgébrico → <strong>T</strong>rig → <strong>E</strong>xponencial</div>`
    },

    objetos: [
      {
        id: 'lanterna', emoji: '🔦', label: 'LANTERNA', top: '55%', left: '15%',
        dialogs: [
          'Uma lanterna de emergência! Presa na parede com velcro. Agora consigo ver alguma coisa nesse escuro...',
          'A lanterna iluminou algo no chão — um manual de manutenção do elevador.'
        ],
        questao: null, item: '🔦', item_desc: 'Lanterna de emergência'
      },
      {
        id: 'manual', emoji: '📓', label: 'MANUAL TÉCNICO', top: '48%', left: '38%',
        dialogs: [
          '📓 Manual de manutenção — Elevador Mod. EL-7.\n\n"Em caso de pane, insira senhas matemáticas no painel auxiliar."\n\nE há uma nota à mão: "∫u dv = uv − ∫v du. LIATE salva vidas. — Técnico Rodrigo"',
          'O técnico Rodrigo é um herói. Obrigado, Rodrigo.'
        ],
        questao: null, dica: true
      },
      {
        id: 'espelho', emoji: '🪞', label: 'ESPELHO', top: '15%', left: '55%',
        dialogs: [
          'Com a lanterna iluminando o espelho, vejo um recado escrito em batom vermelho:\n\n"∫ u dv = uv − ∫ v du\nBoa sorte, prof! 💋"\n\n— Quem foi isso?!',
          'Alguém sabia que eu passaria por aqui. Preocupante. E útil.'
        ],
        questao: null, dica: true
      },
      {
        id: 'fusivel', emoji: '⚡', label: 'CAIXA DE FUSÍVEIS', top: '30%', left: '75%',
        dialogs: [
          '⚡ A caixa de fusíveis está queimada — por isso o apagão. Mas o painel auxiliar ainda funciona com bateria.',
          'Se eu resolver as integrais no painel auxiliar, ele reinicia o sistema e o elevador volta.'
        ],
        questao: null
      },
      {
        id: 'botoes', emoji: '🔢', label: 'PAINEL AUXILIAR', top: '28%', left: '55%',
        dialogs: [
          '🔋 Painel auxiliar — bateria em 23%. Exige a lanterna de emergência para iluminar o teclado nesse escuro, além de 3 senhas matemáticas para reiniciar o sistema elétrico.',
          'Cada resposta correta acende uma luz. Com a lanterna consigo enxergar os botões.'
        ],
        dialog_sem_item: '⚠ Está escuro demais para ver os botões! Preciso da lanterna de emergência primeiro.',
        questao: 'all',
        requer_item: '🔦'
      }
    ],

    questoes: [
      {
        q: '∫ x·eˣ dx',
        contexto: '⚡ CIRCUITO 1/3 — Reiniciando módulo Alpha',
        passos: [
          'Escolha u = x  →  du = dx  (algébrico simplifica ao derivar)',
          'Então dv = eˣ dx  →  integre para obter v',
          'Aplique ∫ u dv = uv − ∫ v du e simplifique'
        ],
        resp: ['xe^x-e^x+c', 'xex-ex+c', 'xeˣ-eˣ+c', 'xex-ex+c'],
        gabarito: 'xeˣ − eˣ + C',
        definida: false
      },
      {
        q: '∫ x·cos(x) dx',
        contexto: '⚡ CIRCUITO 2/3 — Reiniciando módulo Beta',
        passos: [
          'Escolha u = x  →  du = dx  (algébrico simplifica ao derivar)',
          'Então dv = cos(x) dx  →  integre cos(x) para obter v',
          'Aplique ∫ u dv = uv − ∫ v du e resolva a integral restante'
        ],
        resp: [
          'xsen(x)+cos(x)+c', 'xsin(x)+cos(x)+c',
          'x·sen(x)+cos(x)+c', 'x·sin(x)+cos(x)+c',
          'xsen(x)+cos(x)+c'
        ],
        gabarito: 'x·sen(x) + cos(x) + C',
        definida: false
      },
      {
        q: '∫ x·sen(x) dx',
        contexto: '⚡ CIRCUITO 3/3 — Reiniciando módulo Gamma',
        passos: [
          'Escolha u = x  →  du = dx  (algébrico simplifica ao derivar)',
          'Então dv = sen(x) dx  →  integre sen(x) para obter v',
          'Aplique ∫ u dv = uv − ∫ v du e resolva a integral restante'
        ],
        resp: [
          '-xcos(x)+sen(x)+c', '-xcos(x)+sin(x)+c',
          '-x·cos(x)+sen(x)+c', '-x·cos(x)+sin(x)+c',
          '-xcos(x)+sen(x)+c'
        ],
        gabarito: '−x·cos(x) + sen(x) + C',
        definida: false
      }
    ],

    win_msg: `⚡ As luzes acendem uma por uma. O elevador ronca e ressuscita!<br><br>
    Girotto entra, aperta o botão <strong>T — Térreo</strong>. A cabine desce lentamente...<br><br>
    <em style="color:var(--dim)">— "Último andar. A saída está logo ali. Quase lá."</em><br><br>
    Mas ao chegar ao térreo, o <strong>portão principal</strong> está lacrado com um protocolo final de segurança.`
  },

  /* ─── FASE 4: Portão Principal — A Grande Fuga ─── */
  {
    id: 4,
    nome: 'Portão Principal — A Grande Fuga',
    icon: '🚧',
    tipo: 'Integral Definida',
    girotto_start: { left: '15%', bottom: '20%' },
    bgClass: 'bg-portao',
    ambiencia: '🌙 ÁREA EXTERNA — Vento frio. Liberdade a poucos metros.',
    alarme: false,
    finalBoss: true,

    tutorial: {
      titulo: '📖 Integral Definida',
      html: `A integral definida calcula uma <strong>área</strong> entre dois limites:
<div class="formula">∫ₐᵇ f(x) dx = F(b) − F(a)</div>
Onde F(x) é a primitiva de f(x).<br>O resultado é um <strong>número</strong> — não inclua + C!
<div class="example">Ex: ∫₀¹ 2x dx = [x²]₀¹ = 1 − 0 = 1</div>`
    },

    objetos: [
      {
        id: 'carro', emoji: '🚗', label: 'MEU CARRO', top: '20%', left: '78%',
        dialogs: [
          '😭 MEU CARRO! Está logo ali, do outro lado do portão. Só esse maldito portão entre mim e a liberdade.',
          'Você vai esperar por mim, meu carro. Vou resolver isso agora.'
        ],
        questao: null
      },
      {
        id: 'cracha', emoji: '🪪', label: 'CRACHÁ NO CHÃO', top: '55%', left: '48%',
        dialogs: [
          '🪪 Um crachá no chão: "Alessandra — Coordenação".\n\nAtrás dele, uma nota: "Se chegou até aqui, parabéns. ∫ₐᵇ f(x)dx = F(b)−F(a). Sem + C. Boa sorte. — A."\n\nParece que ela deixou o crachá aqui de propósito...',
          'Ela me preparou isso? Que personagem contraditória — e generosa.'
        ],
        questao: null, item: '🪪', item_desc: 'Crachá da Alessandra — Coordenação CESUPA'
      },
      {
        id: 'seguranca', emoji: '🧱', label: 'MURO DE SEGURANÇA', top: '35%', left: '25%',
        dialogs: [
          'O muro tem sensores. Escalar está fora de questão — eles ativariam um travamento total.',
          'A única saída é pelo portão. E o portão só abre com os cálculos corretos.'
        ],
        questao: null
      },
      {
        id: 'plaquinha', emoji: '📟', label: 'TERMINAL CESUPA', top: '25%', left: '10%',
        dialogs: [
          '📟 TERMINAL CESUPA — PROTOCOLO FINAL\n\n"Bem-vindo ao sistema de liberação de saída.\nInsira os resultados das integrais definidas para destravar o portão."\n\nÉ agora ou nunca.',
          'Três cálculos. Três respostas numéricas. Sem + C. O portão abre.'
        ],
        questao: null
      },
      {
        id: 'catraca', emoji: '🚦', label: 'CATRACA ELETRÔNICA', top: '30%', left: '52%',
        dialogs: [
          '🚦 A catraca eletrônica do CESUPA! Tem um leitor de crachá e exige 3 resultados numéricos de integrais definidas para liberar o portão.',
          'Último protocolo. Crachá + três integrais definidas. Cada resposta é um número exato — sem + C desta vez!'
        ],
        dialog_sem_item: '⚠ A catraca tem um leitor de crachá bloqueado. Preciso do crachá da Alessandra para autenticar!',
        questao: 'all',
        requer_item: '🪪'
      }
    ],

    questoes: [
      {
        q: '∫₀² 2x dx',
        contexto: '🚧 PROTOCOLO FINAL 1/3 — Desbloqueando segmento Alpha',
        passos: [
          'Encontre a primitiva F(x) de 2x pela regra da potência',
          'Avalie F(x) nos limites: calcule F(2) e F(0) separadamente',
          'Subtraia: F(2) − F(0) — o resultado é um número, sem + C'
        ],
        resp: ['4'],
        gabarito: '4',
        definida: true
      },
      {
        q: '∫₁³ (2x+1) dx',
        contexto: '🚧 PROTOCOLO FINAL 2/3 — Desbloqueando segmento Beta',
        passos: [
          'Encontre a primitiva F(x) de (2x+1) pela regra da potência',
          'Avalie F(x) nos limites: calcule F(3) e F(1) separadamente',
          'Subtraia: F(3) − F(1) — o resultado é um número, sem + C'
        ],
        resp: ['10'],
        gabarito: '10',
        definida: true
      },
      {
        q: '∫₀³ 3x² dx',
        contexto: '🚧 PROTOCOLO FINAL 3/3 — Desbloqueando segmento Gamma',
        passos: [
          'Encontre a primitiva F(x) de 3x² pela regra da potência',
          'Avalie F(x) nos limites: calcule F(3) e F(0) separadamente',
          'Subtraia: F(3) − F(0) — o resultado é um número, sem + C'
        ],
        resp: ['27'],
        gabarito: '27',
        definida: true
      }
    ],

    win_msg: `🎉 <strong>O PORTÃO SE ABRE!</strong><br><br>
    Girotto atravessa a catraca, corre pelo estacionamento e entra no carro.<br>
    O motor pega. As luzes do CESUPA ficam para trás no retrovisor.<br><br>
    <em style="color:var(--gold)">— "Doze integrais. Quatro salas. Um café frio. E eu, livre."</em><br><br>
    <strong>MISSÃO CONCLUÍDA! 🏆</strong>`
  }
];
