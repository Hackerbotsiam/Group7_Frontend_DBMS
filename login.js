// login.js — robust login that works with your existing PHP API

(() => {
  // 1) One base for everything. Point it to where your API actually lives.
  // Adjust ONLY this line if your path is different:
  const API_BASE = (window.API_BASE && window.API_BASE.replace(/\/$/, "")) ||
                   (location.origin + "/agriflowtrack_2/api"); // <- change path if needed

  // Normalize possible endpoints we can try (first that succeeds wins)
  const CANDIDATES = [
    // index.php with ?action=login (most common in your project)
    API_BASE.replace(/\/index\.php$/,"") + "/index.php?action=login",
    // REST-style route
    API_BASE.replace(/\/index\.php$/,"") + "/login",
    // Legacy direct PHP login (you have an auth_login.php in the repo)
    location.origin + "/agriflowtrack_2/auth_login.php"
  ];

  const form = document.getElementById("loginForm") || document.querySelector("form");
  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const msgEl  = document.getElementById("loginMessage") || document.getElementById("message");
  const button = form?.querySelector("button[type=submit]");

  function show(msg, ok=false) {
    if (!msgEl) return;
    msgEl.textContent = msg;
    msgEl.style.color = ok ? "#3ddc97" : "#ef4444";
  }

  async function tryOne(url, username, password) {
    // Send FormData so PHP can read $_POST without any special JSON parsing
    const fd = new FormData();
    fd.append("username", username);
    fd.append("password", password);
    // common alternates so any handler matches
    fd.append("user", username);
    fd.append("pass", password);
    fd.append("email", username);

    const res = await fetch(url, {
      method: "POST",
      body: fd,
      credentials: "include" // <- CRUCIAL so PHP session cookie is set
    });

    // Some handlers return 200 + json, others 302 or 401 on first attempt.
    // We’ll treat only explicit success as success.
    let data = null;
    try { data = await res.clone().json(); } catch { /* not JSON; ignore */ }

    // Success if:
    // - HTTP OK and json.ok !== false, OR
    // - handler returns {token:..., user:...}, OR
    // - handler sets PHPSESSID and replies 200 with anything
    const ok = res.ok && (
      (data && data.ok !== false) ||
      (data && (data.token || data.session || data.user)) ||
      (!data) // some minimal handlers just set the cookie with 200 and echo nothing
    );

    if (!ok) {
      const text = await res.text().catch(()=>"");
      const reason = (data && (data.message || data.error)) || text || `HTTP ${res.status}`;
      throw new Error(reason.trim());
    }
    return data || {};
  }

  async function doLogin(username, password) {
    let lastErr = null;
    for (const url of CANDIDATES) {
      try {
        return await tryOne(url, username, password);
      } catch (e) {
        lastErr = e;
        // continue to next candidate
      }
    }
    throw lastErr || new Error("Login failed");
  }

  async function onSubmit(e) {
    e.preventDefault();
    const u = (userEl?.value || "").trim();
    const p = passEl?.value || "";
    if (!u || !p) { show("Please enter username and password"); return; }

    button && (button.disabled = true);
    show("Signing in…", true);

    try {
      await doLogin(u, p);
      show("Signed in. Redirecting…", true);
      // redirect to your dashboard (change if your path differs)
      location.href = "./dashboard.html";
    } catch (err) {
      show("Invalid credentials");
      console.error("Login error:", err);
    } finally {
      button && (button.disabled = false);
    }
  }

  form?.addEventListener("submit", onSubmit);
})();
