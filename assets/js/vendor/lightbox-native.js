/*
 * Dependency-free image viewer for links marked up as
 *   <a href="big.png" data-lightbox="group" data-title="Caption" data-alt="Alt text"><img ...></a>
 * Replaces lightbox2 + jQuery. Uses a native <dialog> (focus trap, Esc, focus return come for free).
 * Without <dialog> support the links simply open the image, as before.
 */
(function () {
  'use strict';
  if (typeof HTMLDialogElement !== 'function') { return; }

  var dialog, img, caption, counter, prevBtn, nextBtn;
  var group = [];
  var index = 0;

  function el(tag, cls, attrs) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function build() {
    dialog = el('dialog', 'lb-dialog', { 'aria-label': 'Image viewer' });
    var figure = el('figure', 'lb-figure');
    img = el('img', 'lb-image', { alt: '' });
    caption = el('figcaption', 'lb-caption');
    counter = el('span', 'lb-counter', { 'aria-live': 'polite' });
    var closeBtn = el('button', 'lb-btn lb-close', { type: 'button', 'aria-label': 'Close' });
    closeBtn.innerHTML = '&times;';
    prevBtn = el('button', 'lb-btn lb-prev', { type: 'button', 'aria-label': 'Previous image' });
    prevBtn.innerHTML = '&#8249;';
    nextBtn = el('button', 'lb-btn lb-next', { type: 'button', 'aria-label': 'Next image' });
    nextBtn.innerHTML = '&#8250;';

    figure.appendChild(img);
    figure.appendChild(caption);
    dialog.appendChild(figure);
    dialog.appendChild(counter);
    dialog.appendChild(closeBtn);
    dialog.appendChild(prevBtn);
    dialog.appendChild(nextBtn);
    document.body.appendChild(dialog);

    closeBtn.addEventListener('click', function () { dialog.close(); });
    prevBtn.addEventListener('click', function () { show(index - 1); });
    nextBtn.addEventListener('click', function () { show(index + 1); });
    // click on the backdrop (the dialog element itself) closes the viewer
    dialog.addEventListener('click', function (e) { if (e.target === dialog) { dialog.close(); } });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(index - 1); }
      if (e.key === 'ArrowRight') { show(index + 1); }
    });
    dialog.addEventListener('close', function () { img.removeAttribute('src'); });
  }

  function show(i) {
    if (group.length < 1) { return; }
    index = (i + group.length) % group.length;
    var link = group[index];
    img.src = link.getAttribute('href');
    img.alt = link.getAttribute('data-alt') || '';
    caption.textContent = link.getAttribute('data-title') || '';
    var multi = group.length > 1;
    prevBtn.hidden = nextBtn.hidden = counter.hidden = !multi;
    counter.textContent = multi ? (index + 1) + ' / ' + group.length : '';
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[data-lightbox]');
    if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
    e.preventDefault();
    if (!dialog) { build(); }
    var name = link.getAttribute('data-lightbox');
    group = Array.prototype.filter.call(document.querySelectorAll('a[data-lightbox]'), function (a) {
      return a.getAttribute('data-lightbox') === name;
    });
    show(group.indexOf(link));
    dialog.showModal();
  });
})();
