

/* ============================================================
   script.js — Force Feedback Customization UI
   Lógica de sliders, segmented controls, perfis e jogos
   ============================================================ */

/* ── Utilitários ─────────────────────────────────────────────── */

/**
 * Atualiza o gradiente de preenchimento do slider conforme o valor.
 * @param {HTMLInputElement} slider
 * @param {HTMLElement} label  - elemento que mostra o valor %
 */
function syncSlider(slider, label) {
  const val = parseInt(slider.value, 10);
  const pct = val + '%';
  slider.style.setProperty('--fill', pct);
  if (label) label.textContent = pct;
}

/* ── Inicializa sliders ──────────────────────────────────────── */

const sliderPotencia = document.getElementById('slider-potencia');
const potenciaValue  = document.getElementById('potencia-value');

const sliderMotor = document.getElementById('slider-motor');
const motorValue  = document.getElementById('motor-value');

// Sincroniza visualmente ao carregar
syncSlider(sliderPotencia, potenciaValue);
syncSlider(sliderMotor, motorValue);

// Atualiza em tempo real ao arrastar
sliderPotencia.addEventListener('input', () => syncSlider(sliderPotencia, potenciaValue));
sliderMotor.addEventListener('input',    () => syncSlider(sliderMotor,    motorValue));

/* ── Controle Segmentado: Nível de sensação do asfalto ──────── */

const segButtons = document.querySelectorAll('.seg-btn');

segButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove estado ativo de todos os botões do mesmo grupo
    const group = btn.closest('.segmented-control');
    group.querySelectorAll('.seg-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });

    // Ativa o botão clicado
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  });
});

/* ── Seletor de Perfil do Jogador ───────────────────────────── */

const profileButtons = document.querySelectorAll('.profile-btn');

profileButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    profileButtons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
  });
});

/* ── Gerenciamento de Jogos ──────────────────────────────────── */

/**
 * Remove um card de jogo do grid.
 * @param {HTMLElement} card - o .game-card a ser removido
 */
function removeGameCard(card) {
  card.style.transition = 'opacity 0.2s, transform 0.2s';
  card.style.opacity = '0';
  card.style.transform = 'scale(0.85)';
  setTimeout(() => card.remove(), 200);
}

// Delegação de eventos para os botões de remover (inclui os adicionados dinamicamente)
const gameGrid = document.getElementById('game-grid');

gameGrid.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.game-remove-btn');
  if (removeBtn) {
    const card = removeBtn.closest('.game-card');
    if (card) removeGameCard(card);
  }
});

/* ── Modal: Adicionar Jogo ───────────────────────────────────── */

const modal        = document.getElementById('modal-add-game');
const btnAddGame   = document.getElementById('btn-add-game');
const btnCancel    = document.getElementById('btn-modal-cancel');
const btnConfirm   = document.getElementById('btn-modal-confirm');
const newGameInput = document.getElementById('new-game-name');

// Abre modal
btnAddGame.addEventListener('click', () => {
  modal.hidden = false;
  newGameInput.value = '';
  newGameInput.focus();
});

// Fecha modal ao cancelar
btnCancel.addEventListener('click', closeModal);

// Fecha modal ao clicar fora do card
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Fecha modal com Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

function closeModal() {
  modal.hidden = true;
  newGameInput.value = '';
}

// Confirma e adiciona novo jogo
btnConfirm.addEventListener('click', addNewGame);

newGameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addNewGame();
});

/**
 * Cria e insere um novo card de jogo no grid.
 * As cores do placeholder mudam conforme os jogos existentes.
 * IMAGEM: substitua a lógica de placeholder por um input type=file
 *         ou uma URL real para ter capas reais dos jogos.
 */
function addNewGame() {
  const name = newGameInput.value.trim();
  if (!name) {
    newGameInput.focus();
    return;
  }

  // Cores de placeholder variadas — remova quando tiver imagens reais
  const placeholderColors = ['1a1a3a', '1a3a1a', '3a1a1a', '2a2a1a', '1a2a3a'];
  const colorIdx = gameGrid.querySelectorAll('.game-card').length % placeholderColors.length;
  const bgColor  = placeholderColors[colorIdx];

  // Cria o card
  const card = document.createElement('div');
  card.className  = 'game-card';
  card.dataset.id = name.toLowerCase().replace(/\s+/g, '-');
  card.style.opacity   = '0';
  card.style.transform = 'scale(0.85)';
  card.style.transition = 'opacity 0.2s, transform 0.2s';

  card.innerHTML = `
    <button class="game-remove-btn" aria-label="Remover ${name}">×</button>
    <!--
      IMAGEM DO JOGO: substitua o src abaixo pela URL real ou caminho local da capa do jogo.
      Exemplo: src="images/meu-jogo.jpg"
    -->
    <img
      src="https://placehold.co/100x80/${bgColor}/ffffff?text=${encodeURIComponent(name.slice(0,3).toUpperCase())}"
      alt="${name}"
      class="game-cover"
      onerror="this.style.background='#${bgColor}'; this.removeAttribute('src')"
    />
    <span class="game-title">${name.toUpperCase()}</span>
  `;

  // Insere antes do botão "Adicionar jogo"
  gameGrid.insertBefore(card, btnAddGame);

  // Anima entrada
  requestAnimationFrame(() => {
    card.style.opacity   = '1';
    card.style.transform = 'scale(1)';
  });

  closeModal();
}

/* ── Botão principal: Gerar Perfil Predefinido ───────────────── */

const btnGerar = document.getElementById('btn-gerar');

btnGerar.addEventListener('click', () => {
  // Coleta os valores atuais
  const perfil = {
    potencia:         parseInt(sliderPotencia.value, 10),
    jogos:            [...gameGrid.querySelectorAll('.game-card')].map(c => c.dataset.id),
    nivelAsfalto:     document.querySelector('.seg-btn.active')?.dataset.value,
    microcontrolador: document.getElementById('select-microcontrolador').value,
    feedbackMotor:    parseInt(sliderMotor.value, 10),
    perfilJogador:    document.querySelector('.profile-btn.active')?.dataset.value,
  };

  // Exibe no console para uso posterior no backend / integração
  console.log('[Force Feedback] Perfil gerado:', perfil);

  // Feedback visual ao usuário
  showToast('✓ Perfil gerado com sucesso!');

  // Anima o botão brevemente
  btnGerar.style.transform = 'scale(0.97)';
  setTimeout(() => { btnGerar.style.transform = ''; }, 180);
});

/* ── Toast de notificação ────────────────────────────────────── */

let toastEl = null;
let toastTimer = null;

/**
 * Exibe uma mensagem toast na parte inferior da tela.
 * @param {string} msg
 */
function showToast(msg) {
  // Remove toast anterior se ainda estiver visível
  if (toastEl) {
    toastEl.remove();
    clearTimeout(toastTimer);
  }

  toastEl = document.createElement('div');
  toastEl.className   = 'toast';
  toastEl.textContent = msg;
  document.body.appendChild(toastEl);

  // Força reflow antes de adicionar a classe de animação
  void toastEl.offsetWidth;
  toastEl.classList.add('show');

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => { toastEl?.remove(); toastEl = null; }, 350);
  }, 2600);
}

/* ── Inicialização final ─────────────────────────────────────── */

// Garante que todos os sliders estejam visualmente corretos ao carregar
document.querySelectorAll('.custom-slider').forEach(s => {
  const labelId = s.id.replace('slider-', '') + '-value';
  const label   = document.getElementById(labelId);
  syncSlider(s, label || null);
});