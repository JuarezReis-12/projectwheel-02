/* ============================================================
   script.js — Projeto Wheel Landing Page
   Navbar scroll, Chart.js gráfico de pedal, animações, toast
   ============================================================ */

/* ── Navbar: scroll shrink + hamburger ──────────────────────── */

const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('nav-hamburger');
const navLinks    = document.getElementById('nav-links');
const allNavLinks = document.querySelectorAll('.nav-link');

// Highlight do link ativo ao clicar
allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    allNavLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    // Fecha menu mobile ao clicar
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Menu mobile toggle
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Efeito de scroll na navbar (adiciona sombra ao rolar)
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20
    ? '0 4px 24px rgba(0,0,0,0.5)'
    : 'none';
}, { passive: true });

/* ── Gráfico de curva do pedal (Chart.js) ───────────────────── */

/**
 * Cria o gráfico de curva de acionamento dos pedais.
 * Os pontos abaixo representam a curva exibida no PDF:
 * X: posição física do pedal (0–36)
 * Y: acionamento resultante (0–40)
 *
 * PERSONALIZAÇÃO: altere os arrays 'xPoints' e 'yPoints'
 * para mudar a forma da curva.
 */
function initPedalChart() {
  const canvas = document.getElementById('pedal-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Pontos da curva conforme o PDF
  const xPoints = [0, 5, 10, 27, 36];
  const yPoints = [0, 4, 8, 22, 40];

  // Gera pontos interpolados para uma curva suave
  const labels = [];
  const data   = [];

  for (let i = 0; i <= 36; i++) {
    labels.push(i);
    // Interpolação linear entre os pontos-chave
    let y = 0;
    for (let j = 0; j < xPoints.length - 1; j++) {
      if (i >= xPoints[j] && i <= xPoints[j + 1]) {
        const t = (i - xPoints[j]) / (xPoints[j + 1] - xPoints[j]);
        y = yPoints[j] + t * (yPoints[j + 1] - yPoints[j]);
        break;
      }
    }
    data.push(Math.round(y));
  }

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#4ade1e',
        borderWidth: 2.5,
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#4ade1e',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      plugins: { legend: { display: false }, tooltip: {
        backgroundColor: '#1c1c1c',
        borderColor: 'rgba(74,222,30,0.4)',
        borderWidth: 1,
        titleColor: '#9ca3af',
        bodyColor: '#4ade1e',
        callbacks: {
          title: ctx => `Posição: ${ctx[0].label}`,
          label: ctx => `Acionamento: ${ctx.parsed.y}`,
        }
      }},
      scales: {
        x: {
          display: true,
          ticks: {
            color: '#6b7280',
            font: { size: 9 },
            /* Mostra somente os pontos-chave */
            callback: (val, idx) => xPoints.includes(idx) ? idx : '',
            maxRotation: 0,
          },
          grid: { color: 'rgba(255,255,255,0.06)' },
          border: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          display: true,
          min: 0,
          max: 40,
          ticks: {
            color: '#6b7280',
            font: { size: 9 },
            stepSize: 10,
          },
          grid: { color: 'rgba(255,255,255,0.06)' },
          border: { color: 'rgba(255,255,255,0.1)' }
        }
      }
    }
  });
}

/* ── Contador animado para a stat de velocidade ─────────────── */

/**
 * Anima um número de 0 até o valor alvo.
 * @param {HTMLElement} el      - elemento que exibe o número
 * @param {number}      target  - valor final
 * @param {number}      duration - duração em ms
 */
function animateCounter(el, target, duration = 1200) {
  if (!el) return;
  const start = performance.now();
  const tick = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Easing ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ── IntersectionObserver: ativa animações ao entrar na view ── */

const observerOptions = { threshold: 0.25 };

const dashboardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Anima velocidade
      animateCounter(document.getElementById('stat-vel'), 280);
      dashboardObserver.disconnect();
    }
  });
}, observerOptions);

const dashEl = document.getElementById('dashboard');
if (dashEl) dashObserver: {
  dashboardObserver.observe(dashEl);
}

/* ── Botão "INICIAR AGORA" ──────────────────────────────────── */

const btnIniciar = document.getElementById('btn-iniciar');
if (btnIniciar) {
  btnIniciar.addEventListener('click', () => {
    showToast('✓ Simulador iniciado!');
  });
}

/* ── Botão "DOWNLOAD NOW" ───────────────────────────────────── */

const btnDownload = document.getElementById('btn-download');
if (btnDownload) {
  btnDownload.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('⬇ Download iniciado...');
    /*
      INTEGRAÇÃO DE DOWNLOAD:
      Substitua o preventDefault + showToast acima por:
      window.location.href = 'downloads/projeto-wheel-setup.exe';
      ou use fetch() para um endpoint de download seguro.
    */
  });
}

/* ── Animação sutil do volante (rotação ao hover) ───────────── */

const wheelImg = document.getElementById('wheel-img');
if (wheelImg) {
  let angle = 0;
  let animFrame;

  /*
    ANIMAÇÃO DO VOLANTE:
    A imagem do volante gira levemente ao passar o mouse.
    Substitua wheelImg.src pela imagem PNG real com transparência
    para o efeito ficar visível.
  */
  wheelImg.addEventListener('mouseenter', () => {
    cancelAnimationFrame(animFrame);
    const target = 12; // graus de rotação máxima
    const step = () => {
      if (angle < target) {
        angle += 0.8;
        wheelImg.style.transform = `rotate(${angle}deg)`;
        animFrame = requestAnimationFrame(step);
      }
    };
    step();
  });

  wheelImg.addEventListener('mouseleave', () => {
    cancelAnimationFrame(animFrame);
    const stepBack = () => {
      if (angle > 0) {
        angle -= 0.8;
        wheelImg.style.transform = `rotate(${Math.max(0, angle)}deg)`;
        animFrame = requestAnimationFrame(stepBack);
      } else {
        angle = 0;
        wheelImg.style.transform = '';
      }
    };
    stepBack();
  });

  wheelImg.style.transition = 'transform 0.05s linear';
}

/* ── Toast ──────────────────────────────────────────────────── */

let toastEl    = document.getElementById('toast');
let toastTimer = null;

/**
 * Exibe uma mensagem de toast temporária.
 * @param {string} msg
 * @param {number} duration - ms antes de desaparecer
 */
function showToast(msg, duration = 2600) {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

/* ── Init ───────────────────────────────────────────────────── */

// Aguarda Chart.js carregar antes de inicializar o gráfico
document.addEventListener('DOMContentLoaded', () => {
  // Pequeno delay para garantir que Chart.js (defer) esteja pronto
  setTimeout(initPedalChart, 100);
});