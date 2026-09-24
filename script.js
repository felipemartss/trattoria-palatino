/* ── Menu Mobile (Hambúrguer) ── */
function toggleMobileMenu() {
  const links   = document.getElementById('nav-links');
  const btn     = document.getElementById('nav-hamburger');
  const overlay = document.getElementById('nav-overlay');

  if (links.classList.contains('open')) {
    closeMobileMenu();
  } else {
    links.classList.add('open');
    btn.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  document.getElementById('nav-links').classList.remove('open');
  document.getElementById('nav-hamburger').classList.remove('open');
  document.getElementById('nav-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', function () {

  /* Fecha o menu ao clicar em qualquer link interno */
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* Smooth scroll em todos os links âncora */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileMenu();

      const href = a.getAttribute('href');

      setTimeout(function () {
        if (href === '#') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const t = document.querySelector(href);
          if (t) t.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300); // aguarda o menu fechar antes de rolar
    });
  });

});

/* ── Busca (nav) ── */
function toggleSearch(forceOpen) {
  const wrap  = document.getElementById('nav-search');
  const input = document.getElementById('nav-search-input');
  if (!wrap || !input) return;

  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !wrap.classList.contains('active');

  if (shouldOpen) {
    wrap.classList.add('active');
    setTimeout(function () { input.focus(); }, 50);
  } else {
    wrap.classList.remove('active');
    input.value = '';
    input.classList.remove('no-results');
    input.blur();
  }
}

/* Fecha a busca ao clicar fora dela */
document.addEventListener('click', function (e) {
  const wrap = document.getElementById('nav-search');
  if (wrap && wrap.classList.contains('active') && !wrap.contains(e.target)) {
    toggleSearch(false);
  }
});

/* Ativa a aba do cardápio (almoço/jantar) pelo id do pane, sem precisar de um evento de clique */
function activateMenuPaneByName(paneId) {
  const panes = document.getElementsByClassName('menu-pane');
  for (let i = 0; i < panes.length; i++) panes[i].classList.remove('active');

  const tabBtns = document.getElementsByClassName('tab-btn');
  for (let i = 0; i < tabBtns.length; i++) tabBtns[i].classList.remove('active');

  const targetPane = document.getElementById(paneId);
  if (targetPane) targetPane.classList.add('active');

  const targetTab = document.querySelector('.tab-btn[data-pane="' + paneId + '"]');
  if (targetTab) targetTab.classList.add('active');
}

/* Remove acentos e caixa para comparação de busca (ex: "FILÉ" ~ "file") */
function normalizeSearchText(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/* Busca um prato pelo nome no cardápio (almoço + jantar) */
function searchMenu(query) {
  const input    = document.getElementById('nav-search-input');
  const term     = normalizeSearchText(query.trim());
  const original = input.getAttribute('placeholder');
  if (!term) return;

  const paneIds = ['menu-almoco', 'menu-jantar'];
  let found = null;

  for (let p = 0; p < paneIds.length; p++) {
    const grid = document.getElementById(paneIds[p] + '-grid');
    if (!grid) continue;
    const cards = grid.querySelectorAll('.menu-card');
    for (let i = 0; i < cards.length; i++) {
      const title = cards[i].querySelector('.menu-card-title');
      if (title && normalizeSearchText(title.textContent).includes(term)) {
        found = { paneId: paneIds[p], index: i, card: cards[i] };
        break;
      }
    }
    if (found) break;
  }

  if (!found) {
    input.value = '';
    input.classList.add('no-results');
    input.setAttribute('placeholder', 'Nenhum prato encontrado');
    setTimeout(function () {
      input.classList.remove('no-results');
      input.setAttribute('placeholder', original);
    }, 1800);
    return;
  }

  activateMenuPaneByName(found.paneId);
  carouselGoTo(found.paneId, found.index);

  const menuSection = document.getElementById('menu');
  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });

  found.card.classList.add('search-highlight');
  setTimeout(function () { found.card.classList.remove('search-highlight'); }, 2800);

  toggleSearch(false);
}

/* ── Reserva ── */

/* Horário de funcionamento por dia da semana (0 = domingo ... 6 = sábado) */
const HORARIO_FUNCIONAMENTO = {
  0: { almoco: false, jantar: true,  fechaJantar: '23:30' }, // domingo
  1: { almoco: true,  jantar: false, fechaAlmoco: '14:00' }, // segunda
  2: { almoco: true,  jantar: true,  fechaAlmoco: '14:00', fechaJantar: '23:00' }, // terça
  3: { almoco: true,  jantar: true,  fechaAlmoco: '14:00', fechaJantar: '23:00' }, // quarta
  4: { almoco: true,  jantar: true,  fechaAlmoco: '14:00', fechaJantar: '23:00' }, // quinta
  5: { almoco: true,  jantar: true,  fechaAlmoco: '14:00', fechaJantar: '23:30' }, // sexta
  6: { almoco: true,  jantar: true,  fechaAlmoco: '14:00', fechaJantar: '23:30' }, // sábado
};

/* Converte o valor de um <input type="date"> (YYYY-MM-DD) em Date local,
   evitando o problema de fuso horário do new Date('YYYY-MM-DD') (que lê como UTC) */
function parseDataLocal(valor) {
  const partes = valor.split('-').map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function hojeLocalISO() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, '0');
  const d = String(hoje.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

/* Máscara de telefone: (xx) xxxxx-xxxx ou (xx) xxxx-xxxx enquanto o usuário digita */
function maskPhoneInput(input) {
  let digits = input.value.replace(/\D/g, '').slice(0, 11);

  let formatted = digits;
  if (digits.length > 0) formatted = '(' + digits.slice(0, 2);
  if (digits.length >= 3) formatted += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
  if (digits.length > 6 && digits.length <= 10) formatted += '-' + digits.slice(6, 10);
  if (digits.length > 10) formatted += '-' + digits.slice(7, 11);

  input.value = formatted;
}

/* Valida o padrão final do telefone brasileiro: (xx) xxxx-xxxx ou (xx) xxxxx-xxxx */
function validarTelefone(valor) {
  const digits = valor.replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  // Celular (11 dígitos) precisa começar com 9 após o DDD
  if (digits.length === 11 && digits[2] !== '9') return false;
  return true;
}

function showFieldError(fieldId, errId, msg) {
  document.getElementById(fieldId).classList.add('has-error');
  document.getElementById(errId).textContent = msg;
}

function clearFieldError(fieldId, errId) {
  document.getElementById(fieldId).classList.remove('has-error');
  document.getElementById(errId).textContent = '';
}

function clearAllFieldErrors() {
  ['nome', 'tel', 'data', 'hora', 'pax'].forEach(function (key) {
    clearFieldError('field-' + key, 'err-' + key);
  });
}

/* Atualiza as opções de horário disponíveis de acordo com o dia da semana escolhido */
function updateHorarioOptions() {
  const dataInput    = document.getElementById('f-data');
  const horaSelect   = document.getElementById('f-hora');
  const grupoAlmoco  = document.getElementById('grupo-almoco');
  const grupoJantar  = document.getElementById('grupo-jantar');
  const placeholder  = horaSelect.querySelector('option[value=""]');

  horaSelect.value = '';
  clearFieldError('field-data', 'err-data');
  clearFieldError('field-hora', 'err-hora');
  Array.from(horaSelect.querySelectorAll('option')).forEach(function (opt) { opt.disabled = false; });

  if (!dataInput.value) {
    horaSelect.disabled = true;
    placeholder.textContent = 'Selecione a data primeiro';
    grupoAlmoco.hidden = false;
    grupoJantar.hidden = false;
    return;
  }

  const hojeISO = hojeLocalISO();
  if (dataInput.value < hojeISO) {
    showFieldError('field-data', 'err-data', 'Escolha uma data a partir de hoje.');
    horaSelect.disabled = true;
    return;
  }

  const dataEscolhida = parseDataLocal(dataInput.value);
  const diaSemana = dataEscolhida.getDay();
  const info = HORARIO_FUNCIONAMENTO[diaSemana];
  const isHoje = dataInput.value === hojeISO;
  const agora = new Date();

  grupoAlmoco.hidden = !info.almoco;
  grupoJantar.hidden = !info.jantar;

  // Se for hoje, desabilita horários que já passaram
  if (isHoje) {
    Array.from(horaSelect.querySelectorAll('option')).forEach(function (opt) {
      if (!opt.value) return;
      const [h, m] = opt.value.split(':').map(Number);
      const horarioOpt = new Date(dataEscolhida);
      horarioOpt.setHours(h, m, 0, 0);
      if (horarioOpt <= agora) opt.disabled = true;
    });
  }

  const temOpcaoDisponivel = Array.from(horaSelect.querySelectorAll('option'))
    .some(function (opt) { return opt.value && !opt.disabled && !opt.closest('optgroup').hidden; });

  if (!temOpcaoDisponivel) {
    showFieldError('field-data', 'err-data', 'O restaurante já encerrou o expediente para esta data. Escolha outra data ou horário.');
    horaSelect.disabled = true;
    return;
  }

  horaSelect.disabled = false;
  placeholder.textContent = 'Selecione';
}

async function submitReserva() {
  clearAllFieldErrors();

  const nome       = document.getElementById('f-nome').value.trim();
  const telInput   = document.getElementById('f-tel');
  const tel        = telInput.value.trim();
  const dataInput  = document.getElementById('f-data');
  const data       = dataInput.value;
  const horaSelect = document.getElementById('f-hora');
  const hora       = horaSelect.value;
  const pax        = document.getElementById('f-pax').value;
  const API_URL = 'https://trattoriapalatino.up.railway.app';

  let valido = true;

  if (!nome) {
    showFieldError('field-nome', 'err-nome', 'Informe seu nome.');
    valido = false;
  }

  if (!tel) {
    showFieldError('field-tel', 'err-tel', 'Informe um telefone para contato.');
    valido = false;
  } else if (!validarTelefone(tel)) {
    showFieldError('field-tel', 'err-tel', 'Telefone inválido. Use o formato (xx) 9xxxx-xxxx.');
    valido = false;
  }

  if (!data) {
    showFieldError('field-data', 'err-data', 'Selecione uma data.');
    valido = false;
  } else if (data < hojeLocalISO()) {
    showFieldError('field-data', 'err-data', 'Escolha uma data a partir de hoje.');
    valido = false;
  }

  if (data && !document.getElementById('field-data').classList.contains('has-error')) {
    if (!hora) {
      showFieldError('field-hora', 'err-hora', 'Selecione um horário.');
      valido = false;
    } else {
      const opt = Array.from(horaSelect.querySelectorAll('option')).find(function (o) { return o.value === hora; });
      if (!opt || opt.disabled || opt.closest('optgroup').hidden) {
        showFieldError('field-hora', 'err-hora', 'O restaurante não está aberto nesse horário.');
        valido = false;
      }
    }
  }

  if (!pax) {
    showFieldError('field-pax', 'err-pax', 'Selecione o número de pessoas.');
    valido = false;
  }

  if (!valido) return;

  const obs = document.getElementById('f-obs').value.trim();
  const btn = document.querySelector('.submit-btn');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const resposta = await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        telefone: tel,
        data: data,
        horario: hora,
        pessoas: pax,
        observacoes: obs
      })
    });
    const resultado = await resposta.json();
    if (!resultado.ok) throw new Error(resultado.erro);

    document.getElementById('success-msg').style.display = 'block';
    document.getElementById('f-nome').value = '';
    document.getElementById('f-tel').value = '';
    document.getElementById('f-data').value = '';
    document.getElementById('f-hora').value = '';
    document.getElementById('f-pax').value = '';
    document.getElementById('f-obs').value = '';
    updateHorarioOptions();
  } catch (erro) {
    alert(erro.message || 'Não foi possível enviar sua reserva agora. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirmar Reserva';
  }
}

/* Define o mínimo do seletor de data como hoje (impede datas passadas no calendário nativo) */
document.addEventListener('DOMContentLoaded', function () {
  const dataInput = document.getElementById('f-data');
  if (dataInput) dataInput.min = hojeLocalISO();
});


// Função para alternar as abas do cardápio
function openMenu(evt, menuName) {
  const panes = document.getElementsByClassName("menu-pane");
  for (let i = 0; i < panes.length; i++) {
    panes[i].classList.remove("active");
  }

  const tabBtns = document.getElementsByClassName("tab-btn");
  for (let i = 0; i < tabBtns.length; i++) {
    tabBtns[i].classList.remove("active");
  }

  document.getElementById(menuName).classList.add("active");
  evt.currentTarget.classList.add("active");

  carouselGoTo(menuName, 0);
}

/* ── Carrossel (mobile: 1 por vez | desktop: 5 por página) ── */
const carouselState = {};

function isMobile() {
  return window.innerWidth <= 768;
}

function getCardCount(paneId) {
  const grid = document.getElementById(paneId + '-grid');
  return grid ? grid.querySelectorAll('.menu-card').length : 0;
}

function getPerPage() {
  return isMobile() ? 1 : 5;
}

function carouselGoTo(paneId, index) {
  const total   = getCardCount(paneId);
  const perPage = getPerPage();
  const maxIdx  = total - perPage;

  index = Math.max(0, Math.min(index, maxIdx));
  carouselState[paneId] = index;

  const grid = document.getElementById(paneId + '-grid');
  if (grid) {
    const pct = (100 / total) * index;
    grid.style.transform = `translateX(-${pct}%)`;
  }

  updateArrows(paneId, index, maxIdx);
  updateDots(paneId, index);
}

function updateArrows(paneId, index, maxIdx) {
  const wrapper = document.querySelector(`#${paneId} .menu-carousel-wrapper`);
  if (!wrapper) return;
  const prev = wrapper.querySelector('.carousel-prev');
  const next = wrapper.querySelector('.carousel-next');
  if (prev) prev.style.opacity = index === 0     ? '0.3' : '1';
  if (next) next.style.opacity = index >= maxIdx ? '0.3' : '1';
}

function updateDots(paneId, index) {
  const dotsContainer = document.getElementById(paneId + '-dots');
  if (!dotsContainer) return;
  const dots = dotsContainer.querySelectorAll('.dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
}

function carouselNext(paneId) {
  const current = carouselState[paneId] || 0;
  carouselGoTo(paneId, current + 1);
}

function carouselPrev(paneId) {
  const current = carouselState[paneId] || 0;
  carouselGoTo(paneId, current - 1);
}

/* Init + swipe por toque */
document.addEventListener('DOMContentLoaded', function () {
  ['menu-almoco', 'menu-jantar'].forEach(function (paneId) {
    carouselState[paneId] = 0;
    carouselGoTo(paneId, 0);

    const grid = document.getElementById(paneId + '-grid');
    if (!grid) return;

    let startX = 0;
    let isDragging = false;

    grid.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    grid.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) carouselNext(paneId);
        else carouselPrev(paneId);
      }
    }, { passive: true });
  });

  window.addEventListener('resize', function () {
    ['menu-almoco', 'menu-jantar'].forEach(function (paneId) {
      carouselGoTo(paneId, carouselState[paneId] || 0);
    });
  });
});