// ===== api.js (drop-in) =====
(function () {
  // One base for everything. Keep it the real path to your API.
  // If your entry point is /agriflowtrack/api/index.php leave as is:
  const ROOT = (window.API_BASE && window.API_BASE.replace(/\/$/, '')) ||
               (location.origin + '/agriflowtrack_up/api/index.php');
  const INDEX = /index\.php$/.test(ROOT) ? ROOT : (ROOT + '/index.php');

  // Small helper
  const toFD = (o) => {
    const fd = new FormData();
    Object.entries(o || {}).forEach(([k, v]) => fd.append(k, v ?? ''));
    return fd;
  };

  // ---- Auth ----
  async function apiLogin(username, password) {
    const fd = toFD({
      username, password,
      // send common alternates too (covers different server handlers)
      user: username, pass: password, email: username
    });

    // Try /login then ?action=login (both FormData), always sending cookie
    let res, json;

    try {
      res = await fetch(ROOT + '/login', { method: 'POST', body: fd, credentials: 'include' });
      json = await res.json();
      if (res.ok && json && json.ok !== false) return json;
    } catch (_) {}

    res = await fetch(INDEX + '?action=login', { method: 'POST', body: fd, credentials: 'include' });
    json = await res.json().catch(() => null);

    if (!res.ok || !json || json.ok === false)
      throw new Error((json && (json.message || json.error)) || 'Invalid credentials');

    return json;
  }

  async function apiLogout() {
    try { await fetch(ROOT + '/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
  }

  // ---- Generic CRUD via your existing entity/action API ----
  async function apiCall(entity, action, data = {}, method = 'POST') {
    const url = `${INDEX}?entity=${encodeURIComponent(entity)}&action=${encodeURIComponent(action)}`;
    const opts = { method, credentials: 'include' };
    if (method === 'POST') opts.body = (data instanceof FormData) ? data : toFD(data);
    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({ ok: false, message: 'Invalid JSON' }));
    if (!res.ok || json.ok === false) throw new Error(json.message || 'Request failed');
    return json;
  }

  const api = {
    login:  apiLogin,
    logout: apiLogout,
    list:   (entity)      => apiCall(entity, 'list', {}, 'GET').catch(() => apiCall(entity, 'list')),
    create: (entity, d)   => apiCall(entity, 'create', d),
    update: (entity, d)   => apiCall(entity, 'update', d),
    remove: (entity, id)  => apiCall(entity, 'delete', toFD({ id }))
  };

  // expose
  window.apiLogin = apiLogin;
  window.apiCall  = apiCall;
  window.api      = api;
})();
