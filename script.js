const armorData = {
  verdad: {
    label: 'PIEZA 01 · VERDAD',
    title: 'Cinturón de la Verdad',
    text: 'La mentira desordena; la verdad afirma. La batalla comienza cuando dejas de negociar con engaños y permites que la verdad de Dios gobierne lo que piensas, dices y decides.',
    application: 'Identifica una mentira que has aceptado y compárala con lo que realmente enseña la Escritura.',
    quote: '“Estad, pues, firmes, ceñidos vuestros lomos con la verdad...”',
    reference: 'Efesios 6:14'
  },
  justicia: {
    label: 'PIEZA 02 · JUSTICIA',
    title: 'Coraza de Justicia',
    text: 'La justicia de Cristo protege tu identidad de la condenación, mientras una vida recta evita que la desobediencia abra grietas innecesarias. No peleas desde tu perfección, sino desde la obra de Jesús.',
    application: 'Revisa si hay una desobediencia concreta que necesitas confesar, reparar o abandonar en vez de atribuir toda presión a un ataque externo.',
    quote: '“...y vestidos con la coraza de justicia.”',
    reference: 'Efesios 6:14'
  },
  evangelio: {
    label: 'PIEZA 03 · EVANGELIO',
    title: 'Calzado del Evangelio',
    text: 'El evangelio te da estabilidad para avanzar sin perder la paz. Quien conoce las buenas noticias de Cristo no necesita reaccionar con pánico ante cada conflicto.',
    application: 'Antes de responder a una situación tensa, recuerda el evangelio: eres recibido por gracia, reconciliado en Cristo y llamado a caminar en paz.',
    quote: '“...calzados los pies con el apresto del evangelio de la paz.”',
    reference: 'Efesios 6:15'
  },
  fe: {
    label: 'PIEZA 04 · FE',
    title: 'Escudo de la Fe',
    text: 'La fe no niega el ataque: decide en quién confiar mientras llegan los dardos. Levantar el escudo es responder a la acusación, el temor y la duda desde el carácter de Dios.',
    application: 'Nombra el temor que más presión ejerce hoy y responde con una razón bíblica para confiar en el carácter de Dios.',
    quote: '“Sobre todo, tomad el escudo de la fe...”',
    reference: 'Efesios 6:16'
  },
  salvacion: {
    label: 'PIEZA 05 · SALVACIÓN',
    title: 'Yelmo de la Salvación',
    text: 'La mente necesita recordar de quién eres y qué hizo Cristo por ti. La seguridad de la salvación combate pensamientos que intentan convertir una caída, una acusación o una temporada difícil en tu identidad.',
    application: 'Distingue entre convicción y condenación. La convicción de Dios te llama a volver; la condenación pretende encerrarte en una identidad de fracaso.',
    quote: '“Y tomad el yelmo de la salvación...”',
    reference: 'Efesios 6:17'
  },
  palabra: {
    label: 'PIEZA 06 · PALABRA',
    title: 'Espada del Espíritu',
    text: 'La Palabra de Dios no es una frase decorativa para repetir sin entender. Es verdad revelada y aplicada correctamente. Jesús respondió a la tentación con Escritura bien usada, no con espectáculo.',
    application: 'Busca el contexto del pasaje que estás usando. La espada se maneja mejor cuando la Escritura se interpreta antes de aplicarse.',
    quote: '“...y la espada del Espíritu, que es la palabra de Dios.”',
    reference: 'Efesios 6:17'
  }
};

const discernmentData = {
  tentacion: {
    meta: 'ESCENARIO 01',
    title: 'Tentación recurrente',
    lead: 'La Biblia no enseña a culpar a un demonio por cada deseo desordenado. También habla de nuestra responsabilidad, de huir, renovar la mente y cortar provisión al pecado.',
    question: '¿Qué estoy alimentando, justificando o dejando sin límites?',
    response: 'Confesar, huir de la ocasión, renovar hábitos y buscar acompañamiento maduro.',
    scripture: 'Santiago 1:14–15 · 2 Timoteo 2:22'
  },
  herida: {
    meta: 'ESCENARIO 02',
    title: 'Herida o agotamiento',
    lead: 'Cansancio, duelo, trauma, ansiedad o dolor pueden afectar profundamente la forma en que percibes una situación. Espiritualizarlo todo puede impedir que recibas el cuidado que realmente necesitas.',
    question: '¿Estoy descansando, procesando el dolor y pidiendo ayuda adecuada?',
    response: 'Orar, descansar, hablar con personas maduras y buscar atención profesional cuando corresponda.',
    scripture: '1 Reyes 19:4–8 · Proverbios 11:14'
  },
  conflicto: {
    meta: 'ESCENARIO 03',
    title: 'Conflicto humano',
    lead: 'Una conversación mal llevada, límites débiles, orgullo, expectativas no expresadas o decisiones distintas pueden producir tensión real sin que exista una causa demoníaca detrás de cada desacuerdo.',
    question: '¿Qué parte me corresponde reconocer, aclarar, reparar o limitar?',
    response: 'Hablar con verdad y gracia, escuchar, pedir perdón cuando toca y establecer límites responsables.',
    scripture: 'Mateo 5:23–24 · Romanos 12:18'
  },
  oposicion: {
    meta: 'ESCENARIO 04',
    title: 'Oposición espiritual',
    lead: 'La Escritura sí reconoce oposición espiritual real. La respuesta bíblica, sin embargo, no es entrar en pánico: es someterse a Dios, permanecer firmes, orar y resistir desde la verdad.',
    question: '¿Mi respuesta está produciendo sobriedad, obediencia y fe, o me está llevando a miedo y obsesión?',
    response: 'Someterse a Dios, resistir firmes en la fe, usar la Palabra correctamente y perseverar en oración.',
    scripture: 'Santiago 4:7 · 1 Pedro 5:8–9'
  }
};

const levelData = {
  1: {
    kicker: 'NIVEL 1 · FUNDAMENTOS',
    title: 'Conoce tu posición antes de estudiar la guerra.',
    text: 'Este nivel construye la base: identidad, naturaleza de la batalla, autoridad en Cristo, oración y el uso responsable de la Escritura.',
    metrics: [['5', 'LECCIONES'], ['BASE', 'BÍBLICA'], ['01', 'RUTA']],
    lessons: [
      ['01', 'La naturaleza de la batalla', 'Qué es y qué no es guerra espiritual.'],
      ['02', 'Identidad y posición en Cristo', 'Pelear desde la obra terminada de Jesús.'],
      ['03', 'Autoridad espiritual', 'Autoridad bíblica sin espectáculo.'],
      ['04', 'Oración y vigilancia', 'Orar con sobriedad, fe y perseverancia.'],
      ['05', 'La Palabra en la batalla', 'Interpretar antes de declarar.']
    ]
  },
  2: {
    kicker: 'NIVEL 2 · ESTRATEGIA',
    title: 'Aprende a reconocer patrones antes de responder.',
    text: 'Aquí la formación avanza hacia inteligencia espiritual: estrategias invisibles, emboscadas, fortalezas y respuesta bíblica sin caer en especulación.',
    metrics: [['5', 'LECCIONES'], ['NIVEL', 'INTERMEDIO'], ['02', 'RUTA']],
    lessons: [
      ['06', 'Inteligencia del enemigo', 'Reconocer métodos sin magnificar al adversario.'],
      ['07', 'Estrategias invisibles', 'Patrones que buscan desviar, cansar o dividir.'],
      ['08', 'Emboscadas', 'Detectar momentos de vulnerabilidad y presión.'],
      ['09', 'Fortalezas', 'Mentiras, hábitos y estructuras de pensamiento.'],
      ['10', 'Contraataques', 'Responder bíblicamente después de identificar el patrón.']
    ]
  },
  3: {
    kicker: 'NIVEL 3 · PUERTAS Y DERECHOS',
    title: 'Cierra accesos sin convertir la vida en superstición.',
    text: 'El nivel avanzado estudia puertas, derechos, alimentación espiritual, cierres reales y sustituciones, manteniendo el lenguaje bajo el control de la Escritura y la responsabilidad personal.',
    metrics: [['5', 'LECCIONES'], ['NIVEL', 'AVANZADO'], ['03', 'RUTA']],
    lessons: [
      ['11', 'Puertas', 'Cómo entender accesos y vulnerabilidades con base bíblica.'],
      ['12', 'Derechos legales', 'Qué significa realmente y qué exageraciones debemos evitar.'],
      ['13', 'Alimento espiritual', 'Lo que fortalece patrones, hábitos y opresión.'],
      ['14', 'Cierre real', 'Arrepentimiento, obediencia, límites y perseverancia.'],
      ['15', 'Sustituciones', 'Cuando se cierra una puerta y aparece otra forma de negociación.']
    ]
  }
};

const dailyData = [
  {
    label: 'IDENTIDAD',
    title: 'Recuerda desde dónde peleas',
    text: 'Antes de analizar el problema, vuelve a tu identidad en Cristo. La presión no tiene permiso para definir quién eres.',
    verse: '“Con Cristo estoy juntamente crucificado...”',
    reference: 'Gálatas 2:20',
    practice: 'Escribe una mentira que te esté presionando y responde con una verdad bíblica concreta.'
  },
  {
    label: 'VERDAD',
    title: 'Separa hechos de interpretaciones',
    text: 'Una situación puede ser difícil sin que toda interpretación que haces de ella sea verdadera. La sobriedad examina antes de concluir.',
    verse: '“Examinadlo todo; retened lo bueno.”',
    reference: '1 Tesalonicenses 5:21',
    practice: 'Divide una hoja en dos: “lo que sé” y “lo que estoy suponiendo”. No mezcles ambas columnas.'
  },
  {
    label: 'OBEDIENCIA',
    title: 'Haz lo próximo que ya sabes',
    text: 'A veces pedimos una estrategia nueva mientras ignoramos una instrucción sencilla que ya entendimos.',
    verse: '“Sed hacedores de la palabra, y no tan solamente oidores...”',
    reference: 'Santiago 1:22',
    practice: 'Identifica una obediencia concreta pendiente y ejecútala hoy: pedir perdón, poner un límite, ordenar un hábito o cumplir tu palabra.'
  },
  {
    label: 'FE',
    title: 'Responde al miedo con confianza',
    text: 'La fe no exige sentir seguridad perfecta. Decide dónde descansa tu confianza mientras tus emociones todavía están procesando la presión.',
    verse: '“En el día que temo, yo en ti confío.”',
    reference: 'Salmo 56:3',
    practice: 'Nombra tu temor principal y escribe debajo una razón bíblica para confiar en Dios aun si el escenario no cambia hoy.'
  },
  {
    label: 'PALABRA',
    title: 'Usa la Escritura con contexto',
    text: 'Una frase bíblica fuera de contexto puede sonar poderosa y aun así estar mal aplicada. La verdad se honra interpretándola bien.',
    verse: '“Procura con diligencia presentarte a Dios aprobado...”',
    reference: '2 Timoteo 2:15',
    practice: 'Escoge un versículo que usas mucho. Lee el capítulo completo y resume qué quiso comunicar realmente el autor.'
  },
  {
    label: 'PAZ',
    title: 'No tomes decisiones desde el pánico',
    text: 'Urgencia emocional no siempre significa urgencia espiritual. La paz de Cristo ayuda a pensar, escuchar y actuar sin precipitación.',
    verse: '“Y la paz de Dios... guardará vuestros corazones y vuestros pensamientos...”',
    reference: 'Filipenses 4:7',
    practice: 'Pospone una reacción impulsiva. Ora, descansa si puedes y vuelve a revisar la decisión cuando tengas mayor claridad.'
  },
  {
    label: 'PERSEVERANCIA',
    title: 'Permanece cuando no hay espectáculo',
    text: 'La firmeza se forma en decisiones repetidas. No todo avance espiritual viene acompañado de una experiencia intensa.',
    verse: '“...habiendo acabado todo, estar firmes.”',
    reference: 'Efesios 6:13',
    practice: 'Elige una disciplina pequeña que puedas repetir durante la próxima semana y comprométete con constancia, no con emoción.'
  }
];

const qs = selector => document.querySelector(selector);
const qsa = selector => [...document.querySelectorAll(selector)];

const menuToggle = qs('#menuToggle');
const mainNav = qs('#mainNav');
const siteHeader = qs('.site-header');

function closeMenu() {
  menuToggle?.classList.remove('open');
  mainNav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menú');
  document.body.classList.remove('menu-open');
}

menuToggle?.addEventListener('click', () => {
  const open = !menuToggle.classList.contains('open');
  menuToggle.classList.toggle('open', open);
  mainNav?.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.classList.toggle('menu-open', open);
});

mainNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

function updateHeader() {
  siteHeader?.classList.toggle('scrolled', window.scrollY > 18);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Active navigation section
const navLinks = qsa('.main-nav a[href^="#"]');
const navTargets = navLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  navTargets.forEach(section => navObserver.observe(section));
}

// Armor
const armorButtons = qsa('.armor-item');
const armorDetail = qs('#armorDetail');

function renderArmor(key) {
  const item = armorData[key];
  if (!item || !armorDetail) return;
  armorDetail.innerHTML = `
    <p class="detail-label">${item.label}</p>
    <h3>${item.title}</h3>
    <p>${item.text}</p>
    <div class="armor-application"><small>APLICACIÓN</small><p>${item.application}</p></div>
    <blockquote>${item.quote}<span>${item.reference}</span></blockquote>
  `;
}

armorButtons.forEach(button => {
  button.addEventListener('click', () => {
    armorButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    renderArmor(button.dataset.armor);
    armorDetail?.animate(
      [{ opacity: .2, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, easing: 'ease-out' }
    );
  });
});

// Discernment room
const discernTabs = qsa('.discernment-tab');
const discernStage = qs('#discernmentStage');

function renderDiscernment(key) {
  const item = discernmentData[key];
  if (!item || !discernStage) return;
  discernStage.innerHTML = `
    <div class="stage-topline"><span>${item.meta}</span><b>PRIMERA RESPUESTA</b></div>
    <h3>${item.title}</h3>
    <p class="stage-lead">${item.lead}</p>
    <div class="response-grid">
      <div><small>PREGUNTA CLAVE</small><p>${item.question}</p></div>
      <div><small>RESPUESTA BÍBLICA</small><p>${item.response}</p></div>
    </div>
    <span class="stage-scripture">${item.scripture}</span>
  `;
}

discernTabs.forEach(button => {
  button.addEventListener('click', () => {
    discernTabs.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    renderDiscernment(button.dataset.discern);
    discernStage?.animate(
      [{ opacity: .25, transform: 'translateX(8px)' }, { opacity: 1, transform: 'translateX(0)' }],
      { duration: 280, easing: 'ease-out' }
    );
  });
});

// Course levels
const trainingTabs = qsa('.training-tab');
const levelStage = qs('#levelStage');

function renderLevel(level) {
  const item = levelData[level];
  if (!item || !levelStage) return;
  const metrics = item.metrics.map(([value, label]) => `<span><b>${value}</b>${label}</span>`).join('');
  const lessons = item.lessons.map(([number, title, desc]) => `
    <li><span>${number}</span><div><strong>${title}</strong><small>${desc}</small></div></li>
  `).join('');
  levelStage.innerHTML = `
    <div class="level-summary">
      <span class="level-kicker">${item.kicker}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <div class="level-metrics">${metrics}</div>
    </div>
    <ol class="lesson-list">${lessons}</ol>
  `;
}

trainingTabs.forEach(button => {
  button.addEventListener('click', () => {
    trainingTabs.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    renderLevel(button.dataset.level);
    levelStage?.animate(
      [{ opacity: .3, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 300, easing: 'ease-out' }
    );
  });
});

// Daily guard with local progress
const dailyDate = qs('#dailyDate');
const dailyNumber = qs('#dailyNumber');
const dailyLabel = qs('#dailyLabel');
const dailyTitle = qs('#dailyTitle');
const dailyText = qs('#dailyText');
const dailyVerse = qs('#dailyVerse');
const dailyPractice = qs('#dailyPractice');
const dailyComplete = qs('#dailyComplete');
const progressCount = qs('#progressCount');
const progressPercent = qs('#progressPercent');
const progressRing = qs('#progressRing');
const weekDots = qs('#weekDots');
const resetProgress = qs('#resetProgress');

const PROGRESS_KEY = 'mirmc-guerra-espiritual-guardia-v1';
const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 0);
const dayOfYear = Math.floor((now - startOfYear) / 86400000);
const dailyIndex = ((dayOfYear - 1) % dailyData.length + dailyData.length) % dailyData.length;
const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

function readProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeProgress(progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch {}
}

function renderDaily() {
  const item = dailyData[dailyIndex];
  const formatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });
  if (dailyDate) dailyDate.textContent = formatter.format(now).toUpperCase();
  if (dailyNumber) dailyNumber.textContent = `DÍA ${dailyIndex + 1} DE 7`;
  if (dailyLabel) dailyLabel.textContent = item.label;
  if (dailyTitle) dailyTitle.textContent = item.title;
  if (dailyText) dailyText.textContent = item.text;
  if (dailyVerse) dailyVerse.innerHTML = `${item.verse} <span>${item.reference}</span>`;
  if (dailyPractice) dailyPractice.textContent = item.practice;
  renderProgress();
}

function renderProgress() {
  const progress = readProgress();
  const currentWeek = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now);
    date.setDate(now.getDate() - dailyIndex + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const completed = currentWeek.filter(key => progress[key]).length;
  const pct = Math.round((completed / 7) * 100);
  if (progressCount) progressCount.textContent = `${completed}/7`;
  if (progressPercent) progressPercent.textContent = `${pct}%`;
  if (progressRing) progressRing.style.setProperty('--progress', `${pct * 3.6}deg`);
  if (dailyComplete) {
    const done = Boolean(progress[todayKey]);
    dailyComplete.classList.toggle('is-complete', done);
    dailyComplete.innerHTML = done ? 'Entrenamiento completado <span>✓</span>' : 'Marcar entrenamiento completado <span>✓</span>';
  }
  if (weekDots) {
    weekDots.innerHTML = currentWeek.map((key, index) => {
      const classes = ['week-dot'];
      if (progress[key]) classes.push('done');
      if (index === dailyIndex) classes.push('today');
      return `<span class="${classes.join(' ')}" title="Día ${index + 1}">${index + 1}</span>`;
    }).join('');
  }
}

dailyComplete?.addEventListener('click', () => {
  const progress = readProgress();
  progress[todayKey] = !progress[todayKey];
  writeProgress(progress);
  renderProgress();
});

resetProgress?.addEventListener('click', () => {
  const progress = readProgress();
  const currentWeekKeys = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(now);
    date.setDate(now.getDate() - dailyIndex + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  currentWeekKeys.forEach(key => delete progress[key]);
  writeProgress(progress);
  renderProgress();
});

renderDaily();

// Reveal animation with safe fallback
const revealElements = qsa('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach(el => el.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));
}

const year = qs('#year');
if (year) year.textContent = new Date().getFullYear();

// Lightweight particles. Reduced density on small screens to protect mobile performance.
const canvas = qs('#particles');
const ctx = canvas?.getContext('2d');
let particles = [];
let frameId = 0;
let width = 0;
let height = 0;
let resizeTimer = 0;

function createParticles() {
  const mobile = width < 600;
  const count = mobile ? 28 : Math.min(72, Math.max(38, Math.floor(width / 24)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.25 + .25,
    speed: Math.random() * .1 + .02,
    drift: (Math.random() - .5) * .04,
    alpha: Math.random() * .28 + .07
  }));
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(225, 202, 136, ${p.alpha})`;
    ctx.fill();
    if (!reducedMotion) {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
      if (p.x < -4) p.x = width + 4;
      if (p.x > width + 4) p.x = -4;
    }
  });
  if (!reducedMotion && !document.hidden) frameId = requestAnimationFrame(drawParticles);
}

function restartParticles() {
  if (!canvas || !ctx) return;
  cancelAnimationFrame(frameId);
  resizeCanvas();
  drawParticles();
}

if (canvas && ctx) {
  restartParticles();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(restartParticles, 140);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frameId);
    else drawParticles();
  });
}

window.addEventListener('beforeunload', () => cancelAnimationFrame(frameId));
