// Tag filter on the home page + click-to-zoom images on project pages.
(function () {
  // ---- Header background once the page scrolls ----
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Tag filter ----
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('.cards .card');
  var empty = document.querySelector('.empty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = 0;
      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split('|');
        var show = f === 'all' || tags.indexOf(f) !== -1;
        card.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });

  // ---- Lightbox ----
  var box = document.querySelector('.lightbox');
  if (!box || typeof box.showModal !== 'function') return;
  var img = box.querySelector('img');
  var cap = box.querySelector('.lightbox-caption');
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.zoom');
    if (!a) return;
    e.preventDefault();
    var fig = a.closest('figure');
    var fc = fig && fig.querySelector('figcaption');
    img.src = a.getAttribute('href');
    img.alt = (a.querySelector('img') || {}).alt || '';
    cap.textContent = fc ? fc.textContent : '';
    box.showModal();
  });
  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('lightbox-close')) box.close();
  });
})();
