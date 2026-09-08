/* LONGEVEATS, interazioni comuni */
document.addEventListener('DOMContentLoaded', function () {

  /* menu mobile */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Chiudi' : 'Menu';
    });
  }

  /* ombra dell'intestazione allo scorrimento */
  var head = document.querySelector('.site-head');
  if (head) {
    var onScroll = function () { head.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* contatori */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    var start = performance.now(), dur = 1500;
    (function step(now) {
      var t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* comparsa progressiva */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, [data-count]').forEach(function (el) { io.observe(el); });

  /* indirizzo email composto lato client */
  document.querySelectorAll('a.mailto').forEach(function (a) {
    var ind = a.dataset.u + String.fromCharCode(64) + a.dataset.d;
    a.href = 'mail' + 'to:' + ind;
    if (!a.dataset.keep) a.textContent = ind;
  });

  /* banner cookie e consenso ai contenuti di terze parti */
  var consenso = null;
  try { consenso = localStorage.getItem('le-consenso'); } catch (e) { consenso = null; }
  if (!consenso) {
    var b = document.createElement('div');
    b.className = 'cbanner show';
    b.innerHTML = '<p>Questo sito utilizza solo cookie tecnici. La mappa nella pagina Contatti è fornita da Google e viene caricata unicamente con il consenso dell\'utente. Maggiori informazioni nella <a href="cookie.html">cookie policy</a> e nella <a href="privacy.html">informativa privacy</a>.</p>' +
      '<span class="actions"><button type="button" class="solo">Solo cookie tecnici</button><button type="button" class="primary tutti">Accetta contenuti esterni</button></span>';
    document.body.appendChild(b);
    b.addEventListener('click', function (ev) {
      var scelta = ev.target.classList.contains('tutti') ? 'tutti' : (ev.target.classList.contains('solo') ? 'solo' : null);
      if (!scelta) return;
      try { localStorage.setItem('le-consenso', scelta); } catch (e) {}
      b.classList.remove('show');
      if (scelta === 'tutti' && window.leApriMappa) window.leApriMappa();
    });
  }

  /* mappe caricate su consenso, una per sede */
  var mapBtns = Array.prototype.slice.call(document.querySelectorAll('.map-cta'));
  if (mapBtns.length) {
    var apriMappe = function () {
      mapBtns.forEach(function (btn) {
        var holder = btn.parentElement;
        if (!holder || holder.querySelector('iframe')) return;
        var f = document.createElement('iframe');
        f.loading = 'lazy';
        f.title = 'Mappa della sede LONGEVEATS';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.src = btn.dataset.src;
        holder.appendChild(f);
        btn.remove();
      });
    };
    mapBtns.forEach(function (btn) { btn.addEventListener('click', apriMappe); });
    window.leApriMappa = apriMappe;
    if (consenso === 'tutti') apriMappe();
  }
});

/* ============ costruttore di piatto ============ */
document.addEventListener('DOMContentLoaded', function () {
  var builder = document.querySelector('.builder');
  if (!builder) return;

  var scelte = { base: null, proteina: null, extra: null };
  var dati = {
    'Riso integrale': { p: 22, t: 'fibra e rilascio lento degli zuccheri' },
    'Foglie e crucifere': { p: 30, t: 'volume, micronutrienti e carico glicemico minimo' },
    'Quinoa': { p: 26, t: 'proteine vegetali complete e minerali' },
    'Salmone': { p: 32, t: 'omega 3 a lunga catena, i piu studiati sul fronte infiammatorio' },
    'Pollo': { p: 26, t: 'proteine magre per la sazieta e il mantenimento muscolare' },
    'Legumi': { p: 28, t: 'fibra fermentabile, nutrimento per il microbiota' },
    'Avocado': { p: 20, t: 'grassi monoinsaturi che rallentano la risposta glicemica' },
    'Frutta a guscio': { p: 22, t: 'vitamina E, magnesio e grassi buoni' },
    'Fermentati': { p: 24, t: 'supporto diretto alla flora intestinale' }
  };

  var bar = builder.querySelector('.bar i');
  var num = builder.querySelector('.meter .top b');
  var txt = builder.querySelector('.meter p');

  function aggiorna() {
    var tot = 0, note = [];
    Object.keys(scelte).forEach(function (k) {
      var v = scelte[k];
      if (v && dati[v]) { tot += dati[v].p; note.push(dati[v].t); }
    });
    var pct = Math.min(100, tot);
    bar.style.width = pct + '%';
    num.textContent = pct;
    txt.textContent = note.length
      ? 'Questa combinazione porta ' + note.join(', ') + '.'
      : 'Scegli gli ingredienti per vedere come cambia il profilo del piatto.';
  }

  builder.addEventListener('click', function (ev) {
    var c = ev.target.closest('.chip');
    if (!c) return;
    var riga = c.closest('.brow');
    riga.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    c.setAttribute('aria-pressed', 'true');
    scelte[riga.dataset.group] = c.textContent.trim();
    aggiorna();
  });

  aggiorna();
});
