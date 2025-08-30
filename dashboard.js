// dashboard.js

function apiBase(){
  const i = location.pathname.indexOf('/public/');
  const root = i > -1 ? location.pathname.slice(0, i) : '';
  return location.origin + root + '/api/index.php';
}
const API = apiBase();

async function request(url, opts = {}) {
  const r = await fetch(url, { credentials: 'include', ...opts });
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  }
  const t = await r.text();
  if (!r.ok) throw new Error(t || r.statusText);
  return t;
}

async function apiList(resource, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`${API}/${resource}${qs ? `?${qs}` : ''}`);
}

async function count(resource) {
  try {
    const res = await apiList(resource);
    if (Array.isArray(res)) return res.length;
    if (res && Array.isArray(res.data)) return res.data.length;
    return 0;
  } catch (_) {
    return 0;
  }
}

async function refreshCounts() {
  const [p, i, pe, ph] = await Promise.all([
    count('agricultural_products'),
    count('agri_inputs'),
    count('perishable_products'),
    count('post_harvest'),
  ]);
  document.getElementById('countProducts').textContent = p;
  document.getElementById('countInputs').textContent   = i;
  document.getElementById('countPerish').textContent   = pe;
  document.getElementById('countPost').textContent     = ph;
}

function esc(s){ return String(s ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

async function refreshMarket() {
  try {
    const res = await apiList('market_data', { limit: 10, offset: 0 });
    const rows = Array.isArray(res) ? res : (res.data || []);
    const tb = document.querySelector('#marketTable tbody');
    tb.innerHTML = '';
    if (!rows.length) {
      tb.innerHTML = `<tr><td colspan="4" style="text-align:center">No data</td></tr>`;
      return;
    }
    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${esc(r.market_name||'')}</td>
                      <td>${esc(r.product||'')}</td>
                      <td>${esc(r.price_per_unit ?? '')}</td>
                      <td>${esc(r.price_date||'')}</td>`;
      tb.appendChild(tr);
    });
  } catch (e) {
    console.error("Market fetch failed:", e);
  }
}

document.getElementById('refreshBtn').addEventListener('click', () => {
  refreshCounts(); refreshMarket();
});

refreshCounts();
refreshMarket();
