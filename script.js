const armorData = {
  verdad: {
    label: 'PIEZA 01',
    title: 'Cinturón de la Verdad',
    text: 'La mentira desordena; la verdad afirma. La batalla comienza cuando dejas de negociar con engaños y permites que la verdad de Dios gobierne lo que piensas, dices y decides.',
    quote: '“Estad, pues, firmes, ceñidos vuestros lomos con la verdad...”',
    reference: 'Efesios 6:14'
  },
  justicia: {
    label: 'PIEZA 02',
    title: 'Coraza de Justicia',
    text: 'La justicia de Cristo protege tu identidad de la condenación, mientras una vida recta evita que la desobediencia abra grietas innecesarias. No peleas desde tu perfección, sino desde la obra de Jesús.',
    quote: '“...y vestidos con la coraza de justicia.”',
    reference: 'Efesios 6:14'
  },
  evangelio: {
    label: 'PIEZA 03',
    title: 'Calzado del Evangelio',
    text: 'El evangelio te da estabilidad para avanzar sin perder la paz. Quien conoce las buenas noticias de Cristo no necesita reaccionar con pánico ante cada conflicto.',
    quote: '“...calzados los pies con el apresto del evangelio de la paz.”',
    reference: 'Efesios 6:15'
  },
  fe: {
    label: 'PIEZA 04',
    title: 'Escudo de la Fe',
    text: 'La fe no niega el ataque: decide en quién confiar mientras llegan los dardos. Levantar el escudo es responder a la acusación, el temor y la duda desde el carácter de Dios.',
    quote: '“Sobre todo, tomad el escudo de la fe...”',
    reference: 'Efesios 6:16'
  },
  salvacion: {
    label: 'PIEZA 05',
    title: 'Yelmo de la Salvación',
    text: 'La mente necesita recordar de quién eres y qué hizo Cristo por ti. La seguridad de la salvación combate pensamientos que intentan convertir una caída, una acusación o una temporada difícil en tu identidad.',
    quote: '“Y tomad el yelmo de la salvación...”',
    reference: 'Efesios 6:17'
  },
  palabra: {
    label: 'PIEZA 06',
    title: 'Espada del Espíritu',
    text: 'La Palabra de Dios no es una frase decorativa para repetir sin entender. Es verdad revelada y aplicada correctamente. Jesús respondió a la tentación con Escritura bien usada, no con espectáculo.',
    quote: '“...y la espada del Espíritu, que es la palabra de Dios.”',
    reference: 'Efesios 6:17'
  }
};

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.classList.toggle('open');
  mainNav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  document.body.style.overflow = open ? 'hidden' : '';
});

mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle?.classList.remove('open');
    mainNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

const armorButtons = document.querySelectorAll('.armor-item');
const armorDetail = document.getElementById('armorDetail');

armorButtons.forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.armor;
    const item = armorData[key];
    if (!item || !armorDetail) return;

    armorButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');

    armorDetail.animate(
      [
        { opacity: 0.25, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: 320, easing: 'ease-out' }
    );

    armorDetail.innerHTML = `
      <p class="detail-label">${item.label}</p>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <blockquote>${item.quote}<span>${item.reference}</span></blockquote>
    `;
  });
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -35px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

const canvas = document.getElementById('particles');
const ctx = canvas?.getContext('2d');
let particles = [];
let frameId;
let width = 0;
let height = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
}

function createParticles() {
  const count = Math.min(90, Math.max(34, Math.floor(width / 18)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.3 + 0.25,
    speed: Math.random() * 0.12 + 0.025,
    drift: (Math.random() - 0.5) * 0.05,
    alpha: Math.random() * 0.32 + 0.08
  }));
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
      if (p.y < -4) {
        p.y = height + 4;
        p.x = Math.random() * width;
      }
      if (p.x < -4) p.x = width + 4;
      if (p.x > width + 4) p.x = -4;
    }
  });

  if (!reducedMotion) frameId = requestAnimationFrame(drawParticles);
}

if (canvas && ctx) {
  resizeCanvas();
  drawParticles();
  window.addEventListener('resize', resizeCanvas, { passive: true });
}

window.addEventListener('beforeunload', () => {
  if (frameId) cancelAnimationFrame(frameId);
});
