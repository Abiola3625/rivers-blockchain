// Light and dark themes. Runs before the page paints, so there is no flash of the wrong theme.
(function () {
  var key = 'rvTheme', saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}
  var light = saved ? saved === 'light' : matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.setAttribute('data-theme', light ? 'light' : 'dark');
  window.rvSetTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(key, t); } catch (e) {}
    window.dispatchEvent(new CustomEvent('rvtheme', { detail: t }));
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('#themeBtn');
    if (!b) return;
    window.rvSetTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });
})();
