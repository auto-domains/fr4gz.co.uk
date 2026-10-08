// Click-to-play YouTube embeds and the video filter. Without JavaScript, the
// video links open YouTube instead.
(function () {
  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-yt]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(link.getAttribute('data-yt')) + '?autoplay=1&rel=0';
    frame.title = link.getAttribute('data-title') || 'YouTube video';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    var holder = document.createElement('div');
    holder.className = link.className + ' is-playing';
    holder.appendChild(frame);
    link.replaceWith(holder);
    frame.focus();
  });

  var filters = document.querySelector('[data-filters]');
  if (!filters) return;
  var buttons = Array.prototype.slice.call(filters.querySelectorAll('[data-filter]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-group-section]'));
  filters.hidden = false;
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-filter');
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      sections.forEach(function (section) {
        section.hidden = key !== 'all' && section.getAttribute('data-group-section') !== key;
      });
    });
  });
})();
