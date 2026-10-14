(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduced = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };

  var portal = $('portal'), filmStage = $('filmStage'), portalCopy = $('portalCopy');
  var video = $('video'), openBtn = $('openBtn'), pauseBtn = $('pauseBtn'), pauseIcon = $('pauseIcon');
  var phase = 'closed', playing = false, timer = null;

  function setPlaying(v) {
    playing = v;
    pauseIcon.firstElementChild.setAttribute('href', v ? '#i-pause' : '#i-play');
    pauseBtn.setAttribute('aria-label', v ? 'إيقاف الفيديو' : 'تشغيل الفيديو');
    pauseBtn.setAttribute('title', v ? 'Pause film' : 'Play film');
  }
  function setPhase(p) {
    phase = p;
    portal.className = 'portal ' + p;
    filmStage.setAttribute('aria-hidden', String(p === 'closed'));
    portalCopy.setAttribute('aria-hidden', String(p !== 'closed'));
    pauseBtn.tabIndex = p === 'opened' ? 0 : -1;
    openBtn.disabled = p !== 'closed';
  }
  function play() { var r = video.play(); if (r && r.then) r.then(function () { setPlaying(true); }, function () { setPlaying(false); }); }

  video.addEventListener('play', function () { setPlaying(true); });
  video.addEventListener('pause', function () { setPlaying(false); });

  /* ---------- الموسيقى (ضع الملف في assets/music.mp3) ---------- */
  var audio = $('audio'), musicBtn = $('musicBtn');
  function startMusic() {
    var r = audio.play();
    if (r && r.then) r.then(function () { musicBtn.hidden = false; musicBtn.classList.remove('off'); musicBtn.setAttribute('aria-label', 'إيقاف الموسيقى'); }, function () { musicBtn.hidden = true; });
  }
  musicBtn.addEventListener('click', function () {
    if (audio.paused) { audio.play(); musicBtn.classList.remove('off'); musicBtn.setAttribute('aria-label', 'إيقاف الموسيقى'); }
    else { audio.pause(); musicBtn.classList.add('off'); musicBtn.setAttribute('aria-label', 'تشغيل الموسيقى'); }
  });

  openBtn.addEventListener('click', function () {
    if (phase !== 'closed') return;
    setPhase('opening');
    startMusic();
    var rm = reduced();
    if (!rm) play();
    clearTimeout(timer);
    timer = setTimeout(function () {
      setPhase('opened');
      pauseBtn.focus({ preventScroll: true });
    }, rm ? 80 : 2800);
  });
  pauseBtn.addEventListener('click', function () {
    if (video.paused) play(); else { video.pause(); setPlaying(false); }
  });
  $('replayBtn').addEventListener('click', function () {
    clearTimeout(timer);
    video.pause(); setPlaying(false); setPhase('closed');
    audio.pause(); audio.currentTime = 0; musicBtn.hidden = true;
    scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(function () { openBtn.focus({ preventScroll: true }); }, 100);
  });

  /* ---------- العداد التنازلي ---------- */
  var units = document.querySelectorAll('#countdown .count-unit b');
  var target = new Date('2027-05-20T16:00:00+03:00').getTime();
  function tick() {
    var r = Math.max(0, target - Date.now());
    var v = [Math.floor(r / 86400000), Math.floor(r / 3600000) % 24, Math.floor(r / 60000) % 60, Math.floor(r / 1000) % 60];
    for (var i = 0; i < 4; i++) units[i].textContent = String(v[i]).padStart(2, '0');
  }
  tick(); setInterval(tick, 1000);

  /* ---------- نافذة تأكيد الحضور ---------- */
  var root = $('dialogRoot'), overlay = $('dlgOverlay'), dlg = $('dlg'), lastFocus = null;
  function openDlg() {
    lastFocus = document.activeElement;
    overlay.dataset.state = 'open'; dlg.dataset.state = 'open';
    root.hidden = false;
    document.body.style.overflow = 'hidden';
    $('dlgOk').focus();
  }
  function closeDlg() {
    if (root.hidden) return;
    overlay.dataset.state = 'closed'; dlg.dataset.state = 'closed';
    setTimeout(function () {
      root.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, reduced() ? 0 : 200);
  }
  $('rsvpBtn').addEventListener('click', openDlg);
  $('dlgOk').addEventListener('click', closeDlg);
  $('dlgClose').addEventListener('click', closeDlg);
  overlay.addEventListener('click', closeDlg);
  document.addEventListener('keydown', function (e) {
    if (root.hidden) return;
    if (e.key === 'Escape') closeDlg();
    if (e.key === 'Tab') {
      var f = dlg.querySelectorAll('button'); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
