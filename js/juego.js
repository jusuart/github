/* ==========================================================
   monster_days – Lógica del front-end
   Navegación entre pantallas, HUD, canvas y eventos.
   v3: misiones de 5/10/15/25 oleadas, mejoras, minijefes, jefe final, dificultad en mapas.
   ========================================================== */
'use strict';

/* ---------- Constantes y datos ---------- */
const TAM = 60, COLS = 16, FILAS = 9;
// Oleadas por misión (igual en ambos mapas)
const OLEADAS_NIVEL = { 1: 5, 2: 10, 3: 15, 4: 25 };
const MINIJEFE_CADA = 5;      // un minijefe cada 5 oleadas
const JEFE_PASO = 300;        // el jefe final lanza su ataque cada 300 px recorridos
const JEFE_ALCANCE = 280;     // alcance de su ataque de sueño
const JEFE_TORRES = 3;        // torretas que duerme
const JEFE_SUENO = 4;         // segundos que duermen
const JEFE_CARGA = 1.2;       // segundos que se detiene a lanzar el ataque
const PROB_CRITICO = 0.25;    // probabilidad de golpe crítico (x2)
const REEMBOLSO = 0.3;   // al eliminar una torreta se devuelve el 30 %

const MAPAS = {
  base:     { nombre: 'Mapa Base',     mult: 1,   niveles: ['Camino del Bosque', 'Puente del Troll', 'Desfiladero Sombrío', 'Fortaleza Maldita'] },
  infernal: { nombre: 'Mapa Infernal', mult: 1.2, niveles: ['Senda de Cenizas', 'Puente de Magma', 'Garganta Ardiente', 'Trono del Averno'] },
};

const NIVELES = {
  1: { monedas: 160, ruta: [[0,4],[5,4],[5,1],[10,1],[10,6],[15,6]] },
  2: { monedas: 160, ruta: [[0,1],[3,1],[3,7],[8,7],[8,2],[12,2],[12,7],[15,7]] },
  3: { monedas: 170, ruta: [[0,7],[4,7],[4,2],[7,2],[7,6],[11,6],[11,1],[15,1]] },
  4: { monedas: 180, ruta: [[0,4],[2,4],[2,1],[6,1],[6,7],[9,7],[9,3],[13,3],[13,7],[15,7]] },
};

const TORRES = {
  // Balance v4: cuanto más cara, más daño por segundo y más alcance (110 → 210).
  arquero:   { nombre: 'Arquero',   costo: 45,  alcance: 110, dano: 10, cd: 0.6,  color: '#5f9a3a', info: 'Disparo rápido, daño bajo, alcance corto.' },
  dardero:   { nombre: 'Dardero',   costo: 60,  alcance: 130, dano: 9,  cd: 0.8,  color: '#2fa58a', info: 'Poco daño directo, pero envenena (7 por segundo durante 4 s).', veneno: { dps: 7, dur: 4 } },
  mago:      { nombre: 'Mago',      costo: 80,  alcance: 150, dano: 22, cd: 1.1,  color: '#8e5ad1', info: 'Hechizo de buen daño que además ralentiza al enemigo.', lento: 1.6 },
  catapulta: { nombre: 'Catapulta', costo: 100, alcance: 175, dano: 60, cd: 1.8,  color: '#94622f', info: 'Gran daño en área, recarga lenta.', area: 62, vel: 330 },
  lasser:    { nombre: 'Lasser',    costo: 200, alcance: 215, dano: 95, cd: 1.8,  color: '#3fd0e8', info: 'Lanza 2 bolitas de energía devastadoras y llega muy lejos.', bolitas: 2, vel: 560 },
};
// Ordenadas por precio: Arquero 45 · Dardero 60 · Mago 80 · Catapulta 100 · Lasser 200
const ORDEN_TORRES = ['arquero', 'dardero', 'mago', 'catapulta', 'lasser', 'vender'];

// Mejoras globales (se compran una vez por misión y afectan a todas las torretas)
const MEJORAS = {
  velocidad: { nombre: 'Velocidad de ataque', costo: 300 },   // +50 % de velocidad de ataque
  dano:      { nombre: 'Daño',                costo: 300 },   // +50 % de daño
  critico:   { nombre: 'Crítico',             costo: 250 },   // 25 % de probabilidad de hacer el doble
};

const ENEMIGOS = {
  goblin: { vida: 32,   vel: 75, oro: 8,   dano: 1, r: 11, color: '#6aa84f', pie: '#3f6b2c', paso: 14 },
  orco:   { vida: 80,   vel: 52, oro: 13,  dano: 1, r: 14, color: '#a06a3c', pie: '#5c3a1e', paso: 10 },
  troll:  { vida: 240,  vel: 34, oro: 30,  dano: 3, r: 19, color: '#5f7d8c', pie: '#34464f', paso: 7 },
  ogro:   { vida: 900,  vel: 26, oro: 120, dano: 8, r: 25, color: '#8a3f3a', pie: '#4a1f1c', paso: 5 },   // minijefe (cada 5 oleadas)
  jefe:   { vida: 2800, vel: 22, oro: 400, dano: 999, r: 34, color: '#5b2f86', pie: '#2a1640', paso: 4 },   // jefe final (última oleada)
};

const TEMAS = {
  base: {
    suelo: ['#41602f', '#3b5929', '#476a33'], ruta: ['#8a6a43', '#7f6039', '#94744b'],
    borde: '#5a4328',
  },
  infernal: {
    suelo: ['#7a1f14', '#6f1a11', '#86261a'], ruta: ['#3a2d2b', '#33271f', '#42332f'],
    borde: '#ff7a1f',
  },
};

const VIDA_BASE = 20;
const VELOCIDADES = [1, 2, 3];   // botón de velocidad del juego
let velocidad = 1;
const CLAVE_PROGRESO = 'monster_days_progreso';
const CLAVE_ESTRELLAS = 'monster_days_estrellas';
const estrellas = {};   // 'mapa-nivel' -> 1..3
let textoCompartir = '';

/* ---------- Referencias al DOM ---------- */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const canvas = $('#juego');
const ctx = canvas.getContext('2d');

const ui = {
  vida: $('#meter-vida'), txtVida: $('#txt-vida'),
  monedas: $('#txt-monedas'),
  oleada: $('#prog-oleada'), txtOleada: $('#txt-oleada'),
  nivel: $('#txt-nivel'), mapa: $('#txt-mapa'),
  mensaje: $('#mensaje'), info: $('#info-torre'),
  btnOleada: $('#btn-oleada'),
  pausa: $('#pausa'), victoria: $('#victoria'), derrota: $('#derrota'),
  tituloNiveles: $('#titulo-niveles'),
};

/* ---------- Estado ---------- */
const progreso = { base: 1, infernal: 1 };   // nivel máximo desbloqueado por mapa
let mapaActual = 'base';
const opciones = { volumen: 0.5, sonido: true, dificultad: 1 };   // la dificultad se elige en la pantalla de mapas
let juego = null;      // estado de la partida en curso
let fondo = null;      // canvas con el mapa ya dibujado
let ultimo = 0;
let audioCtx = null;
let idEnemigo = 0;

/* ==========================================================
   Navegación entre pantallas
   ========================================================== */
function mostrar(id) {
  $$('.pantalla').forEach((p) => { p.hidden = (p.id !== id); });
  const titulo = $('#' + id + ' h1, #' + id + ' h2');
  if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
  if (id === 'niveles') actualizarNiveles();
  if (id === 'mapas') actualizarMapas();
}

$$('[data-ir]').forEach((b) => b.addEventListener('click', () => {
  sonido(440, 0.06, 'square');
  if (juego) juego.activo = false;
  mostrar(b.dataset.ir);
}));

$('#btn-salir').addEventListener('click', () => {
  sonido(300, 0.12, 'sawtooth');
  ui.mensaje.textContent = '';
  alert('Gracias por jugar monster_days. Puedes cerrar la pestaña del navegador.');
});

/* ---------- Progreso, mapas y niveles ---------- */
function cargarProgreso() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO));
    if (guardado) {
      ['base', 'infernal'].forEach((m) => {
        const v = parseInt(guardado[m], 10);
        if (v >= 1 && v <= 4) progreso[m] = v;
      });
    } else {
      // Compatibilidad con la versión anterior (un solo mapa)
      const viejo = parseInt(localStorage.getItem('monster_days_nivel_max'), 10);
      if (viejo >= 1 && viejo <= 4) progreso.base = viejo;
    }
  } catch (e) { /* almacenamiento no disponible */ }
}
function cargarEstrellas() {
  try { Object.assign(estrellas, JSON.parse(localStorage.getItem(CLAVE_ESTRELLAS)) || {}); } catch (e) { /* ignorar */ }
}
function guardarEstrellas() {
  try { localStorage.setItem(CLAVE_ESTRELLAS, JSON.stringify(estrellas)); } catch (e) { /* ignorar */ }
}
function textoEstrellas(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
function totalEstrellas(m) { return [1, 2, 3, 4].reduce((a, n) => a + (estrellas[m + '-' + n] || 0), 0); }
function copiarTexto(txt) {
  // Método clásico: funciona también abriendo index.html desde el disco (file://)
  const ta = document.createElement('textarea');
  ta.value = txt; ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  ta.remove();
  return ok;
}
function compartir() {
  const url = location.protocol.startsWith('http') ? ' ' + location.href : '';
  const texto = textoCompartir + url;
  const aviso = (t) => { $$('.btn-compartir').forEach((b) => { b.textContent = t; setTimeout(() => { b.textContent = '📣 Compartir'; }, 2200); }); };
  if (copiarTexto(texto)) { aviso('✔ ¡Copiado! Pégalo en tu chat'); return; }
  // Alternativa: abrir WhatsApp con el mensaje
  window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  aviso('📣 Compartir');
}
$$('.btn-compartir').forEach((b) => b.addEventListener('click', compartir));

function guardarProgreso() {
  try { localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso)); } catch (e) { /* ignorar */ }
}

function elegirMapa(m) {
  mapaActual = m;
  document.body.dataset.mapa = m;
  ui.tituloNiveles.textContent = 'Elige tu batalla · ' + MAPAS[m].nombre;
  mostrar('niveles');
}
$$('[data-mapa]').forEach((b) => b.addEventListener('click', () => { sonido(480, 0.08, 'triangle'); elegirMapa(b.dataset.mapa); }));

function actualizarMapas() {
  document.body.dataset.mapa = '';
  $('#prog-base').textContent = 'Misiones desbloqueadas: ' + progreso.base + '/4';
  $('#prog-infernal').textContent = 'Misiones desbloqueadas: ' + progreso.infernal + '/4';
  $('#est-base').textContent = '★ ' + totalEstrellas('base') + '/12';
  $('#est-infernal').textContent = '★ ' + totalEstrellas('infernal') + '/12';
}

function actualizarNiveles() {
  const max = progreso[mapaActual];
  $$('[data-nivel]').forEach((b) => {
    const n = Number(b.dataset.nivel);
    const bloqueado = n > max;
    b.disabled = bloqueado;
    b.textContent = bloqueado ? 'Bloqueado' : 'Jugar misión ' + n;
    const tarjeta = b.closest('.tarjeta-nivel');
    tarjeta.classList.toggle('bloqueada', bloqueado);
    tarjeta.querySelector('h3').textContent = MAPAS[mapaActual].niveles[n - 1];
    const e = tarjeta.querySelector('.estrellas-nivel');
    if (e) e.textContent = textoEstrellas(estrellas[mapaActual + '-' + n] || 0);
  });
}
$$('[data-nivel]').forEach((b) => b.addEventListener('click', () => iniciarNivel(Number(b.dataset.nivel))));

/* ---------- Opciones ---------- */
$('#opt-volumen').addEventListener('input', (e) => {
  opciones.volumen = e.target.value / 100;
  $('#out-volumen').textContent = e.target.value;
  sonido(520, 0.08, 'triangle');
});
$('#opt-sonido').addEventListener('change', (e) => { opciones.sonido = e.target.checked; });
$$('input[name="dificultad"]').forEach((r) => r.addEventListener('change', () => {
  if (r.checked) { opciones.dificultad = Number(r.value); sonido(520, 0.06, 'triangle'); }
}));

/* ==========================================================
   Sonido (Web Audio, sin archivos externos)
   ========================================================== */
function sonido(freq, dur, tipo) {
  if (!opciones.sonido || opciones.volumen === 0) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gan = audioCtx.createGain();
    osc.type = tipo || 'sine';
    osc.frequency.value = freq;
    gan.gain.value = 0.12 * opciones.volumen;
    gan.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.connect(gan); gan.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio no disponible */ }
}

/* ==========================================================
   Partida
   ========================================================== */
function iniciarNivel(n) {
  const cfg = NIVELES[n];
  const nombre = MAPAS[mapaActual].niveles[n - 1];
  const puntos = [];
  const ruta = cfg.ruta;
  ruta.forEach(([c, f]) => puntos.push({ x: c * TAM + TAM / 2, y: f * TAM + TAM / 2 }));
  puntos.unshift({ x: -30, y: puntos[0].y });
  puntos.push({ x: COLS * TAM + 30, y: puntos[puntos.length - 1].y });

  juego = {
    nivel: n, mapa: mapaActual, nombre, cfg, puntos,
    celdasRuta: celdasDeRuta(ruta),
    vida: VIDA_BASE, monedas: cfg.monedas, oleada: 0, oleadas: OLEADAS_NIVEL[n],
    jefeVivo: false, jefeMuerto: false, jefeLlego: false,
    mejoras: { velocidad: false, dano: false, critico: false }, aviso: null,
    enemigos: [], torres: [], proyectiles: [], particulas: [], cola: [], aparecer: 0,
    oleadaActiva: false, pausado: false, activo: true, terminado: false,
    sel: null, hover: null, muertos: 0, t: 0,
    brasas: Array.from({ length: 34 }, (_, i) => ({
      x: (i * 197) % (COLS * TAM), y: (i * 83) % (FILAS * TAM),
      v: 14 + (i % 7) * 5, fase: i * 1.7, r: 1 + (i % 3) * 0.7,
    })),
  };
  fondo = dibujarFondo(juego);
  ui.vida.max = VIDA_BASE;
  ui.oleada.max = juego.oleadas;
  ui.nivel.textContent = n;
  ui.mapa.textContent = MAPAS[mapaActual].nombre;
  ui.mensaje.textContent = nombre + ' (' + MAPAS[mapaActual].nombre + '). Construye tus torres y pulsa "Iniciar oleada".';
  mostrarPestana('torres');
  seleccionarTorre(null);
  actualizarHUD();
  [ui.pausa, ui.victoria, ui.derrota].forEach((d) => { if (d.open) d.close(); });
  velocidad = 1; $('#btn-vel').textContent = '⏩ x1';
  mostrar('partida');
  sonido(392, 0.15, 'triangle');
}

function celdasDeRuta(ruta) {
  const set = new Set();
  for (let i = 0; i < ruta.length - 1; i++) {
    let [c0, f0] = ruta[i]; const [c1, f1] = ruta[i + 1];
    const dc = Math.sign(c1 - c0), df = Math.sign(f1 - f0);
    while (c0 !== c1 || f0 !== f1) { set.add(c0 + ',' + f0); c0 += dc; f0 += df; }
    set.add(c1 + ',' + f1);
  }
  return set;
}

/* ---------- Oleadas (5 / 10 / 15 / 25 según la misión) ---------- */
function iniciarOleada() {
  if (!juego || juego.oleadaActiva || juego.oleada >= juego.oleadas || juego.terminado) return;
  juego.oleada++;
  const n = juego.oleada, cant = 4 + n * 2 + juego.nivel;
  juego.cola = [];
  for (let i = 0; i < cant; i++) {
    let tipo = 'goblin';
    if (n >= 16 && i % 3 === 0) tipo = 'troll';
    else if (n >= 5 && i % 5 === 4) tipo = 'troll';
    else if (n >= 9 && i % 2 === 1) tipo = 'orco';
    else if (n >= 2 && i % 3 === 2) tipo = 'orco';
    juego.cola.push(tipo);
  }
  // Minijefe cada 5 oleadas y jefe final en la última
  const final = n === juego.oleadas;
  const mini = !final && n % MINIJEFE_CADA === 0;
  if (final) juego.cola.push('jefe');
  else if (mini) juego.cola.push('ogro');
  juego.aparecer = 0;
  juego.oleadaActiva = true;
  const extra = final ? ' ¡JEFE FINAL!' : mini ? ' ¡Llega un minijefe!' : '';
  ui.mensaje.textContent = 'Oleada ' + n + ' de ' + juego.oleadas + ': ¡vienen ' + juego.cola.length + ' monstruos!' + extra;
  if (final || mini) juego.aviso = { texto: final ? '¡JEFE FINAL!' : '¡MINIJEFE!', color: final ? '#c79bff' : '#ffd27a', t: 2.6 };
  sonido(final ? 70 : mini ? 90 : 200, final ? 0.6 : 0.3, 'sawtooth');
  actualizarHUD();
}

function crearEnemigo(tipo) {
  const d = ENEMIGOS[tipo];
  const mult = (1 + (juego.nivel - 1) * 0.2 + (juego.oleada - 1) * 0.08) * opciones.dificultad * MAPAS[juego.mapa].mult;
  const p = juego.puntos[0];
  juego.enemigos.push({
    id: idEnemigo++, tipo, x: p.x, y: p.y, seg: 1, ang: 0, prog: 0,
    vida: d.vida * mult, max: d.vida * mult,
    lento: 0, veneno: 0, venenoDps: 0, muerto: false, llego: false, camino: 0, lanzando: 0,
  });
  if (tipo === 'jefe') juego.jefeVivo = true;
}

/* ---------- Torres ---------- */
function seleccionarTorre(tipo) {
  if (juego) juego.sel = (juego.sel === tipo ? null : tipo);
  const sel = juego ? juego.sel : null;
  $$('.boton-torre').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.torre === sel)));
  if (sel === 'vender') {
    ui.info.textContent = 'Eliminar torreta: haz clic en una torre para quitarla. Recuperas el 30 % de lo que costó.';
  } else if (sel) {
    const t = TORRES[sel];
    const dps = Math.round(t.dano * (t.bolitas || 1) / t.cd);
    ui.info.textContent = t.nombre + ' (' + t.costo + ' monedas) · Daño ' + t.dano + (t.bolitas ? ' x' + t.bolitas : '') + ' · ~' + dps + '/s · Alcance ' + t.alcance + '. ' + t.info + ' Haz clic en una casilla libre.';
  } else {
    ui.info.textContent = 'Elige una torre para construir.';
  }
}
$$('.boton-torre').forEach((b) => b.addEventListener('click', () => { sonido(500, 0.05, 'square'); seleccionarTorre(b.dataset.torre); }));

function celdaLibre(c, f) {
  if (c < 0 || f < 0 || c >= COLS || f >= FILAS) return false;
  if (juego.celdasRuta.has(c + ',' + f)) return false;
  return !juego.torres.some((t) => t.c === c && t.f === f);
}

function chispas(x, y, color, n, vel) {
  for (let i = 0; i < n && juego.particulas.length < 300; i++) {
    const a = Math.random() * 6.283, v = (0.4 + Math.random()) * (vel || 60);
    juego.particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vida: 0.45, max: 0.45, color, r: 1.5 + Math.random() * 1.8 });
  }
}
function textoFlotante(x, y, texto, color) {
  juego.particulas.push({ x, y, vx: 0, vy: -28, vida: 0.9, max: 0.9, color, texto });
}
function anillo(x, y, radio, color) {
  juego.particulas.push({ x, y, vx: 0, vy: 0, vida: 0.35, max: 0.35, color, anillo: radio });
}

function construir(c, f) {
  const tipo = juego.sel;
  if (!tipo) { ui.mensaje.textContent = 'Primero elige una torre en el panel.'; return; }
  if (tipo === 'vender') { eliminarTorre(c, f); return; }
  const def = TORRES[tipo];
  if (!celdaLibre(c, f)) { ui.mensaje.textContent = 'No puedes construir en esa casilla.'; sonido(150, 0.15, 'square'); return; }
  if (juego.monedas < def.costo) { ui.mensaje.textContent = 'No tienes monedas suficientes.'; sonido(150, 0.15, 'square'); return; }
  juego.monedas -= def.costo;
  const x = c * TAM + TAM / 2, y = f * TAM + TAM / 2;
  juego.torres.push({ tipo, c, f, x, y, cd: 0, ang: -Math.PI / 2, retro: 0, dormida: 0, invertido: def.costo });
  anillo(x, y, 30, '#f2cf72');
  ui.mensaje.textContent = def.nombre + ' construido.';
  sonido(330, 0.1, 'triangle');
  actualizarHUD();
}

function eliminarTorre(c, f) {
  const i = juego.torres.findIndex((t) => t.c === c && t.f === f);
  if (i < 0) { ui.mensaje.textContent = 'Ahí no hay ninguna torre que eliminar.'; sonido(150, 0.15, 'square'); return; }
  const t = juego.torres[i];
  const devuelto = Math.floor(t.invertido * REEMBOLSO);
  juego.monedas += devuelto;
  juego.torres.splice(i, 1);
  chispas(t.x, t.y, '#b9a98c', 14, 90);
  textoFlotante(t.x, t.y - 16, '+' + devuelto, '#f2cf72');
  ui.mensaje.textContent = TORRES[t.tipo].nombre + ' eliminado: recuperas ' + devuelto + ' monedas (30 %).';
  sonido(260, 0.12, 'sawtooth');
  actualizarHUD();
}

/* ---------- Pestañas del panel y mejoras ---------- */
function mostrarPestana(nombre) {
  $$('[data-pestana]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.pestana === nombre)));
  $('#vista-torres').hidden = nombre !== 'torres';
  $('#vista-mejoras').hidden = nombre !== 'mejoras';
  ui.info.hidden = nombre !== 'torres';
  if (nombre !== 'torres' && juego && juego.sel) seleccionarTorre(juego.sel);   // quita la selección
}
$$('[data-pestana]').forEach((b) => b.addEventListener('click', () => { sonido(500, 0.05, 'square'); mostrarPestana(b.dataset.pestana); }));

function comprarMejora(clave) {
  const m = MEJORAS[clave];
  if (!juego || juego.terminado || juego.mejoras[clave]) return;
  if (juego.monedas < m.costo) { ui.mensaje.textContent = 'Necesitas ' + m.costo + ' monedas para esta mejora.'; sonido(150, 0.15, 'square'); return; }
  juego.monedas -= m.costo;
  juego.mejoras[clave] = true;
  juego.torres.forEach((t) => anillo(t.x, t.y, 30, '#8ff3ff'));
  ui.mensaje.textContent = 'Mejora comprada: ' + m.nombre + '.';
  sonido(660, 0.2, 'triangle');
  actualizarHUD();
}
$$('[data-mejora]').forEach((b) => b.addEventListener('click', () => comprarMejora(b.dataset.mejora)));

/* ---------- Entrada (ratón / táctil) ---------- */
function celdaDesdeEvento(e) {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width);
  const y = (e.clientY - r.top) * (canvas.height / r.height);
  return { c: Math.floor(x / TAM), f: Math.floor(y / TAM) };
}
canvas.addEventListener('pointermove', (e) => { if (juego) juego.hover = celdaDesdeEvento(e); });
canvas.addEventListener('pointerleave', () => { if (juego) juego.hover = null; });
canvas.addEventListener('pointerdown', (e) => {
  if (!juego || juego.pausado || juego.terminado) return;
  const { c, f } = celdaDesdeEvento(e);
  juego.hover = { c, f };
  construir(c, f);
});

document.addEventListener('keydown', (e) => {
  if (!juego || $('#partida').hidden || juego.terminado) return;
  if (e.key === 'Escape' && !ui.pausa.open) { e.preventDefault(); pausar(); return; }
  const i = Number(e.key) - 1;
  if (i >= 0 && i < ORDEN_TORRES.length) seleccionarTorre(ORDEN_TORRES[i]);
});

/* ---------- Pausa y diálogos ---------- */
function pausar() {
  if (!juego || juego.terminado || juego.pausado) return;
  juego.pausado = true;
  if (!ui.pausa.open) ui.pausa.showModal();
}
function reanudar() {
  if (!juego) return;
  juego.pausado = false;
  if (ui.pausa.open) ui.pausa.close();
}
$('#btn-pausa').addEventListener('click', pausar);
$('#btn-oleada').addEventListener('click', iniciarOleada);
$('#btn-vel').addEventListener('click', () => {
  velocidad = VELOCIDADES[(VELOCIDADES.indexOf(velocidad) + 1) % VELOCIDADES.length];
  $('#btn-vel').textContent = '⏩ x' + velocidad;
  sonido(500 + velocidad * 120, 0.06, 'square');
});
$('#p-continuar').addEventListener('click', reanudar);
ui.pausa.addEventListener('close', () => { if (juego) juego.pausado = false; });   // Esc dentro del diálogo
$('#p-reiniciar').addEventListener('click', () => iniciarNivel(juego.nivel));
$('#p-menu').addEventListener('click', () => volverMenu());
$('#v-repetir').addEventListener('click', () => iniciarNivel(juego.nivel));
$('#v-siguiente').addEventListener('click', () => iniciarNivel(Math.min(juego.nivel + 1, 4)));
$('#v-menu').addEventListener('click', () => volverMenu());
$('#d-reintentar').addEventListener('click', () => iniciarNivel(juego.nivel));
$('#d-menu').addEventListener('click', () => volverMenu());

function volverMenu() {
  [ui.pausa, ui.victoria, ui.derrota].forEach((d) => { if (d.open) d.close(); });
  if (juego) { juego.activo = false; juego.pausado = false; }
  ui.mensaje.textContent = '';
  mostrar('menu');
}

function terminar(gano) {
  juego.terminado = true;
  juego.sacudida = 0;
  if (gano) {
    const frac = juego.vida / VIDA_BASE, est = frac >= 0.8 ? 3 : frac >= 0.45 ? 2 : 1;
    const clave = juego.mapa + '-' + juego.nivel;
    if (est > (estrellas[clave] || 0)) { estrellas[clave] = est; guardarEstrellas(); }
    $('#estrellas-victoria').textContent = textoEstrellas(est);
    textoCompartir = '🏰 ¡Defendí "' + juego.nombre + '" (' + MAPAS[juego.mapa].nombre + ') en monster_days con ' + textoEstrellas(est) + ' y derroté a ' + juego.muertos + ' monstruos! ¿Puedes superarme?';
    if (juego.nivel < 4 && juego.nivel + 1 > progreso[juego.mapa]) { progreso[juego.mapa] = juego.nivel + 1; guardarProgreso(); }
    $('#res-victoria').textContent = 'Defendiste "' + juego.nombre + '" (' + MAPAS[juego.mapa].nombre + ') con ' + juego.vida + ' de vida y ' + juego.monedas + ' monedas. Monstruos derrotados: ' + juego.muertos + '.';
    $('#v-siguiente').hidden = juego.nivel >= 4;
    sonido(523, 0.4, 'triangle');
    ui.victoria.showModal();
  } else {
    $('#res-derrota').textContent = (juego.jefeLlego ? '¡El jefe final llegó a la fortaleza y la destruyó! ' : '') + 'La fortaleza cayó en la oleada ' + juego.oleada + ' de ' + juego.oleadas + '. Monstruos derrotados: ' + juego.muertos + '.';
    textoCompartir = '💀 Caí en la oleada ' + juego.oleada + '/' + juego.oleadas + ' de "' + juego.nombre + '" en monster_days. ¿Te animas a intentarlo?';
    sonido(110, 0.6, 'sawtooth');
    ui.derrota.showModal();
  }
}

/* ==========================================================
   Actualización (lógica por fotograma)
   ========================================================== */
function actualizar(dt) {
  const j = juego;
  j.t += dt;
  if (j.sacudida > 0) j.sacudida -= dt;
  if (j.aviso) { j.aviso.t -= dt; if (j.aviso.t <= 0) j.aviso = null; }

  // Aparición de enemigos
  if (j.cola.length) {
    j.aparecer -= dt;
    if (j.aparecer <= 0) { crearEnemigo(j.cola.shift()); j.aparecer = Math.max(0.4, 1.2 - j.oleada * 0.05); }
  }

  // Movimiento de enemigos y efectos de estado
  j.enemigos.forEach((e) => {
    if (e.muerto) return;
    const d = ENEMIGOS[e.tipo];
    if (e.lento > 0) e.lento -= dt;
    if (e.veneno > 0) { e.veneno -= dt; golpear(e, e.venenoDps * dt, true); if (e.muerto) return; }
    // Jefe final: se detiene un momento para lanzar su ataque de sueño
    if (e.tipo === 'jefe' && e.lanzando > 0) {
      e.lanzando -= dt;
      if (e.lanzando <= 0) hechizoJefe(e);
      return;
    }
    const vel = d.vel * (e.lento > 0 ? 0.5 : 1);
    let resto = vel * dt;
    while (resto > 0 && !e.llego) {
      const p = j.puntos[e.seg];
      const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy);
      if (dist > 0.01) e.ang = Math.atan2(dy, dx);
      if (dist <= resto) { e.x = p.x; e.y = p.y; resto -= dist; e.seg++; if (e.seg >= j.puntos.length) e.llego = true; }
      else { e.x += (dx / dist) * resto; e.y += (dy / dist) * resto; resto = 0; }
    }
    if (e.tipo === 'jefe' && !e.llego) {
      e.camino += vel * dt;
      if (e.camino >= JEFE_PASO && torresCercanas(e).length) {
        e.camino = 0; e.lanzando = JEFE_CARGA;
        ui.mensaje.textContent = '¡El jefe prepara un ataque de sueño!';
        sonido(80, JEFE_CARGA, 'sawtooth');
      }
    }
    if (e.llego) {
      j.vida = Math.max(0, j.vida - d.dano);
      if (e.tipo === 'jefe') { j.jefeLlego = true; j.vida = 0; ui.mensaje.textContent = '¡El jefe final entró a la fortaleza!'; }
      j.sacudida = 0.35;
      sonido(e.tipo === 'jefe' ? 60 : 120, e.tipo === 'jefe' ? 0.7 : 0.2, 'square');
    }
    else { const s = j.puntos[e.seg]; e.prog = e.seg * 10000 - Math.hypot(s.x - e.x, s.y - e.y); }
  });

  // Torres: apuntar, elegir objetivo y disparar
  j.torres.forEach((t) => {
    const def = TORRES[t.tipo];
    t.cd = Math.max(0, t.cd - dt);
    t.retro = Math.max(0, t.retro - dt * 5);
    if (t.dormida > 0) { t.dormida = Math.max(0, t.dormida - dt); return; }   // dormida: no dispara
    const objetivos = j.enemigos
      .filter((e) => !e.muerto && !e.llego && Math.hypot(e.x - t.x, e.y - t.y) <= def.alcance)
      .sort((a, b) => b.prog - a.prog);
    if (!objetivos.length) return;
    const mejor = objetivos[0];
    t.ang = Math.atan2(mejor.y - t.y, mejor.x - t.x);
    if (t.cd > 0) return;
    t.cd = def.cd / (j.mejoras.velocidad ? 1.5 : 1);
    t.retro = 1;
    if (def.bolitas) {
      // Lasser: una bolita por objetivo (si solo hay uno, ambas van a él)
      for (let i = 0; i < def.bolitas; i++) {
        const obj = objetivos[i] || mejor, lado = i === 0 ? -1 : 1;
        j.proyectiles.push({
          x: t.x + Math.cos(t.ang) * 14 - Math.sin(t.ang) * 7 * lado,
          y: t.y + Math.sin(t.ang) * 14 + Math.cos(t.ang) * 7 * lado,
          obj, tipo: t.tipo, ang: t.ang,
        });
      }
      sonido(1100, 0.12, 'sawtooth');
    } else {
      j.proyectiles.push({ x: t.x + Math.cos(t.ang) * 14, y: t.y + Math.sin(t.ang) * 14, obj: mejor, tipo: t.tipo, ang: t.ang });
      sonido(t.tipo === 'catapulta' ? 150 : t.tipo === 'mago' ? 700 : t.tipo === 'dardero' ? 900 : 600, 0.05, 'square');
    }
  });

  // Proyectiles
  j.proyectiles.forEach((p) => {
    const def = TORRES[p.tipo];
    if (p.obj.muerto || p.obj.llego) { p.fin = true; return; }
    const dx = p.obj.x - p.x, dy = p.obj.y - p.y, dist = Math.hypot(dx, dy), paso = (def.vel || 420) * dt;
    p.ang = Math.atan2(dy, dx);
    if (dist <= paso) {
      p.fin = true;
      const ox = p.obj.x, oy = p.obj.y;
      // Mejoras: +50 % de daño y probabilidad de crítico (doble de daño)
      let mult = j.mejoras.dano ? 1.5 : 1, crit = false;
      if (j.mejoras.critico && Math.random() < PROB_CRITICO) { mult *= 2; crit = true; }
      const dano = def.dano * mult;
      if (def.area) {
        j.enemigos.forEach((e) => { if (Math.hypot(e.x - ox, e.y - oy) <= def.area) golpear(e, dano); });
        anillo(ox, oy, def.area, '#ffb347'); chispas(ox, oy, '#5a3a1a', 10, 110);
      } else {
        golpear(p.obj, dano);
        chispas(ox, oy, p.tipo === 'lasser' ? '#8ff3ff' : p.tipo === 'mago' ? '#c79bff' : p.tipo === 'dardero' ? '#7be0a0' : '#f1e6c8', p.tipo === 'lasser' ? 7 : 3, p.tipo === 'lasser' ? 90 : 45);
      }
      if (crit) { textoFlotante(ox, oy - 24, '¡CRÍTICO!', '#ff9a3c'); chispas(ox, oy, '#ffb347', 6, 120); }
      if (def.lento && !p.obj.muerto) p.obj.lento = def.lento;
      if (def.veneno && !p.obj.muerto) { p.obj.veneno = def.veneno.dur; p.obj.venenoDps = def.veneno.dps * mult; }
    } else { p.x += (dx / dist) * paso; p.y += (dy / dist) * paso; }
  });

  // Partículas
  j.particulas.forEach((q) => { q.vida -= dt; q.x += q.vx * dt; q.y += q.vy * dt; });

  j.enemigos = j.enemigos.filter((e) => !e.muerto && !e.llego);
  j.proyectiles = j.proyectiles.filter((p) => !p.fin);
  j.particulas = j.particulas.filter((q) => q.vida > 0);

  // Fin de oleada
  if (j.oleadaActiva && !j.cola.length && !j.enemigos.length && j.vida > 0) {
    j.oleadaActiva = false;
    if (j.oleada >= j.oleadas) { actualizarHUD(); terminar(!j.jefeLlego && j.jefeMuerto && j.vida > 0); return; }
    const botin = 25 + j.oleada * 2;
    j.monedas += botin;
    ui.mensaje.textContent = 'Oleada superada. +' + botin + ' monedas de botín. Prepárate para la siguiente.';
  }
  if (j.vida <= 0 || j.jefeLlego) { j.vida = Math.max(0, j.vida); actualizarHUD(); terminar(false); return; }
  actualizarHUD();
}

/* ---------- Ataque de sueño del jefe final ---------- */
function torresCercanas(jefe) {
  return juego.torres
    .filter((t) => t.dormida <= 0 && Math.hypot(t.x - jefe.x, t.y - jefe.y) <= JEFE_ALCANCE)
    .sort((a, b) => Math.hypot(a.x - jefe.x, a.y - jefe.y) - Math.hypot(b.x - jefe.x, b.y - jefe.y))
    .slice(0, JEFE_TORRES);
}
function hechizoJefe(jefe) {
  const objetivos = torresCercanas(jefe);
  anillo(jefe.x, jefe.y, JEFE_ALCANCE, '#b57aff');
  objetivos.forEach((t) => {
    t.dormida = JEFE_SUENO;
    anillo(t.x, t.y, 34, '#b57aff');
    chispas(t.x, t.y, '#b57aff', 10, 70);
    textoFlotante(t.x, t.y - 28, 'Zzz', '#cfd8ff');
  });
  ui.mensaje.textContent = objetivos.length
    ? '¡El jefe durmió ' + objetivos.length + (objetivos.length === 1 ? ' torreta' : ' torretas') + ' por ' + JEFE_SUENO + ' s!'
    : 'El jefe lanzó su ataque, pero no alcanzó ninguna torreta.';
  sonido(140, 0.5, 'triangle');
}

function golpear(e, dano, silencioso) {
  if (e.muerto) return;
  e.vida -= dano;
  if (e.vida <= 0) {
    const d = ENEMIGOS[e.tipo];
    e.muerto = true; juego.monedas += d.oro; juego.muertos++;
    if (e.tipo === 'jefe') juego.jefeMuerto = true;
    sonido(800, 0.06, 'triangle');
    chispas(e.x, e.y, d.color, 10, 100);
    textoFlotante(e.x, e.y - d.r - 6, '+' + d.oro, '#f2cf72');
  } else if (!silencioso && Math.random() < 0.3) {
    chispas(e.x, e.y, '#ffffff', 1, 30);
  }
}

function actualizarHUD() {
  const j = juego;
  ui.vida.value = j.vida; ui.vida.textContent = String(j.vida); ui.txtVida.textContent = j.vida;
  ui.monedas.textContent = j.monedas;
  ui.oleada.value = j.oleada; ui.txtOleada.textContent = j.oleada + '/' + j.oleadas;
  ui.btnOleada.disabled = j.oleadaActiva || j.oleada >= j.oleadas || j.terminado;
  $$('.boton-torre').forEach((b) => {
    const def = TORRES[b.dataset.torre];
    b.disabled = def ? j.monedas < def.costo : false;
  });
  $$('[data-mejora]').forEach((b) => {
    const k = b.dataset.mejora, comprada = j.mejoras[k];
    b.disabled = comprada || j.monedas < MEJORAS[k].costo;
    b.classList.toggle('comprada', comprada);
    b.querySelector('.costo').textContent = comprada ? '✓ Activa' : MEJORAS[k].costo;
  });
}

/* ==========================================================
   Dibujo en canvas
   ========================================================== */
function dibujarFondo(j) {
  const T = TEMAS[j.mapa], infernal = j.mapa === 'infernal';
  const c = document.createElement('canvas');
  c.width = COLS * TAM; c.height = FILAS * TAM;
  const g = c.getContext('2d');
  let semilla = j.nivel * 7919 + (infernal ? 4242 : 0);
  const azar = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  const en = (col, f) => j.celdasRuta.has(col + ',' + f);

  // 1) Suelo y camino
  for (let f = 0; f < FILAS; f++) {
    for (let col = 0; col < COLS; col++) {
      const ruta = en(col, f);
      const paleta = ruta ? T.ruta : T.suelo;
      g.fillStyle = paleta[Math.floor(azar() * paleta.length)];
      g.fillRect(col * TAM, f * TAM, TAM, TAM);
      for (let k = 0; k < (ruta ? 9 : 7); k++) {
        const x = col * TAM + azar() * TAM, y = f * TAM + azar() * TAM;
        if (ruta) { g.fillStyle = azar() < 0.5 ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.08)'; g.beginPath(); g.ellipse(x, y, 2 + azar() * 2.5, 1.5 + azar() * 1.5, 0, 0, 7); g.fill(); }
        else if (!infernal) { g.strokeStyle = azar() < 0.5 ? '#5c8a3c' : '#2f4a20'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (azar() - 0.5) * 3, y - 4 - azar() * 3); g.stroke(); }
        else { g.fillStyle = azar() < 0.5 ? 'rgba(0,0,0,.25)' : 'rgba(255,120,60,.14)'; g.fillRect(x, y, 2, 2); }
      }
    }
  }

  // 2) Bordes del camino (tierra oscura o ríos de lava)
  for (let f = 0; f < FILAS; f++) {
    for (let col = 0; col < COLS; col++) {
      if (!en(col, f)) continue;
      const x = col * TAM, y = f * TAM;
      const lados = [[0, -1, x, y, TAM, 5], [0, 1, x, y + TAM - 5, TAM, 5], [-1, 0, x, y, 5, TAM], [1, 0, x + TAM - 5, y, 5, TAM]];
      lados.forEach(([dc, df, rx, ry, rw, rh]) => {
        const nc = col + dc, nf = f + df;
        if (nc < 0 || nf < 0 || nc >= COLS || nf >= FILAS || en(nc, nf)) return;
        g.fillStyle = T.borde; g.globalAlpha = infernal ? 0.9 : 0.85;
        g.fillRect(rx, ry, rw, rh);
        g.globalAlpha = 1;
        if (infernal) {   // línea brillante en el centro del río de lava
          g.fillStyle = '#ffd27a';
          if (dc === 0) g.fillRect(rx, ry + 2, rw, 1.5); else g.fillRect(rx + 2, ry, 1.5, rh);
        }
      });
    }
  }

  // 3) Decoración (solo en casillas sin camino)
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  for (let f = 0; f < FILAS; f++) {
    for (let col = 0; col < COLS; col++) {
      if (en(col, f)) continue;
      const cx = col * TAM, cy = f * TAM, r = azar();
      const px = cx + 14 + azar() * 32, py = cy + 14 + azar() * 32;
      if (!infernal) {
        if (r < 0.1) {          // árbol
          g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(px + 3, py + 12, 14, 5, 0, 0, 7); g.fill();
          g.fillStyle = '#3a2412'; g.fillRect(px - 2.5, py + 2, 5, 11);
          g.fillStyle = '#2a5a22'; g.beginPath(); g.arc(px, py - 1, 12, 0, 7); g.fill();
          g.fillStyle = '#367a2c'; g.beginPath(); g.arc(px - 3, py - 4, 8, 0, 7); g.fill();
          g.fillStyle = '#58a63d'; g.beginPath(); g.arc(px - 5, py - 7, 3.5, 0, 7); g.fill();
        } else if (r < 0.17) {  // roca
          g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(px + 2, py + 6, 11, 4, 0, 0, 7); g.fill();
          g.fillStyle = '#6f757a'; g.beginPath(); g.ellipse(px, py, 9, 6.5, 0, 0, 7); g.fill();
          g.fillStyle = '#9aa0a5'; g.beginPath(); g.ellipse(px - 2, py - 2, 5, 3, 0, 0, 7); g.fill();
        } else if (r < 0.3) {   // flores
          const col2 = ['#f4d35e', '#f28482', '#ffffff', '#b8a1ff'][Math.floor(azar() * 4)];
          for (let k = 0; k < 3; k++) { g.fillStyle = col2; g.beginPath(); g.arc(px + k * 5 - 5, py + (k % 2) * 4, 2.2, 0, 7); g.fill(); g.fillStyle = '#f9a826'; g.fillRect(px + k * 5 - 5.5, py + (k % 2) * 4 - 0.5, 1.2, 1.2); }
        } else if (r < 0.36) {  // arbusto
          g.fillStyle = '#2f5a24'; g.beginPath(); g.arc(px, py, 6, 0, 7); g.arc(px + 6, py + 2, 5, 0, 7); g.fill();
          g.fillStyle = '#4a8a36'; g.beginPath(); g.arc(px - 1, py - 2, 3, 0, 7); g.fill();
        }
      } else {
        if (r < 0.18) {         // grieta de lava
          let gx = clamp(px, cx + 6, cx + TAM - 6), gy = clamp(py, cy + 6, cy + TAM - 6);
          const pts = [[gx, gy]];
          for (let k = 0; k < 3; k++) { gx = clamp(gx + (azar() - 0.5) * 20, cx + 4, cx + TAM - 4); gy = clamp(gy + (azar() - 0.4) * 16, cy + 4, cy + TAM - 4); pts.push([gx, gy]); }
          [['#ff5a14', 3.2, 0.5], ['#ffb347', 1.4, 1]].forEach(([colr, w, a]) => {
            g.strokeStyle = colr; g.lineWidth = w; g.globalAlpha = a; g.lineJoin = 'round';
            g.beginPath(); pts.forEach(([a1, b1], i) => (i ? g.lineTo(a1, b1) : g.moveTo(a1, b1))); g.stroke();
          });
          g.globalAlpha = 1;
        } else if (r < 0.26) {  // roca de obsidiana
          g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(px + 2, py + 7, 12, 4, 0, 0, 7); g.fill();
          g.fillStyle = '#241a20'; g.beginPath(); g.moveTo(px - 10, py + 6); g.lineTo(px - 4, py - 9); g.lineTo(px + 3, py - 3); g.lineTo(px + 10, py + 6); g.closePath(); g.fill();
          g.fillStyle = '#4a3a48'; g.beginPath(); g.moveTo(px - 4, py - 9); g.lineTo(px + 3, py - 3); g.lineTo(px - 2, py + 2); g.closePath(); g.fill();
        } else if (r < 0.33) {  // árbol muerto
          g.strokeStyle = '#150e0e'; g.lineWidth = 3; g.lineCap = 'round';
          g.beginPath(); g.moveTo(px, py + 12); g.lineTo(px, py - 8); g.moveTo(px, py + 1); g.lineTo(px - 8, py - 6); g.moveTo(px, py - 3); g.lineTo(px + 7, py - 11); g.stroke();
          g.lineCap = 'butt';
        } else if (r < 0.37) {  // charco de lava
          const gr = g.createRadialGradient(px, py, 1, px, py, 11);
          gr.addColorStop(0, '#ffd27a'); gr.addColorStop(0.5, '#ff6a1f'); gr.addColorStop(1, 'rgba(120,20,10,0)');
          g.fillStyle = gr; g.beginPath(); g.ellipse(px, py, 11, 7, 0, 0, 7); g.fill();
        }
      }
    }
  }

  // 4) Entrada y fortaleza
  const ini = j.puntos[1], fin = j.puntos[j.puntos.length - 2];
  if (infernal) {
    const gr = g.createRadialGradient(ini.x - 14, ini.y, 2, ini.x - 14, ini.y, 34);
    gr.addColorStop(0, '#ffe08a'); gr.addColorStop(0.4, '#ff4a1f'); gr.addColorStop(1, 'rgba(90,10,40,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(ini.x - 14, ini.y, 34, 0, 7); g.fill();
  }
  [-1, 1].forEach((lado) => {
    const py = ini.y + lado * 27 - 8;
    g.fillStyle = infernal ? '#1d1418' : '#6b6157'; g.fillRect(ini.x - 28, py, 16, 16);
    g.fillStyle = infernal ? '#3a2a34' : '#8d8274'; g.fillRect(ini.x - 28, py, 16, 4);
    g.fillStyle = infernal ? '#ff7a1f' : '#c0452b'; g.fillRect(ini.x - 24, py + 6, 8, 6);
  });
  g.fillStyle = '#5b5147'; g.fillRect(fin.x + 2, fin.y - 36, 30, 72);
  g.fillStyle = '#6f655a'; g.fillRect(fin.x + 2, fin.y - 36, 30, 6);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1;
  for (let y = fin.y - 28; y < fin.y + 36; y += 9) { g.beginPath(); g.moveTo(fin.x + 2, y); g.lineTo(fin.x + 32, y); g.stroke(); }
  g.fillStyle = '#2c2620'; for (let i = 0; i < 4; i++) g.fillRect(fin.x + 2 + i * 8, fin.y - 43, 6, 8);
  g.fillStyle = '#14110e'; g.beginPath(); g.moveTo(fin.x + 2, fin.y + 18); g.lineTo(fin.x + 2, fin.y - 6); g.arc(fin.x + 12, fin.y - 6, 10, Math.PI, 0); g.lineTo(fin.x + 22, fin.y + 18); g.fill();
  g.fillStyle = '#c0452b'; g.beginPath(); g.moveTo(fin.x + 10, fin.y - 43); g.lineTo(fin.x + 10, fin.y - 58); g.lineTo(fin.x + 24, fin.y - 52); g.lineTo(fin.x + 10, fin.y - 47); g.fill();
  g.strokeStyle = '#3a2410'; g.lineWidth = 2; g.beginPath(); g.moveTo(fin.x + 10, fin.y - 43); g.lineTo(fin.x + 10, fin.y - 60); g.stroke();

  // 5) Viñeta
  const vg = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.width * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, infernal ? 'rgba(40,0,0,.5)' : 'rgba(0,10,0,.4)');
  g.fillStyle = vg; g.fillRect(0, 0, c.width, c.height);
  return c;
}

/* --- Torres --- */
function dibujarTorre(t, tiempo) {
  const x = t.x, y = t.y, g = ctx;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 3, y + 18, 22, 8, 0, 0, 7); g.fill();
  // base de piedra
  g.fillStyle = '#3a342d'; g.beginPath(); g.arc(x, y, 23, 0, 7); g.fill();
  g.fillStyle = '#6a5f54'; g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1;
  for (let a = 0; a < 6.28; a += 0.785) { g.beginPath(); g.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); g.lineTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); g.stroke(); }
  g.fillStyle = '#4a4036'; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill();

  g.save(); g.translate(x, y); g.rotate(t.ang);
  const r = t.retro;
  if (t.tipo === 'arquero') {
    g.fillStyle = '#7a5230'; g.beginPath(); g.arc(0, 0, 12, 0, 7); g.fill();
    g.fillStyle = '#5f9a3a'; g.beginPath(); g.arc(-1, 0, 7.5, 0, 7); g.fill();       // capucha
    g.fillStyle = '#3f6b2c'; g.beginPath(); g.arc(-3, 0, 4.5, 0, 7); g.fill();
    g.strokeStyle = '#d9b36a'; g.lineWidth = 2.5; g.beginPath(); g.arc(5 - r * 2, 0, 11, -1.1, 1.1); g.stroke();   // arco
    g.strokeStyle = '#f1e6c8'; g.lineWidth = 1; g.beginPath(); g.moveTo(5 - r * 2 + Math.cos(-1.1) * 11, Math.sin(-1.1) * 11); g.lineTo(2 - r * 5, 0); g.lineTo(5 - r * 2 + Math.cos(1.1) * 11, Math.sin(1.1) * 11); g.stroke();
    if (r < 0.3) { g.strokeStyle = '#f1e6c8'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(2, 0); g.lineTo(17, 0); g.stroke(); g.fillStyle = '#c9ccd1'; g.beginPath(); g.moveTo(20, 0); g.lineTo(16, -2.5); g.lineTo(16, 2.5); g.fill(); }
  } else if (t.tipo === 'catapulta') {
    g.fillStyle = '#3a2410'; g.fillRect(-13, -14, 8, 5); g.fillRect(-13, 9, 8, 5); g.fillRect(5, -14, 8, 5); g.fillRect(5, 9, 8, 5);   // ruedas
    g.fillStyle = '#8a5a2b'; g.fillRect(-13, -9, 26, 18);
    g.fillStyle = '#a8733a'; g.fillRect(-13, -9, 26, 4);
    g.strokeStyle = '#4a2c12'; g.lineWidth = 1; g.strokeRect(-13, -9, 26, 18);
    g.strokeStyle = '#d9a35a'; g.lineWidth = 4; g.lineCap = 'round';
    const brazo = 14 - r * 10;
    g.beginPath(); g.moveTo(-7, 0); g.lineTo(brazo, 0); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#2a1608'; g.beginPath(); g.arc(brazo, 0, 5, 0, 7); g.fill();
    if (r < 0.4) { g.fillStyle = '#6b6157'; g.beginPath(); g.arc(brazo, 0, 3.5, 0, 7); g.fill(); }
  } else if (t.tipo === 'mago') {
    g.fillStyle = '#4a2f7a'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill();
    g.fillStyle = '#6a3fb0'; g.beginPath(); g.arc(-1, 0, 10, 0, 7); g.fill();
    g.strokeStyle = '#e8c15a'; g.lineWidth = 1.5; g.beginPath(); g.arc(-1, 0, 10, 0, 7); g.stroke();
    g.fillStyle = '#3b2160'; g.beginPath(); g.moveTo(-1, -5); g.lineTo(9, 0); g.lineTo(-1, 5); g.closePath(); g.fill();   // sombrero (punta)
    g.strokeStyle = '#8a5a2b'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-6, 8); g.lineTo(17, 5); g.stroke();             // bastón
    const pulso = 4.5 + Math.sin(tiempo * 5) * 1 + r * 2;
    const gr = g.createRadialGradient(18, 5, 1, 18, 5, pulso * 2.6);
    gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.4, 'rgba(199,155,255,.75)'); gr.addColorStop(1, 'rgba(142,90,209,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(18, 5, pulso * 2.6, 0, 7); g.fill();
  } else if (t.tipo === 'dardero') {
    g.fillStyle = '#1f6f5a'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill();
    g.fillStyle = '#2fa58a'; g.beginPath(); g.arc(-1, 0, 10, 0, 7); g.fill();
    g.fillStyle = '#7be0a0';   // hojas
    for (let a = 0; a < 6.28; a += 1.05) { g.beginPath(); g.ellipse(Math.cos(a) * 7 - 1, Math.sin(a) * 7, 3.5, 1.8, a, 0, 7); g.fill(); }
    g.fillStyle = '#c9a96a'; g.beginPath(); g.arc(-2, 0, 4.5, 0, 7); g.fill();
    g.strokeStyle = '#8a6a33'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(17 - r * 3, 0); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#7be0a0'; g.beginPath(); g.arc(18 - r * 3, 0, 2.2, 0, 7); g.fill();
    g.fillStyle = 'rgba(123,224,160,.5)'; g.beginPath(); g.arc(-6, -7 + Math.sin(tiempo * 4) * 1, 1.8, 0, 7); g.fill();
  } else {   // lasser
    g.fillStyle = '#4b5864'; g.beginPath(); for (let a = 0; a < 6; a++) g.lineTo(Math.cos(a * 1.0472) * 14, Math.sin(a * 1.0472) * 14); g.closePath(); g.fill();
    g.fillStyle = '#7d8a96'; g.beginPath(); for (let a = 0; a < 6; a++) g.lineTo(Math.cos(a * 1.0472) * 11, Math.sin(a * 1.0472) * 11); g.closePath(); g.fill();
    g.fillStyle = '#2c353d'; g.fillRect(2, -9, 14, 5); g.fillRect(2, 4, 14, 5);       // cañones
    const cargado = 0.5 + 0.5 * Math.sin(tiempo * 6) + r;
    [-6.5, 6.5].forEach((o) => { g.fillStyle = '#3fd0e8'; g.globalAlpha = 0.6 + 0.4 * Math.min(1, cargado); g.beginPath(); g.arc(17, o, 3, 0, 7); g.fill(); g.globalAlpha = 1; });
    const gr = g.createRadialGradient(-1, 0, 1, -1, 0, 11);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, '#6ff0ff'); gr.addColorStop(1, 'rgba(63,208,232,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(-1, 0, 6 + Math.sin(tiempo * 4) * 1 + r * 2, 0, 7); g.fill();
  }
  g.restore();
}

function dibujarSueno(t, tiempo) {
  const g = ctx;
  g.fillStyle = 'rgba(25,30,80,.55)'; g.beginPath(); g.arc(t.x, t.y, 24, 0, 7); g.fill();
  g.strokeStyle = 'rgba(160,180,255,.7)'; g.lineWidth = 2; g.stroke();
  g.textAlign = 'center'; g.fillStyle = '#cfd8ff'; g.strokeStyle = '#14110e'; g.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    const f = (tiempo * 0.8 + k / 3) % 1, x = t.x + 8 + f * 12, y = t.y - 8 - f * 22;
    g.globalAlpha = 1 - f; g.font = 'bold ' + (10 + k * 3) + 'px Georgia, serif';
    g.strokeText('Z', x, y); g.fillText('Z', x, y);
  }
  g.globalAlpha = 1;
}

/* --- Enemigos --- */
function dibujarEnemigo(e, tiempo) {
  const d = ENEMIGOS[e.tipo], g = ctx, r = d.r;
  const ciclo = tiempo * d.paso * 0.5 + e.id, bob = Math.sin(ciclo * 2) * 1.2;
  g.fillStyle = 'rgba(0,0,0,.32)'; g.beginPath(); g.ellipse(e.x + 2, e.y + r * 0.75, r * 0.95, r * 0.4, 0, 0, 7); g.fill();

  // Aura de minijefe (dorada) y jefe final (violeta)
  if (e.tipo === 'ogro' || e.tipo === 'jefe') {
    const col = e.tipo === 'jefe' ? '160,80,255' : '255,200,60', pul = 0.5 + 0.5 * Math.sin(tiempo * 3 + e.id);
    const ga = g.createRadialGradient(e.x, e.y, r * 0.5, e.x, e.y, r * 2.1);
    ga.addColorStop(0, 'rgba(' + col + ',' + (0.35 + 0.2 * pul).toFixed(2) + ')'); ga.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = ga; g.beginPath(); g.arc(e.x, e.y, r * 2.1, 0, 7); g.fill();
  }
  if (e.tipo === 'jefe' && e.lanzando > 0) {   // anillo del ataque de sueño
    const pr = 1 - e.lanzando / JEFE_CARGA;
    g.strokeStyle = 'rgba(181,122,255,' + (0.9 - pr * 0.5).toFixed(2) + ')'; g.lineWidth = 4;
    g.beginPath(); g.arc(e.x, e.y, 40 + pr * (JEFE_ALCANCE - 40), 0, 7); g.stroke();
  }

  g.save(); g.translate(e.x, e.y + bob); g.rotate(e.ang);
  const s = Math.sin(ciclo * 2) * r * 0.5;
  g.fillStyle = d.pie;   // pies
  g.beginPath(); g.arc(s, -r * 0.55, r * 0.3, 0, 7); g.arc(-s, r * 0.55, r * 0.3, 0, 7); g.fill();

  if (e.tipo === 'goblin') {
    g.fillStyle = d.color;
    [-1, 1].forEach((l) => { g.beginPath(); g.moveTo(-r * 0.2, l * r * 0.6); g.lineTo(-r * 1.1, l * r * 1.5); g.lineTo(r * 0.3, l * r * 0.95); g.closePath(); g.fill(); });  // orejas
    g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(-r * 0.2, -r * 0.3, r * 0.5, 0, 7); g.fill();
    g.strokeStyle = '#14110e'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.strokeStyle = '#c9ccd1'; g.lineWidth = 2; g.beginPath(); g.moveTo(r * 0.5, r * 0.9); g.lineTo(r * 1.5, r * 0.6); g.stroke();   // daga
    [-1, 1].forEach((l) => { g.fillStyle = '#ffe95a'; g.beginPath(); g.arc(r * 0.45, l * r * 0.38, 2.4, 0, 7); g.fill(); g.fillStyle = '#14110e'; g.beginPath(); g.arc(r * 0.55, l * r * 0.38, 1.1, 0, 7); g.fill(); });
  } else if (e.tipo === 'orco') {
    g.fillStyle = d.color; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.strokeStyle = '#14110e'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#6b6b73'; g.beginPath(); g.arc(-r * 0.15, 0, r * 0.7, 0, 7); g.fill();   // casco
    g.fillStyle = '#8c8c96'; g.beginPath(); g.arc(-r * 0.3, -r * 0.2, r * 0.35, 0, 7); g.fill();
    g.fillStyle = '#d9d2c0'; [-1, 1].forEach((l) => { g.beginPath(); g.moveTo(r * 0.7, l * r * 0.3); g.lineTo(r * 1.35, l * r * 0.45); g.lineTo(r * 0.85, l * r * 0.1); g.closePath(); g.fill(); });  // colmillos
    g.fillStyle = '#c0452b'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.45, l * r * 0.4, 2.2, 0, 7); g.fill(); });
  } else if (e.tipo === 'troll') {
    g.fillStyle = d.color; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.fillStyle = '#4b6371'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.1, l * r * 0.95, r * 0.42, 0, 7); g.fill(); });   // puños
    g.fillStyle = '#6a8a3c'; g.beginPath(); g.arc(-r * 0.4, -r * 0.3, r * 0.28, 0, 7); g.arc(-r * 0.2, r * 0.4, r * 0.2, 0, 7); g.fill();   // musgo
    g.strokeStyle = '#14110e'; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.strokeStyle = '#6b4423'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(r * 0.4, r * 0.95); g.lineTo(r * 1.7, r * 1.25); g.stroke(); g.lineCap = 'butt';  // garrote
    g.strokeStyle = '#14110e'; g.lineWidth = 2; g.beginPath(); g.moveTo(r * 0.55, -r * 0.5); g.lineTo(r * 0.55, r * 0.5); g.stroke();   // ceño
    g.fillStyle = '#ffd24a'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.6, l * r * 0.28, 2.6, 0, 7); g.fill(); });
  } else if (e.tipo === 'jefe') {   // jefe final
    const alz = e.lanzando > 0;
    g.fillStyle = '#d9d2c0'; [-1, 1].forEach((l) => { g.beginPath(); g.moveTo(r * 0.2, l * r * 0.5); g.quadraticCurveTo(r * 0.95, l * r * 1.0, r * 0.55, l * r * 1.8); g.lineTo(r * 0.3, l * r * 0.95); g.closePath(); g.fill(); });   // cuernos
    g.fillStyle = '#2a1640'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.05, l * r * 0.98, r * 0.45, 0, 7); g.fill(); });   // hombros
    if (alz) { g.strokeStyle = '#b57aff'; g.lineWidth = 5; g.lineCap = 'round'; [-1, 1].forEach((l) => { g.beginPath(); g.moveTo(r * 0.1, l * r * 0.9); g.lineTo(r * 1.4, l * r * 0.5); g.stroke(); }); g.lineCap = 'butt'; }
    g.fillStyle = d.color; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.strokeStyle = '#14110e'; g.lineWidth = 3.5; g.stroke();
    g.strokeStyle = '#b57aff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-r * 0.6, -r * 0.3); g.lineTo(-r * 0.1, -r * 0.1); g.lineTo(-r * 0.5, r * 0.1); g.lineTo(-r * 0.05, r * 0.35); g.stroke();   // runas
    g.fillStyle = '#e8c15a'; g.beginPath(); g.moveTo(-r * 0.6, -r * 0.55); g.lineTo(-r * 0.6, r * 0.55); g.lineTo(-r * 0.25, r * 0.4); g.lineTo(-r * 0.25, r * 0.15); g.lineTo(-r * 0.25, -r * 0.15); g.lineTo(-r * 0.25, -r * 0.4); g.closePath(); g.fill();   // corona
    g.fillStyle = alz ? '#ffffff' : '#ff3a3a'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.55, l * r * 0.3, 4, 0, 7); g.fill(); });
  } else {   // ogro (minijefe)
    g.fillStyle = '#c9a63c'; [-1, 1].forEach((l) => { g.beginPath(); g.moveTo(r * 0.1, l * r * 0.55); g.lineTo(r * 0.7, l * r * 1.5); g.lineTo(r * 0.5, l * r * 0.5); g.closePath(); g.fill(); });   // cuernos
    g.fillStyle = d.color; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.fillStyle = '#6a2c28'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.05, l * r * 0.98, r * 0.4, 0, 7); g.fill(); });
    g.strokeStyle = '#14110e'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.fillStyle = '#e8c15a'; g.beginPath(); g.moveTo(-r * 0.5, -r * 0.5); g.lineTo(-r * 0.5, r * 0.5); g.lineTo(-r * 0.05, r * 0.3); g.lineTo(-r * 0.05, 0); g.lineTo(-r * 0.05, -r * 0.3); g.closePath(); g.fill();   // corona
    g.fillStyle = '#ff3a3a'; g.beginPath(); g.arc(-r * 0.3, 0, 2.5, 0, 7); g.fill();
    g.strokeStyle = '#4a2c12'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(r * 0.3, r * 1.0); g.lineTo(r * 1.5, r * 1.3); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#9aa0a8'; g.beginPath(); g.moveTo(r * 1.3, r * 0.9); g.lineTo(r * 1.9, r * 1.1); g.lineTo(r * 1.7, r * 1.7); g.lineTo(r * 1.2, r * 1.4); g.fill();   // hacha
    g.fillStyle = '#ffe14a'; [-1, 1].forEach((l) => { g.beginPath(); g.arc(r * 0.6, l * r * 0.3, 3, 0, 7); g.fill(); });
  }
  if (e.lento > 0) { g.fillStyle = 'rgba(143,183,255,.45)'; g.beginPath(); g.arc(0, 0, r + 1, 0, 7); g.fill(); g.strokeStyle = '#cfe3ff'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, r + 2.5, 0, 7); g.stroke(); }
  if (e.veneno > 0) { g.fillStyle = 'rgba(110,220,70,.38)'; g.beginPath(); g.arc(0, 0, r + 1, 0, 7); g.fill(); }
  g.restore();

  if (e.veneno > 0) {   // burbujas de veneno
    g.fillStyle = 'rgba(150,240,90,.85)';
    for (let k = 0; k < 3; k++) { const f = (tiempo * 1.3 + k / 3 + e.id * 0.17) % 1; g.beginPath(); g.arc(e.x + (k - 1) * r * 0.5, e.y - r * 0.2 - f * 16, 2 * (1 - f) + 0.6, 0, 7); g.fill(); }
  }
  if (e.tipo === 'ogro' || e.tipo === 'jefe') {   // etiqueta
    const jf = e.tipo === 'jefe', tx = jf ? 'JEFE FINAL' : 'MINIJEFE';
    g.font = 'bold 11px Georgia, serif'; g.textAlign = 'center'; g.strokeStyle = '#14110e'; g.lineWidth = 3;
    g.fillStyle = jf ? '#d9a8ff' : '#ffd27a';
    g.strokeText(tx, e.x, e.y - r - 15); g.fillText(tx, e.x, e.y - r - 15);
  }
  // barra de vida
  const w = Math.max(24, r * 2);
  g.fillStyle = '#14110e'; g.fillRect(e.x - w / 2 - 1, e.y - r - 11, w + 2, 6);
  const pv = Math.max(0, e.vida / e.max);
  g.fillStyle = pv > 0.6 ? '#7ac142' : pv > 0.3 ? '#e0b030' : '#c0452b';
  g.fillRect(e.x - w / 2, e.y - r - 10, w * pv, 4);
}

function dibujar() {
  const j = juego, g = ctx;
  g.save();
  if (j.sacudida > 0) g.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
  g.drawImage(fondo, 0, 0);

  // Brasas flotantes en el Mapa Infernal
  if (j.mapa === 'infernal') {
    j.brasas.forEach((b) => {
      const alto = FILAS * TAM;
      const y = (((b.y - j.t * b.v) % alto) + alto) % alto;
      const x = b.x + Math.sin(j.t * 0.8 + b.fase) * 10;
      g.fillStyle = 'rgba(255,' + (150 + Math.floor(60 * Math.sin(j.t * 3 + b.fase))) + ',60,' + (0.55 + 0.35 * Math.sin(j.t * 4 + b.fase)).toFixed(2) + ')';
      g.beginPath(); g.arc(x, y, b.r, 0, 7); g.fill();
    });
  }

  // Casilla bajo el cursor / alcance
  if (j.hover && !j.pausado) {
    const { c, f } = j.hover, dentro = c >= 0 && f >= 0 && c < COLS && f < FILAS;
    if (dentro && j.sel === 'vender') {
      const hay = j.torres.some((t) => t.c === c && t.f === f);
      g.fillStyle = hay ? 'rgba(192,69,43,.5)' : 'rgba(120,120,120,.25)';
      g.fillRect(c * TAM, f * TAM, TAM, TAM);
      if (hay) { g.strokeStyle = '#ffd0c0'; g.lineWidth = 3; g.beginPath(); g.moveTo(c * TAM + 14, f * TAM + 14); g.lineTo(c * TAM + 46, f * TAM + 46); g.moveTo(c * TAM + 46, f * TAM + 14); g.lineTo(c * TAM + 14, f * TAM + 46); g.stroke(); }
    } else if (dentro && j.sel) {
      const ok = celdaLibre(c, f), def = TORRES[j.sel];
      g.fillStyle = ok ? 'rgba(242,207,114,.35)' : 'rgba(192,69,43,.4)';
      g.fillRect(c * TAM, f * TAM, TAM, TAM);
      g.strokeStyle = 'rgba(242,207,114,.8)'; g.lineWidth = 2;
      g.beginPath(); g.arc(c * TAM + TAM / 2, f * TAM + TAM / 2, def.alcance, 0, 7); g.stroke();
    } else if (dentro) {
      const t = j.torres.find((q) => q.c === c && q.f === f);
      if (t) { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.beginPath(); g.arc(t.x, t.y, TORRES[t.tipo].alcance, 0, 7); g.stroke(); }
    }
  }

  // Torres (de arriba abajo para que se solapen bien)
  j.torres.slice().sort((a, b) => a.y - b.y).forEach((t) => { dibujarTorre(t, j.t); if (t.dormida > 0) dibujarSueno(t, j.t); });

  // Enemigos (los de abajo se dibujan encima)
  j.enemigos.slice().sort((a, b) => a.y - b.y).forEach((e) => dibujarEnemigo(e, j.t));

  // Proyectiles
  j.proyectiles.forEach((p) => {
    g.save(); g.translate(p.x, p.y); g.rotate(p.ang || 0);
    if (p.tipo === 'arquero') {
      g.strokeStyle = '#f1e6c8'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-8, 0); g.lineTo(5, 0); g.stroke();
      g.fillStyle = '#c9ccd1'; g.beginPath(); g.moveTo(9, 0); g.lineTo(4, -2.5); g.lineTo(4, 2.5); g.fill();
    } else if (p.tipo === 'catapulta') {
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(0, 6, 5, 0, 7); g.fill();
      g.fillStyle = '#4a3a2a'; g.beginPath(); g.arc(0, 0, 6.5, 0, 7); g.fill();
      g.fillStyle = '#7a6650'; g.beginPath(); g.arc(-2, -2, 2.5, 0, 7); g.fill();
    } else if (p.tipo === 'mago') {
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 9);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#c79bff'); gr.addColorStop(1, 'rgba(142,90,209,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
    } else if (p.tipo === 'dardero') {
      g.strokeStyle = '#7be0a0'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, 0); g.lineTo(4, 0); g.stroke();
      g.fillStyle = '#2fa58a'; g.beginPath(); g.moveTo(8, 0); g.lineTo(3, -2.2); g.lineTo(3, 2.2); g.fill();
    } else {   // bolita láser
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 11);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#6ff0ff'); gr.addColorStop(1, 'rgba(63,208,232,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.fill();
      g.strokeStyle = 'rgba(111,240,255,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-16, 0); g.lineTo(0, 0); g.stroke();
    }
    g.restore();
  });

  // Partículas, anillos y textos flotantes
  j.particulas.forEach((q) => {
    const a = Math.max(0, q.vida / q.max);
    g.globalAlpha = a;
    if (q.texto) { g.fillStyle = q.color; g.font = 'bold 14px Georgia, serif'; g.textAlign = 'center'; g.strokeStyle = '#14110e'; g.lineWidth = 3; g.strokeText(q.texto, q.x, q.y); g.fillText(q.texto, q.x, q.y); }
    else if (q.anillo) { g.strokeStyle = q.color; g.lineWidth = 3; g.beginPath(); g.arc(q.x, q.y, q.anillo * (1 - a * 0.6), 0, 7); g.stroke(); }
    else { g.fillStyle = q.color; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  });

  // Aviso de minijefe / jefe
  if (j.aviso) {
    g.globalAlpha = Math.min(1, j.aviso.t / 0.6);
    g.fillStyle = 'rgba(10,8,6,.72)'; g.fillRect(0, 215, canvas.width, 100);
    g.fillStyle = j.aviso.color; g.fillRect(0, 215, canvas.width, 3); g.fillRect(0, 312, canvas.width, 3);
    g.font = 'bold 44px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.strokeStyle = '#14110e'; g.lineWidth = 6; g.strokeText(j.aviso.texto, canvas.width / 2, 265);
    g.fillText(j.aviso.texto, canvas.width / 2, 265);
    g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
  }

  g.restore();
  if (j.sacudida > 0) { g.fillStyle = 'rgba(192,40,20,' + Math.min(0.3, j.sacudida).toFixed(2) + ')'; g.fillRect(0, 0, canvas.width, canvas.height); }
  if (j.pausado) { g.fillStyle = 'rgba(10,8,6,.5)'; g.fillRect(0, 0, canvas.width, canvas.height); }
}

/* ---------- Bucle principal ---------- */
function bucle(t) {
  const dt = Math.min(0.05, (t - ultimo) / 1000 || 0);
  ultimo = t;
  if (juego && juego.activo && !$('#partida').hidden) {
    if (!juego.pausado && !juego.terminado) { for (let k = 0; k < velocidad && !juego.terminado; k++) actualizar(dt); }
    dibujar();
  }
  requestAnimationFrame(bucle);
}

/* ---------- Inicio ---------- */
cargarProgreso();
cargarEstrellas();
actualizarMapas();
(function ambiente() {   // partículas decorativas del lobby (solo CSS animado)
  const cont = $('#ambiente');
  if (!cont) return;
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    s.style.left = ((i * 37) % 100) + '%';
    s.style.animationDelay = (-(i * 1.3) % 14).toFixed(1) + 's';
    s.style.animationDuration = (9 + (i % 6) * 2) + 's';
    s.style.setProperty('--t', (2 + (i % 4)) + 'px');
    cont.appendChild(s);
  }
})();
requestAnimationFrame(bucle);
