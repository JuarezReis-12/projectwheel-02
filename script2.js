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
let sensacaoAsfalto = 'medio'; // valor padrão inicial coincidente com a classe .active no HTML

segBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove .active de todos os botões do grupo
    segBtns.forEach(b => b.classList.remove('active'));
    // Adiciona .active ao clicado
    btn.classList.add('active');
    
    // Armazena a escolha (ex: 'baixo', 'medio', 'alto')
    sensacaoAsfalto = btn.dataset.value || btn.textContent.trim().toLowerCase();
    console.log('[Sensação Asfalto] Alterado para:', sensacaoAsfalto);
  });
});

/* ── Seletores de Perfil (Estrada, Pista, Drift) ─────────────── */

const profileBtns = document.querySelectorAll('.profile-btn');
let perfilAtivo   = 'estrada'; // valor padrão coincidente com .active

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
  // Abrir Modal
  btnAddGameCard.addEventListener('click', () => {
    modalAddGame.removeAttribute('hidden');
    inputNewGame.focus();
  });

  // Fechar Modal (Cancelar)
  btnCancelModal.addEventListener('click', () => {
    modalAddGame.setAttribute('hidden', '');
    inputNewGame.value = '';
  });

  // Salvar Novo Jogo
  btnSaveModal.addEventListener('click', () => {
    const nomeJogo = inputNewGame.value.trim();
    if (!nomeJogo) {
      showToast('⚠️ Digite o nome do jogo!');
      return;
    }

    // Cria um ID simples slugificado para o dataset
    const gameId = nomeJogo.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Cria o elemento novo card na árvore
    const newCard = document.createElement('button');
    newCard.type = 'button';
    newCard.className = 'game-card active'; // Já nasce selecionado
    newCard.dataset.game = gameId;
    newCard.innerHTML = `
      <span class="game-title">${nomeJogo}</span>
    `;

    // Insere na lista antes do botão de adicionar
    gamesGrid.insertBefore(newCard, btnAddGameCard);
    
    // Adiciona o id à lista de selecionados
    jogosSelecionados.push(gameId);

    // Adiciona o listener de clique para este novo botão dinâmico
    newCard.addEventListener('click', () => {
      const isSelected = newCard.classList.toggle('active');
      if (isSelected) {
        if (!jogosSelecionados.includes(gameId)) jogosSelecionados.push(gameId);
      } else {
        jogosSelecionados = jogosSelecionados.filter(id => id !== gameId);
      }
      console.log('[Jogos Selecionados]:', jogosSelecionados);
    });

    // Fecha e limpa
    modalAddGame.setAttribute('hidden', '');
    inputNewGame.value = '';
    showToast(`✓ ${nomeJogo} adicionado!`);
    console.log('[Jogos Selecionados após inserção]:', jogosSelecionados);
  });
}

/* ── Evento do botão Gerar Perfil Integrado ao Banco de Dados ── */

const btnGerar = document.getElementById('btn-gerar');

btnGerar.addEventListener('click', () => {
  // Cria o objeto contendo o estado atual da UI
  const perfil = {
    perfilJogador:    perfilAtivo,
    microcontrolador: selectMicro.value,
    potencia:         parseInt(sliderPotencia.value, 10),
    feedbackMotor:    parseInt(sliderMotor.value, 10),
    nivelAsfalto:     sensacaoAsfalto,
    jogos:            jogosSelecionados
  };

  console.log('[Force Feedback] Perfil gerado:', perfil);

  
  // DISPARA OS DADOS PARA O BACKEND (PORTA 3000)
  
  fetch('http://localhost:3000/api/perfis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(perfil)
  })
  .then(response => response.json())
  .then(data => {
    if (data.id) {
      // Exibe o toast com o ID vindo direto do phpMyAdmin
      showToast('✓ Perfil salvo ID: ' + data.id);
    } else {
      showToast('❌ Erro ao salvar: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Erro ao conectar ao servidor Node.js:', error);
    showToast('❌ Servidor offline. Ligue o node server.js!');
  });
  // ==========================================================

  // Anima o botão brevemente
  btnGerar.style.transform = 'scale(0.97)';
  setTimeout(() => { btnGerar.style.transform = ''; }, 180);
});

// VARIÁVEL GLOBAL PARA GUARDAR O ID DO PERFIL ATUAL
let idPerfilAtual = null;

/* ── Modificação do btnGerar  para salvar o id ── */
btnGerar.addEventListener('click', () => {
  const perfil = {
    perfilJogador:    perfilAtivo,
    microcontrolador: selectMicro.value,
    potencia:         parseInt(sliderPotencia.value, 10),
    feedbackMotor:    parseInt(sliderMotor.value, 10),
    nivelAsfalto:     sensacaoAsfalto,
    jogos:            jogosSelecionados
  };

  fetch('http://localhost:3000/api/perfis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil)
  })
  .then(response => response.json())
  .then(data => {
    if (data.id) {
      idPerfilAtual = data.id; // Guarda o ID gerado pelo banco de dados!
      showToast('✓ Perfil salvo no phpMyAdmin! ID: ' + data.id);
    } else {
      showToast('❌ Erro ao salvar: ' + data.error);
    }
  })
  .catch(error => {
    console.error(error);
    showToast('❌ Servidor offline.');
  });
});

/*  FUNCIONALIDADE DE UPDATE (ATUALIZAR O PERFIL NO BANCO)  */

const btnAtualizar = document.getElementById('btn-atualizar');
btnAtualizar.addEventListener('click', () => {
  if (!idPerfilAtual) {
    showToast('⚠️ Salve um perfil primeiro antes de atualizar!');
    return;
  }

  // Captura os dados atuais dos sliders modificados na tela
  const perfilModificado = {
    perfilJogador:    perfilAtivo,
    microcontrolador: selectMicro.value,
    potencia:         parseInt(sliderPotencia.value, 10),
    feedbackMotor:    parseInt(sliderMotor.value, 10),
    nivelAsfalto:     sensacaoAsfalto,
    jogos:            jogosSelecionados
  };

  // Envia os dados usando o método PUT e o ID armazenado
  fetch(`http://localhost:3000/api/perfis/${idPerfilAtual}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfilModificado)
  })
  .then(response => response.json())
  .then(data => {
    showToast('✓ ' + data.message);
  })
  .catch(error => {
    console.error(error);
    showToast('❌ Erro ao atualizar no servidor.');
  });
});

/*FUNCIONALIDADE DE DELETE (DELETAR O PERFIL DO BANCO) */
const btnDeletar = document.getElementById('btn-deletar');
btnDeletar.addEventListener('click', () => {
  if (!idPerfilAtual) {
    showToast('⚠️ Nenhum perfil ativo na tela para deletar!');
    return;
  }

  if (confirm('Tem certeza de que deseja deletar permanentemente esta configuração do banco de dados?')) {
    // Envia o comando DELETE usando o ID armazenado
    fetch(`http://localhost:3000/api/perfis/${idPerfilAtual}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      showToast('🗑️ ' + data.message);
      idPerfilAtual = null; // Limpa o ID da tela, pois ele não existe mais no banco
    })
    .catch(error => {
      console.error(error);
      showToast('❌ Erro ao deletar no servidor.');
    });
  }
});

/* ── Toast de notificação */

let toastEl = null;
let toastTimer = null;

/* Exibe uma mensagem toast na parte inferior da tela.
 @param {string} msg */
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

/* ── Inicialização final */
console.log('[Project Wheel UI] Módulo carregado e pronto.');