/* ============================================================
   script.js — Force Feedback Customization UI
   Lógica de sliders, segmented controls, perfis, jogos e CRUD
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

const segBtns = document.querySelectorAll('.seg-btn');
let sensacaoAsfalto = 'medio'; // valor padrão inicial

segBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    segBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sensacaoAsfalto = btn.dataset.value || btn.textContent.trim().toLowerCase();
    console.log('[Sensação Asfalto] Alterado para:', sensacaoAsfalto);
  });
});

/* ── Seletores de Perfil (Estrada, Pista, Drift) ─────────────── */

const profileBtns = document.querySelectorAll('.profile-btn');
let perfilAtivo   = 'estrada'; // valor padrão

profileBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    profileBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    perfilAtivo = btn.dataset.profile || btn.textContent.trim().toLowerCase();
    console.log('[Perfil] Alterado para:', perfilAtivo);
  });
});

/* ── Microcontrolador (Select customizado simulado) ──────────── */

const selectMicro = document.getElementById('select-microcontrolador');
if (selectMicro) {
  selectMicro.addEventListener('change', () => {
    console.log('[Microcontrolador] Selecionado:', selectMicro.value);
  });
}

/* ── Grade de Jogos: Seleção múltipla ───────────────────────── */

const gameCards = document.querySelectorAll('.game-card');
let jogosSelecionados = ['assetto-corsa']; // AC já vem ativo no HTML

gameCards.forEach(card => {
  card.addEventListener('click', () => {
    const gameId = card.dataset.game;
    const isSelected = card.classList.toggle('active');

    if (isSelected) {
      if (!jogosSelecionados.includes(gameId)) {
        jogosSelecionados.push(gameId);
      }
    } else {
      jogosSelecionados = jogosSelecionados.filter(id => id !== gameId);
    }
    console.log('[Jogos Selecionados]:', jogosSelecionados);
  });
});

/* ── Modal: Adicionar novo jogo simulado ─────────────────────── */

const btnAddGameCard = document.getElementById('btn-add-game-card');
const modalAddGame   = document.getElementById('modal-add-game');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSaveModal   = document.getElementById('btn-save-modal');
const inputNewGame   = document.getElementById('new-game-name');
const gamesGrid      = document.getElementById('games-grid');

if (btnAddGameCard && modalAddGame) {
  btnAddGameCard.addEventListener('click', () => {
    modalAddGame.removeAttribute('hidden');
    inputNewGame.focus();
  });

  btnCancelModal.addEventListener('click', () => {
    modalAddGame.setAttribute('hidden', '');
    inputNewGame.value = '';
  });

  btnSaveModal.addEventListener('click', () => {
    const nomeJogo = inputNewGame.value.trim();
    if (!nomeJogo) {
      showToast('⚠️ Digite o nome do jogo!');
      return;
    }

    const gameId = nomeJogo.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newCard = document.createElement('button');
    newCard.type = 'button';
    newCard.className = 'game-card active';
    newCard.dataset.game = gameId;
    newCard.innerHTML = `<span class="game-title">${nomeJogo}</span>`;

    gamesGrid.insertBefore(newCard, btnAddGameCard);
    jogosSelecionados.push(gameId);

    newCard.addEventListener('click', () => {
      const isSelected = newCard.classList.toggle('active');
      if (isSelected) {
        if (!jogosSelecionados.includes(gameId)) jogosSelecionados.push(gameId);
      } else {
        jogosSelecionados = jogosSelecionados.filter(id => id !== gameId);
      }
      console.log('[Jogos Selecionados]:', jogosSelecionados);
    });

    modalAddGame.setAttribute('hidden', '');
    inputNewGame.value = '';
    showToast(`✓ ${nomeJogo} adicionado!`);
  });
}

/* ── INTEGRAÇÃO COM O BANCO DE DADOS (CRUD) ─────────────────── */

const btnGerar = document.getElementById('btn-gerar');
let idPerfilAtual = null; // Guarda o ID do perfil ativo para Update e Delete

// Bloqueia duplicações limpando escutas antigas na memória do botão
if (btnGerar) {
  btnGerar.replaceWith(btnGerar.cloneNode(true));
}
const btnGerarNovo = document.getElementById('btn-gerar');

// 1. AÇÃO DE SALVAR (CREATE)
if (btnGerarNovo) {
  btnGerarNovo.addEventListener('click', () => {
    const perfil = {
      perfilJogador:    perfilAtivo,
      microcontrolador: selectMicro.value,
      potencia:         parseInt(sliderPotencia.value, 10),
      feedbackMotor:    parseInt(sliderMotor.value, 10),
      nivelAsfalto:     sensacaoAsfalto,
      jogos:            jogosSelecionados
    };

    console.log('[Force Feedback] Enviando perfil:', perfil);

    fetch('http://localhost:3000/api/perfis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil)
    })
    .then(response => response.json())
    .then(data => {
      if (data.id) {
        idPerfilAtual = data.id; // Guarda o ID retornado pelo MySQL
        showToast('✓ Perfil salvo no phpMyAdmin! ID: ' + data.id);
      } else {
        showToast('❌ Erro ao salvar: ' + data.error);
      }
    })
    .catch(error => {
      console.error(error);
      showToast('❌ Servidor offline. Ligue o node server.js!');
    });

    btnGerarNovo.style.transform = 'scale(0.97)';
    setTimeout(() => { btnGerarNovo.style.transform = ''; }, 180);
  });
}

// 2. AÇÃO DE ATUALIZAR (UPDATE)
const btnAtualizar = document.getElementById('btn-atualizar');
if (btnAtualizar) {
  btnAtualizar.addEventListener('click', () => {
    if (!idPerfilAtual) {
      showToast('⚠️ Salve um perfil primeiro antes de atualizar!');
      return;
    }

    const perfilModificado = {
      perfilJogador:    perfilAtivo,
      microcontrolador: selectMicro.value,
      potencia:         parseInt(sliderPotencia.value, 10),
      feedbackMotor:    parseInt(sliderMotor.value, 10),
      nivelAsfalto:     sensacaoAsfalto,
      jogos:            jogosSelecionados
    };

    fetch(`http://localhost:3000/api/perfis/${idPerfilAtual}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfilModificado)
    })
    .then(response => response.json())
    .then(data => {
      showToast('✓ Perfil atualizado com sucesso no banco!');
    })
    .catch(error => {
      console.error(error);
      showToast('❌ Erro ao atualizar.');
    });
  });
}

// 3. AÇÃO DE DELETAR (DELETE)
const btnDeletar = document.getElementById('btn-deletar');
if (btnDeletar) {
  btnDeletar.addEventListener('click', () => {
    if (!idPerfilAtual) {
      showToast('⚠️ Nenhum perfil ativo na tela para deletar!');
      return;
    }

    if (confirm('Tem certeza de que deseja eliminar esta configuração do phpMyAdmin?')) {
      fetch(`http://localhost:3000/api/perfis/${idPerfilAtual}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        showToast('🗑️ Perfil deletado do banco de dados!');
        idPerfilAtual = null; // Reseta o ID
      })
      .catch(error => {
        console.error(error);
        showToast('❌ Erro ao deletar.');
      });
    }
  });
}

/* ── Toast de notificação ────────────────────────────────────── */

let toastEl = null;
let toastTimer = null;

function showToast(msg) {
  if (toastEl) {
    toastEl.remove();
    clearTimeout(toastTimer);
  }

  toastEl = document.createElement('div');
  toastEl.className   = 'toast';
  toastEl.textContent = msg;
  document.body.appendChild(toastEl);

  void toastEl.offsetWidth;
  toastEl.classList.add('show');

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
    setTimeout(() => { toastEl?.remove(); toastEl = null; }, 350);
  }, 2600);
}

console.log('[Project Wheel UI] Módulo carregado com CRUD completo.');