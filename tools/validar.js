// Revisa los datos de todas las sesiones: node tools/validar.js
// Comprueba quices (índices, ideas emparejadas), figuras usadas en slides y campos obligatorios.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'data/curso.js'), 'utf8'), ctx);
let errores = 0;
const mal = (n, m) => { errores++; console.log(`  ✗ ${n}: ${m}`); };
for (let n = 0; n <= 8; n++) {
  const f = path.join(root, `data/s${n}.js`), d = path.join(root, `demos/s${n}.js`);
  if (!fs.existsSync(f)) { mal('s' + n, 'falta data'); continue; }
  ctx.window.SESION = undefined; ctx.window.DEMOS = {};
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
  if (fs.existsSync(d)) { ctx.FIG = { C: new Proxy({}, { get: () => '#000' }) }; vm.runInContext(fs.readFileSync(d, 'utf8'), ctx); }
  const K = ctx.window.SESION, tag = 's' + n;
  if (!K) { mal(tag, 'no define window.SESION'); continue; }
  ['titulo', 'objetivos', 'analogia', 'ideas', 'agenda', 'conceptos', 'codigo', 'slides', 'pre', 'post'].forEach(k => { if (!K[k]) mal(tag, 'falta ' + k); });
  if (K.titulo !== ctx.window.CURSO.sesiones[n].titulo) mal(tag, `título distinto a curso.js: "${K.titulo}"`);
  const ids = (K.ideas || []).map(i => i[0]);
  ['pre', 'post'].forEach(t => (K[t] || []).forEach((q, i) => {
    if (!Array.isArray(q.opts) || q.opts.length < 3) mal(tag, `${t}[${i}] opciones`);
    if (!(q.ok >= 0 && q.ok < q.opts.length)) mal(tag, `${t}[${i}] ok fuera de rango`);
    if (!q.why) mal(tag, `${t}[${i}] sin explicación`);
    if (!ids.includes(q.idea)) mal(tag, `${t}[${i}] idea "${q.idea}" no existe`);
  }));
  ids.forEach(id => ['pre', 'post'].forEach(t => { if (!(K[t] || []).some(q => q.idea === id)) mal(tag, `la idea ${id} no aparece en ${t}`); }));
  const usadas = new Set(), checks = [];
  const walk = b => { if (!b || typeof b !== 'object') return; if (Array.isArray(b)) return b.forEach(walk); if (b.fig) usadas.add(b.fig); if (b.check) checks.push(b.check); Object.values(b).forEach(walk); };
  walk(K.slides);
  usadas.forEach(fg => { if (!ctx.window.DEMOS[fg]) mal(tag, `figura "${fg}" no existe en demos/s${n}.js`); });
  checks.forEach((c, i) => { if (!(c.ok >= 0 && c.ok < c.opts.length)) mal(tag, `check ${i} ok fuera de rango`); });
  (K.codigo || []).forEach(c => c.tabs.forEach(t => { if (t.run && /love\./.test(t.src)) mal(tag, `"${c.titulo}" tiene run:true pero usa love.*`); }));
  console.log(`${tag}  ${K.slides.length} slides · pre ${K.pre.length} · post ${K.post.length} · ${K.codigo.length} códigos · figuras: ${[...usadas].join(', ') || '—'}`);
}
console.log(errores ? `\n${errores} problema(s).` : '\nTodo en orden.');
process.exit(errores ? 1 : 0);
