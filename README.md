## 🔐 Escape Room — A Fuga de Girotto
A Fuga de Girotto é um jogo educativo interativo desenvolvido em HTML5, CSS3 e JavaScript. O objetivo principal é ensinar e reforçar conceitos de Cálculo II, especificamente a resolução de integrais, através de uma narrativa de escape room.

## 📖 História
Sexta-feira, 21h03. O campus do CESUPA está silencioso. O professor Pedro Girotto esqueceu seu pen-drive na sala dos professores e, ao voltar para buscá-lo, a coordenadora Alessandra ativou o bloqueio total de segurança. Agora, Girotto precisa usar seu conhecimento matemático para decifrar os protocolos do sistema e escapar antes que a segurança chegue.

## 🎯 Objetivo Pedagógico
O jogo foi projetado como uma ferramenta de aprendizagem ativa, onde o progresso depende da resolução correta de 12 integrais distribuídas em 4 fases temáticas. Cada fase introduz um conceito fundamental:

### Fase 1: Sala dos Professores – Foco em Integrais Indefinidas e a Regra da Potência.

### Fase 2: Corredor Principal – Introdução à Integração por Substituição (u-sub).

### Fase 3: Elevador Central – Aplicação de Integração por Partes.

### Fase 4: Portão Principal – Resolução de Integrais Definidas (Teorema Fundamental do Cálculo).

## 🚀 Funcionalidades
Ambiente Interativo: Explore as salas clicando em objetos como quadros, laptops e mochilas para encontrar itens e pistas.

Sistema de Tutoria: Uma "Caderneta/Diário" integrada fornece fórmulas e exemplos práticos antes de cada desafio.

Feedback em Tempo Real: O terminal de respostas valida os cálculos e oferece passos sugeridos para ajudar na resolução.

### Mecânicas de Jogo:

Inventário: Colete itens essenciais como pen-drives e lanternas para avançar.

Sistema de Vidas: O jogador começa com 6 tentativas; erros sucessivos podem comprometer a fuga.

Efeitos Audiovisuais: Sons via Web Audio API e efeitos de "apagão" e alarmes para aumentar a imersão.

Ranking Final: Avaliação baseada no tempo e precisão dos cálculos.

## 🛠️ Tecnologias Utilizadas
HTML5: Estrutura semântica e interface do usuário.

CSS3: Estilização moderna com variáveis (Custom Properties), animações (@keyframes) e layout responsivo.

JavaScript (Vanilla): Lógica do motor do jogo, manipulação de DOM e processamento de áudio.

Google Fonts: Tipografias Orbitron e Share Tech Mono para um visual cyberpunk/tech

## 📁 Estrutura do Projeto
/EscapeRoomGirotto

-index.html : Estrutura principal e telas de introdução/vitória

-style.css : Design, animações e efeitos visuais

-data.js : Banco de dados de fases, objetos e questões

-game.js : Motor do jogo (engine), sons e lógica de navegação

## 🎮 Como Jogar
Abra o arquivo index.html em qualquer navegador moderno.

Leia o contexto da história e avance para o mapa de fuga.

Explore: Clique nos objetos da sala para encontrar o item necessário (ex: Pen-drive).

Estude: Use o botão "Diário" para revisar a regra matemática daquela fase.

Resolva: Clique no terminal (laptop/painel) e digite a resposta da integral solicitada.

Fuja: Resolva todas as questões de uma sala para receber a senha da porta e avançar para o próximo setor.
