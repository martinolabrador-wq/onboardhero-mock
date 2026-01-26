/* OnboardHero Prototype — single-page static app (hash router) */

const state = {
  session: ohLoad(OH_KEYS.session, { isAuthed: false }),
  user: OH_DEFAULTS.user
};

const routes = [
  { path: "#/login", view: viewLogin },
  { path: "#/dashboard", view: viewDashboard },
  { path: "#/journeys", view: viewJourneys },
  { path: "#/templates", view: viewTemplates },
  { path: "#/people", view: viewPeople },
  { path: "#/analytics", view: viewAnalytics },
  { path: "#/settings", view: viewSettings },
];

// --- Helpers ---
function $(sel){ return document.querySelector(sel); }
function escapeHtml(s=""){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function nowIso(){
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function toast(msg, type="info"){
  const host = $("#toastHost");
  const id = "t" + Math.random().toString(16).slice(2);
  const icon = type==="success" ? "check-circle" : type==="danger" ? "exclamation-triangle" : "info-circle";
  const html = `
  <div id="${id}" class="toast oh-card" role="status" aria-live="polite" aria-atomic="true">
    <div class="toast-header bg-transparent border-0 text-white">
      <i class="bi bi-${icon} me-2"></i>
      <strong class="me-auto">OnboardHero</strong>
      <small class="text-muted-oh">ahora</small>
      <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
    <div class="toast-body pt-0">${escapeHtml(msg)}</div>
  </div>`;
  host.insertAdjacentHTML("beforeend", html);
  const el = $("#"+id);
  const t = new bootstrap.Toast(el, { delay: 2600 });
  el.addEventListener("hidden.bs.toast", ()=> el.remove());
  t.show();
}

function navigate(path){
  location.hash = path;
}

function requireAuth(){
  if(!state.session?.isAuthed){
    navigate("#/login");
    return false;
  }
  return true;
}

// --- Storage accessors ---
function getJourneys(){ return ohLoad(OH_KEYS.journeys, []); }
function setJourneys(v){ ohSave(OH_KEYS.journeys, v); }
function getPeople(){ return ohLoad(OH_KEYS.people, []); }
function setPeople(v){ ohSave(OH_KEYS.people, v); }
function getSettings(){ return ohLoad(OH_KEYS.settings, OH_DEFAULTS.settings); }
function setSettings(v){ ohSave(OH_KEYS.settings, v); }

// --- Shell ---
function renderShell(contentHtml){
  const brand = getSettings().brandName || "OnboardHero";
  const current = location.hash || "#/dashboard";

  $("#app").innerHTML = `
    <div class="oh-shell">
      <aside class="oh-sidebar p-3">
        <div class="d-flex align-items-center gap-2 px-2 py-2 mb-2">
          <div class="rounded-3 p-2" style="background: rgba(124,92,255,.20); border:1px solid rgba(124,92,255,.35)">
            <i class="bi bi-stars"></i>
          </div>
          <div>
            <div class="fw-semibold">${escapeHtml(brand)}</div>
            <div class="smallcaps">onboarding ops</div>
          </div>
        </div>

        <div class="oh-card-soft p-3 mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="smallcaps">workspace</div>
              <div class="fw-semibold">${escapeHtml(state.user.company)}</div>
              <div class="text-muted-oh small">${escapeHtml(state.user.role)}</div>
            </div>
            <span class="badge oh-badge badge-accent">Prototype</span>
          </div>
        </div>

        <nav class="nav flex-column oh-nav gap-1">
          ${navLink("#/dashboard","bi-speedometer2","Dashboard", current)}
          ${navLink("#/journeys","bi-diagram-3","Journeys", current)}
          ${navLink("#/templates","bi-grid-3x3-gap","Templates", current)}
          ${navLink("#/people","bi-people","People", current)}
          ${navLink("#/analytics","bi-graph-up","Analytics", current)}
          ${navLink("#/settings","bi-gear","Settings", current)}
        </nav>

        <div class="mt-4 pt-3 border-top" style="border-color: var(--oh-border) !important;">
          <button class="btn btn-outline-light w-100" id="btnLogout">
            <i class="bi bi-box-arrow-right me-2"></i>Salir
          </button>
          <div class="text-muted-oh small mt-2">UX-first demo: flows, estados y datos simulados.</div>
        </div>
      </aside>

      <main class="oh-main">
        <header class="oh-topbar px-3 py-3">
          <div class="container-fluid">
            <div class="d-flex align-items-center justify-content-between gap-3">
              <div class="d-flex align-items-center gap-2">
                <div class="fw-semibold">Welcome back, ${escapeHtml(state.user.name.split(" ")[0])}</div>
                <span class="badge oh-badge">Mon, 26 Jan 2026</span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div class="input-group" style="max-width: 360px;">
                  <span class="input-group-text bg-transparent border-0 text-white-50"><i class="bi bi-search"></i></span>
                  <input id="globalSearch" class="form-control oh-input" placeholder="Search journeys, people, templates…" aria-label="Buscar" />
                </div>
                <button class="btn btn-accent" id="btnQuickCreate">
                  <i class="bi bi-plus-lg me-1"></i>New journey
                </button>
                <div class="rounded-circle d-flex align-items-center justify-content-center" style="width:38px;height:38px;background:rgba(255,255,255,.08);border:1px solid var(--oh-border)">
                  <i class="bi bi-person-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section class="p-3 p-lg-4">
          <div class="container-fluid">
            ${contentHtml}
          </div>
        </section>
      </main>
    </div>
  `;

  // Shell events
  $("#btnLogout").addEventListener("click", ()=>{
    state.session = { isAuthed: false };
    ohSave(OH_KEYS.session, state.session);
    toast("Sesión cerrada.", "success");
    navigate("#/login");
  });

  $("#btnQuickCreate").addEventListener("click", ()=>{
    openJourneyWizard();
  });

  $("#globalSearch").addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      const q = e.target.value.trim().toLowerCase();
      if(!q) return;
      // simple heuristic: send to most relevant section
      if(q.includes("template") || q.includes("industr")) return navigate("#/templates");
      if(q.includes("ana") || q.includes("diego") || q.includes("people") || q.includes("persona")) return navigate("#/people");
      navigate("#/journeys");
      toast(`Buscando “${q}” (demo)`, "info");
    }
  });
}

function navLink(path, icon, label, current){
  const active = current.startsWith(path) ? "active" : "";
  return `<a class="nav-link ${active}" href="${path}">
    <i class="bi ${icon}"></i><span>${label}</span>
  </a>`;
}

// --- Router ---
function render(){
  const hash = location.hash || (state.session.isAuthed ? "#/dashboard" : "#/login");
  const match = routes.find(r => hash.startsWith(r.path)) || routes[0];

  // Public route
  if(match.path === "#/login"){
    $("#app").innerHTML = match.view();
    bindLogin();
    return;
  }

  if(!requireAuth()) return;

  // Protected views render inside shell
  renderShell(match.view());
  bindGlobalModals(); // ensure modals present
  bindViewEvents(hash);
}

window.addEventListener("hashchange", render);
window.addEventListener("load", ()=>{
  // authed? go dashboard
  if(state.session?.isAuthed && !location.hash) location.hash = "#/dashboard";
  render();
});

// --- Login view ---
function viewLogin(){
  return `
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-5">
        <div class="text-center mb-4">
          <div class="d-inline-flex align-items-center gap-2 px-3 py-2 oh-pill">
            <i class="bi bi-stars"></i>
            <span class="fw-semibold">OnboardHero</span>
            <span class="text-muted-oh small">Prototype</span>
          </div>
          <h1 class="mt-4 fw-bold">Onboarding, convertido en sistema.</h1>
          <p class="text-muted-oh mb-0">Plantillas + automatización + journeys 30/60/90. Configurable en minutos. Medible desde el día 1.</p>
        </div>

        <div class="oh-card p-4 p-lg-4">
          <div class="mb-3">
            <label class="form-label text-muted-oh">Email</label>
            <input id="loginEmail" class="form-control oh-input" placeholder="name@company.com" value="guillermo@onboardhero.io" />
          </div>
          <div class="mb-3">
            <label class="form-label text-muted-oh">Password</label>
            <input id="loginPass" type="password" class="form-control oh-input" placeholder="••••••••" value="demo" />
          </div>

          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember" checked>
              <label class="form-check-label text-muted-oh" for="remember">Remember me</label>
            </div>
            <a href="javascript:void(0)" class="text-muted-oh small">Forgot password?</a>
          </div>

          <button id="btnLogin" class="btn btn-accent w-100 py-2">
            <i class="bi bi-arrow-right-circle me-2"></i>Enter workspace
          </button>

          <div class="mt-3 small text-muted-oh">
            Demo tip: crea un Journey desde <span class="badge oh-badge">New journey</span> y asígnalo a un “new hire”.
          </div>
        </div>

        <div class="text-center mt-4 text-muted-oh small">
          © 2026 OnboardHero — UX prototype for TFM defense.
        </div>
      </div>
    </div>
  </div>`;
}

function bindLogin(){
  $("#btnLogin").addEventListener("click", ()=>{
    state.session = { isAuthed: true };
    ohSave(OH_KEYS.session, state.session);
    toast("Bienvenido. Workspace cargado.", "success");
    navigate("#/dashboard");
  });
}

// --- Views ---
function viewDashboard(){
  const people = getPeople();
  const journeys = getJourneys();

  const active = journeys.filter(j=>j.status==="Active").length;
  const invited = people.filter(p=>p.status==="Invited").length;
  const onboarding = people.filter(p=>p.status==="Onboarding").length;
  const avgProgress = people.length ? Math.round(people.reduce((a,p)=>a + (p.progress||0),0)/people.length) : 0;

  const rows = people.slice(0,6).map(p => `
    <tr>
      <td class="fw-semibold">${escapeHtml(p.name)}</td>
      <td><span class="badge oh-badge">${escapeHtml(p.role)}</span></td>
      <td class="text-muted-oh">${escapeHtml(p.startDate)}</td>
      <td>${statusBadge(p.status)}</td>
      <td style="min-width:170px">
        <div class="d-flex align-items-center gap-2">
          <div class="progress flex-grow-1" role="progressbar" aria-label="progreso" aria-valuenow="${p.progress}" aria-valuemin="0" aria-valuemax="100" style="height:8px;background:rgba(255,255,255,.06);">
            <div class="progress-bar" style="width:${p.progress}%; background: rgba(32,201,151,.9)"></div>
          </div>
          <div class="text-muted-oh small">${p.progress}%</div>
        </div>
      </td>
    </tr>`).join("");

  return `
    <div class="row g-3 mb-3">
      ${kpiCard("Active journeys", active, "bi-diagram-3", "badge-accent")}
      ${kpiCard("New hires onboarding", onboarding, "bi-person-check", "badge-success2")}
      ${kpiCard("Invites pending", invited, "bi-envelope-paper", "")}
      ${kpiCard("Avg progress", avgProgress + "%", "bi-speedometer", "")}
    </div>

    <div class="row g-3">
      <div class="col-12 col-xl-7">
        <div class="oh-card p-3 p-lg-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <div class="fw-semibold">New hires</div>
              <div class="text-muted-oh small">Visibility without micromanagement: progreso, bloqueos y próximos hitos.</div>
            </div>
            <a class="btn btn-outline-light btn-sm" href="#/people"><i class="bi bi-arrow-right me-1"></i>Open People</a>
          </div>

          <div class="table-responsive">
            <table class="table table-sm table-oh align-middle mb-0">
              <thead>
                <tr class="text-muted-oh">
                  <th>Name</th><th>Role</th><th>Start</th><th>Status</th><th>Progress</th>
                </tr>
              </thead>
              <tbody>${rows || emptyRow("No hires yet. Add people to start tracking onboarding.")}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-5">
        <div class="oh-card p-3 p-lg-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <div class="fw-semibold">Onboarding health</div>
              <div class="text-muted-oh small">Demo chart: completion trend across cohorts.</div>
            </div>
            <span class="badge oh-badge">Last 8 weeks</span>
          </div>

          <div class="mt-3">
            <canvas id="chartHealth" height="220" aria-label="chart"></canvas>
          </div>

          <div class="row g-2 mt-3">
            <div class="col-6">
              <div class="oh-card-soft p-3">
                <div class="text-muted-oh small">At-risk</div>
                <div class="kpi">2</div>
                <div class="text-muted-oh small">low activity 7d</div>
              </div>
            </div>
            <div class="col-6">
              <div class="oh-card-soft p-3">
                <div class="text-muted-oh small">Time-to-ready</div>
                <div class="kpi">18d</div>
                <div class="text-muted-oh small">median</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

function viewJourneys(){
  const journeys = getJourneys();
  return `
    <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h2 class="fw-bold mb-1">Journeys</h2>
        <div class="text-muted-oh">Standardize onboarding by role and industry. Measure adoption, not effort.</div>
      </div>
      <div class="d-flex gap-2">
        <div class="input-group" style="max-width: 320px;">
          <span class="input-group-text bg-transparent border-0 text-white-50"><i class="bi bi-search"></i></span>
          <input id="journeySearch" class="form-control oh-input" placeholder="Search journeys…" />
        </div>
        <button class="btn btn-accent" id="btnCreateJourney"><i class="bi bi-plus-lg me-1"></i>Create</button>
      </div>
    </div>

    <div class="oh-card p-3 p-lg-4">
      <div class="table-responsive">
        <table class="table table-oh align-middle mb-0">
          <thead>
            <tr class="text-muted-oh">
              <th>Journey</th><th>Role</th><th>Industry</th><th>Status</th><th>Last update</th><th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody id="journeysTbody">
            ${journeys.map(j=>journeyRow(j)).join("") || emptyRow("No journeys yet. Create your first 30/60/90 journey.")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function viewTemplates(){
  const cards = OH_DEFAULTS.templates.map(t => `
    <div class="col-12 col-md-6 col-xl-3">
      <div class="oh-card p-3 h-100">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="smallcaps">${escapeHtml(t.industry)}</div>
            <div class="fw-semibold mt-1">${escapeHtml(t.title)}</div>
            <div class="text-muted-oh small mt-1">Level: <span class="badge oh-badge">${escapeHtml(t.level)}</span></div>
          </div>
          <div class="rounded-3 p-2" style="background:rgba(255,255,255,.06);border:1px solid var(--oh-border)">
            <i class="bi bi-bookmarks"></i>
          </div>
        </div>
        <div class="mt-3 d-flex flex-wrap gap-2">
          ${t.tags.map(tag=>`<span class="badge oh-badge">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-outline-light btn-sm w-50" data-template="${t.id}" data-action="preview"><i class="bi bi-eye me-1"></i>Preview</button>
          <button class="btn btn-accent btn-sm w-50" data-template="${t.id}" data-action="use"><i class="bi bi-magic me-1"></i>Use</button>
        </div>
      </div>
    </div>
  `).join("");

  return `
    <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h2 class="fw-bold mb-1">Templates library</h2>
        <div class="text-muted-oh">Start from proven playbooks. Customize in minutes. Keep quality consistent.</div>
      </div>
      <div class="oh-pill">
        <i class="bi bi-shield-check me-2"></i><span class="text-muted-oh small">Best practice packs</span>
      </div>
    </div>

    <div class="row g-3" id="templatesGrid">
      ${cards}
    </div>
  `;
}

function viewPeople(){
  const people = getPeople();
  const journeys = getJourneys();

  const rows = people.map(p => `
    <tr>
      <td class="fw-semibold">${escapeHtml(p.name)}</td>
      <td><span class="badge oh-badge">${escapeHtml(p.role)}</span></td>
      <td class="text-muted-oh">${escapeHtml(p.manager)}</td>
      <td class="text-muted-oh">${escapeHtml(p.startDate)}</td>
      <td>${statusBadge(p.status)}</td>
      <td>${p.journeyId ? `<span class="badge oh-badge badge-accent">${escapeHtml(p.journeyId)}</span>` : `<span class="text-muted-oh">—</span>`}</td>
      <td class="text-end">
        <button class="btn btn-outline-light btn-sm" data-action="openPerson" data-id="${p.id}">
          <i class="bi bi-box-arrow-up-right me-1"></i>Open
        </button>
      </td>
    </tr>
  `).join("");

  return `
    <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h2 class="fw-bold mb-1">People</h2>
        <div class="text-muted-oh">Track onboarding like a product: clarity, accountability, and measurable progress.</div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-light" id="btnInviteDemo"><i class="bi bi-envelope-plus me-1"></i>Invite</button>
        <a class="btn btn-accent" href="#/journeys"><i class="bi bi-diagram-3 me-1"></i>Manage journeys</a>
      </div>
    </div>

    <div class="oh-card p-3 p-lg-4">
      <div class="table-responsive">
        <table class="table table-oh align-middle mb-0">
          <thead>
            <tr class="text-muted-oh">
              <th>Name</th><th>Role</th><th>Manager</th><th>Start</th><th>Status</th><th>Journey</th><th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows || emptyRow("No people yet. Invite a new hire to start the onboarding journey.")}
          </tbody>
        </table>
      </div>
    </div>

    ${modalPersonDetail(journeys)}
  `;
}

function viewAnalytics(){
  return `
    <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h2 class="fw-bold mb-1">Analytics</h2>
        <div class="text-muted-oh">Measure time-to-productivity, adoption, and quality — not just completion.</div>
      </div>
      <div class="d-flex gap-2">
        <span class="badge oh-badge">Cohorts</span>
        <span class="badge oh-badge">Roles</span>
        <span class="badge oh-badge">Industries</span>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12 col-xl-7">
        <div class="oh-card p-3 p-lg-4">
          <div class="fw-semibold">Completion by week</div>
          <div class="text-muted-oh small">Demo chart: track consistency and bottlenecks.</div>
          <div class="mt-3"><canvas id="chartCompletion" height="240"></canvas></div>
        </div>
      </div>
      <div class="col-12 col-xl-5">
        <div class="oh-card p-3 p-lg-4">
          <div class="fw-semibold">Quality signals</div>
          <div class="text-muted-oh small">Short feedback loop for HR + managers.</div>

          <div class="row g-2 mt-3">
            <div class="col-6">
              <div class="oh-card-soft p-3">
                <div class="text-muted-oh small">Drop-off risk</div>
                <div class="kpi">6%</div>
                <div class="text-muted-oh small">first 30 days</div>
              </div>
            </div>
            <div class="col-6">
              <div class="oh-card-soft p-3">
                <div class="text-muted-oh small">Manager touches</div>
                <div class="kpi">2.4</div>
                <div class="text-muted-oh small">per week</div>
              </div>
            </div>
            <div class="col-12">
              <div class="oh-card-soft p-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="text-muted-oh small">Employee sentiment</div>
                    <div class="kpi">8.6</div>
                  </div>
                  <span class="badge oh-badge badge-success2">Up</span>
                </div>
                <div class="text-muted-oh small mt-1">Pulse survey (demo metric)</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

function viewSettings(){
  const s = getSettings();
  return `
    <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
      <div>
        <h2 class="fw-bold mb-1">Settings</h2>
        <div class="text-muted-oh">Make onboarding consistent with your brand and governance.</div>
      </div>
      <button class="btn btn-accent" id="btnSaveSettings"><i class="bi bi-check2-circle me-1"></i>Save</button>
    </div>

    <div class="row g-3">
      <div class="col-12 col-xl-6">
        <div class="oh-card p-3 p-lg-4">
          <div class="fw-semibold mb-2">Brand</div>
          <div class="mb-3">
            <label class="form-label text-muted-oh">Workspace name</label>
            <input id="setBrandName" class="form-control oh-input" value="${escapeHtml(s.brandName)}" />
          </div>
          <div class="mb-1 text-muted-oh small">Tip: en el TFM, refuerza que el “branding” reduce fricción y aumenta adopción.</div>
        </div>
      </div>

      <div class="col-12 col-xl-6">
        <div class="oh-card p-3 p-lg-4">
          <div class="fw-semibold mb-2">Notifications</div>
          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" id="setNotifEmail" ${s.notificationsEmail ? "checked":""}>
            <label class="form-check-label" for="setNotifEmail">Email notifications</label>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="setNotifSlack" ${s.notificationsSlack ? "checked":""}>
            <label class="form-check-label" for="setNotifSlack">Slack notifications</label>
          </div>

          <div class="fw-semibold mb-2">Permissions</div>
          <select id="setPermMode" class="form-select oh-input">
            ${["Role-based","Team-based","Custom"].map(x=>`<option ${s.permissionMode===x?"selected":""}>${x}</option>`).join("")}
          </select>
          <div class="text-muted-oh small mt-2">Governance simple para escalar sin caos (HR + managers + IT).</div>
        </div>
      </div>
    </div>
  `;
}

// --- Bind events by view ---
function bindViewEvents(hash){
  if(hash.startsWith("#/dashboard")){
    setTimeout(()=> initDashboardCharts(), 60);
  }
  if(hash.startsWith("#/journeys")){
    $("#btnCreateJourney").addEventListener("click", openJourneyWizard);
    $("#journeySearch").addEventListener("input", (e)=>{
      const q = e.target.value.trim().toLowerCase();
      const filtered = getJourneys().filter(j =>
        (j.name+j.role+j.industry+j.status).toLowerCase().includes(q)
      );
      $("#journeysTbody").innerHTML = filtered.map(j=>journeyRow(j)).join("") || emptyRow("No results. Try another keyword.");
      bindJourneyRowActions();
    });
    bindJourneyRowActions();
  }
  if(hash.startsWith("#/templates")){
    $("#templatesGrid").addEventListener("click", (e)=>{
      const btn = e.target.closest("button[data-action]");
      if(!btn) return;
      const action = btn.dataset.action;
      const id = btn.dataset.template;
      const t = OH_DEFAULTS.templates.find(x=>x.id===id);
      if(action==="preview") return openTemplatePreview(t);
      if(action==="use"){
        toast(`Template “${t.title}” applied (demo).`, "success");
        openJourneyWizard({ fromTemplate: t });
      }
    });
  }
  if(hash.startsWith("#/people")){
    $("#btnInviteDemo").addEventListener("click", ()=>{
      toast("Invite sent (demo).", "success");
    });

    document.body.addEventListener("click", (e)=>{
      const btn = e.target.closest("button[data-action='openPerson']");
      if(!btn) return;
      openPersonModal(btn.dataset.id);
    });

    $("#btnSavePerson").addEventListener("click", savePersonModal);
  }
  if(hash.startsWith("#/analytics")){
    setTimeout(()=> initAnalyticsCharts(), 60);
  }
  if(hash.startsWith("#/settings")){
    $("#btnSaveSettings").addEventListener("click", ()=>{
      const s = getSettings();
      s.brandName = $("#setBrandName").value.trim() || "OnboardHero";
      s.notificationsEmail = $("#setNotifEmail").checked;
      s.notificationsSlack = $("#setNotifSlack").checked;
      s.permissionMode = $("#setPermMode").value;
      setSettings(s);
      toast("Settings saved.", "success");
      render(); // refresh brand in sidebar
    });
  }
}

// --- Components ---
function kpiCard(label, value, icon, badgeClass=""){
  return `
  <div class="col-12 col-md-6 col-xl-3">
    <div class="oh-card p-3 p-lg-4 h-100">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="text-muted-oh small">${escapeHtml(label)}</div>
          <div class="kpi">${escapeHtml(String(value))}</div>
        </div>
        <span class="badge oh-badge ${badgeClass}"><i class="bi ${icon} me-1"></i></span>
      </div>
      <div class="text-muted-oh small mt-2">Operational clarity → faster time-to-productivity.</div>
    </div>
  </div>`;
}

function statusBadge(status){
  const map = {
    "Active": ["badge-success2","Active"],
    "Draft": ["","Draft"],
    "Archived": ["","Archived"],
    "Onboarding": ["badge-success2","Onboarding"],
    "Invited": ["badge-accent","Invited"],
    "Completed": ["badge-success2","Completed"]
  };
  const [cls, txt] = map[status] || ["", status];
  return `<span class="badge oh-badge ${cls}">${escapeHtml(txt)}</span>`;
}

function emptyRow(msg){
  return `<tr><td colspan="6" class="text-center text-muted-oh py-4">${escapeHtml(msg)}</td></tr>`;
}

function journeyRow(j){
  return `
  <tr>
    <td>
      <div class="fw-semibold">${escapeHtml(j.name)}</div>
      <div class="text-muted-oh small">${escapeHtml(j.id)}</div>
    </td>
    <td><span class="badge oh-badge">${escapeHtml(j.role)}</span></td>
    <td class="text-muted-oh">${escapeHtml(j.industry)}</td>
    <td>${statusBadge(j.status)}</td>
    <td class="text-muted-oh">${escapeHtml(j.updatedAt)}</td>
    <td class="text-end">
      <button class="btn btn-outline-light btn-sm me-2" data-action="duplicateJourney" data-id="${j.id}">
        <i class="bi bi-files me-1"></i>Duplicate
      </button>
      <button class="btn btn-outline-light btn-sm" data-action="archiveJourney" data-id="${j.id}">
        <i class="bi bi-archive me-1"></i>Archive
      </button>
    </td>
  </tr>`;
}

function bindJourneyRowActions(){
  document.querySelectorAll("button[data-action='duplicateJourney']").forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.id;
      const journeys = getJourneys();
      const src = journeys.find(x=>x.id===id);
      if(!src) return;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = "J-" + Math.floor(1000 + Math.random()*9000);
      copy.name = copy.name + " (Copy)";
      copy.status = "Draft";
      copy.updatedAt = nowIso();
      journeys.unshift(copy);
      setJourneys(journeys);
      toast("Journey duplicated.", "success");
      render();
    };
  });

  document.querySelectorAll("button[data-action='archiveJourney']").forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.id;
      const journeys = getJourneys();
      const j = journeys.find(x=>x.id===id);
      if(!j) return;
      j.status = "Archived";
      j.updatedAt = nowIso();
      setJourneys(journeys);
      toast("Journey archived.", "success");
      render();
    };
  });
}

// --- Charts ---
function initDashboardCharts(){
  const ctx = $("#chartHealth");
  if(!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
      datasets: [{
        label: "Completion %",
        data: [18, 24, 33, 42, 49, 55, 63, 70],
        tension: .35,
        borderWidth: 2,
        pointRadius: 3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,.6)" }, grid: { color: "rgba(255,255,255,.06)" } },
        y: { ticks: { color: "rgba(255,255,255,.6)" }, grid: { color: "rgba(255,255,255,.06)" }, suggestedMin: 0, suggestedMax: 100 }
      }
    }
  });
}

function initAnalyticsCharts(){
  const ctx = $("#chartCompletion");
  if(!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
      datasets: [{
        label: "Completed tasks",
        data: [120, 148, 160, 182, 205, 230, 245, 268],
        borderWidth: 1
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "rgba(255,255,255,.6)" }, grid: { color: "rgba(255,255,255,.06)" } },
        y: { ticks: { color: "rgba(255,255,255,.6)" }, grid: { color: "rgba(255,255,255,.06)" } }
      }
    }
  });
}

// --- Template preview (modal) ---
function bindGlobalModals(){
  if($("#modalTemplatePreview")) return;
  document.body.insertAdjacentHTML("beforeend", `
  <div class="modal fade" id="modalTemplatePreview" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content oh-card">
        <div class="modal-header border-0">
          <div>
            <div class="smallcaps" id="tplIndustry"></div>
            <div class="fw-semibold" id="tplTitle"></div>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="text-muted-oh small mb-3">Preview (demo): muestra estructura y resultados esperados.</div>

          <div class="row g-2">
            <div class="col-12 col-md-4">
              <div class="oh-card-soft p-3">
                <div class="fw-semibold">30 days</div>
                <ul class="text-muted-oh small mb-0 mt-2">
                  <li>Access + tools</li><li>Role clarity</li><li>First wins</li><li>Buddy system</li>
                </ul>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="oh-card-soft p-3">
                <div class="fw-semibold">60 days</div>
                <ul class="text-muted-oh small mb-0 mt-2">
                  <li>Manager cadence</li><li>Playbooks</li><li>Skill validation</li><li>Peer feedback</li>
                </ul>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="oh-card-soft p-3">
                <div class="fw-semibold">90 days</div>
                <ul class="text-muted-oh small mb-0 mt-2">
                  <li>Autonomy</li><li>KPIs ownership</li><li>Growth plan</li><li>Quarter goals</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Close</button>
          <button class="btn btn-accent" id="tplUseBtn"><i class="bi bi-magic me-1"></i>Use template</button>
        </div>
      </div>
    </div>
  </div>
  `);
}

function openTemplatePreview(t){
  $("#tplIndustry").textContent = t.industry;
  $("#tplTitle").textContent = t.title;

  $("#tplUseBtn").onclick = ()=>{
    bootstrap.Modal.getInstance($("#modalTemplatePreview")).hide();
    toast(`Template “${t.title}” applied (demo).`, "success");
    openJourneyWizard({ fromTemplate: t });
  };

  new bootstrap.Modal($("#modalTemplatePreview")).show();
}

// --- People modal ---
function modalPersonDetail(journeys){
  return `
  <div class="modal fade" id="modalPerson" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content oh-card">
        <div class="modal-header border-0">
          <div>
            <div class="smallcaps">Person detail</div>
            <div class="fw-semibold" id="personName">—</div>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div class="oh-card-soft p-3">
                <div class="text-muted-oh small">Role</div>
                <div class="fw-semibold" id="personRole">—</div>
                <div class="text-muted-oh small mt-2">Manager</div>
                <div class="fw-semibold" id="personMgr">—</div>
                <div class="text-muted-oh small mt-2">Start date</div>
                <div class="fw-semibold" id="personStart">—</div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="oh-card-soft p-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="text-muted-oh small">Progress</div>
                    <div class="kpi" id="personProg">—</div>
                  </div>
                  <span id="personStatus" class="badge oh-badge">—</span>
                </div>
                <div class="progress mt-2" style="height:10px;background:rgba(255,255,255,.06);">
                  <div class="progress-bar" id="personProgBar" style="width:0%;background:rgba(32,201,151,.9)"></div>
                </div>

                <div class="text-muted-oh small mt-3">Assigned journey</div>
                <select id="personJourney" class="form-select oh-input">
                  <option value="">— None —</option>
                  ${journeys.map(j=>`<option value="${j.id}">${escapeHtml(j.id)} — ${escapeHtml(j.name)}</option>`).join("")}
                </select>

                <div class="text-muted-oh small mt-2">Status</div>
                <select id="personStatusSel" class="form-select oh-input">
                  ${["Invited","Onboarding","Completed"].map(x=>`<option>${x}</option>`).join("")}
                </select>
              </div>
            </div>

            <div class="col-12">
              <div class="oh-card-soft p-3">
                <div class="fw-semibold">Manager checklist (demo)</div>
                <div class="text-muted-oh small">Asegura consistencia: 3 toques clave para reducir drop-off.</div>
                <div class="row g-2 mt-2">
                  ${["Kickoff 1:1", "Week-2 feedback", "Day-30 review"].map(x=>`
                    <div class="col-12 col-md-4">
                      <div class="d-flex gap-2 align-items-center">
                        <input class="form-check-input" type="checkbox" checked />
                        <div class="text-muted-oh small">${escapeHtml(x)}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            </div>

          </div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-outline-light" data-bs-dismiss="modal">Close</button>
          <button class="btn btn-accent" id="btnSavePerson"><i class="bi bi-check2 me-1"></i>Save changes</button>
        </div>
      </div>
    </div>
  </div>
  `;
}

let currentPersonId = null;

function openPersonModal(id){
  const p = getPeople().find(x=>x.id===id);
  if(!p) return;

  currentPersonId = id;
  $("#personName").textContent = p.name;
  $("#personRole").textContent = p.role;
  $("#personMgr").textContent = p.manager;
  $("#personStart").textContent = p.startDate;

  $("#personProg").textContent = `${p.progress || 0}%`;
  $("#personProgBar").style.width = `${p.progress || 0}%`;
  $("#personStatus").outerHTML = statusBadge(p.status).replace('oh-badge', 'oh-badge').replace('>', ` id="personStatus">`);

  $("#personJourney").value = p.journeyId || "";
  $("#personStatusSel").value = p.status;

  new bootstrap.Modal($("#modalPerson")).show();
}

function savePersonModal(){
  const people = getPeople();
  const p = people.find(x=>x.id===currentPersonId);
  if(!p) return;

  p.journeyId = $("#personJourney").value || "";
  p.status = $("#personStatusSel").value;

  // Demo: if completed, set 100
  if(p.status === "Completed") p.progress = 100;
  if(p.status === "Invited") p.progress = 0;

  setPeople(people);
  toast("Person updated.", "success");

  bootstrap.Modal.getInstance($("#modalPerson")).hide();
  render();
}

// --- Journey Wizard (modal injected) ---
function openJourneyWizard(opts = {}){
  if(!$("#modalJourneyWizard")){
    document.body.insertAdjacentHTML("beforeend", journeyWizardModal());
  }
  const fromTemplate = opts.fromTemplate || null;

  // reset wizard
  $("#jwName").value = fromTemplate ? `${fromTemplate.title} — 30/60/90` : "New journey — 30/60/90";
  $("#jwRole").value = fromTemplate ? (fromTemplate.title.includes("SDR") ? "Sales Development Rep" : "Role") : "Role";
  $("#jwIndustry").value = fromTemplate ? fromTemplate.industry : "SaaS B2B";

  $("#jw30").value = fromTemplate ? "Access & tools\nRole clarity\nBuddy system\nFirst wins" : "Access & tools\nRole clarity\nBuddy system\nFirst wins";
  $("#jw60").value = "Manager cadence\nPlaybooks\nSkill validation\nPeer feedback";
  $("#jw90").value = "Autonomy\nKPIs ownership\nGrowth plan\nQuarter goals";

  setWizardStep(1);

  $("#btnJwNext").onclick = ()=> setWizardStep(Math.min(3, wizardStep()+1));
  $("#btnJwBack").onclick = ()=> setWizardStep(Math.max(1, wizardStep()-1));
  $("#btnJwSave").onclick = saveWizardJourney;

  new bootstrap.Modal($("#modalJourneyWizard")).show();
}

function journeyWizardModal(){
  return `
  <div class="modal fade" id="modalJourneyWizard" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content oh-card">
        <div class="modal-header border-0">
          <div>
            <div class="smallcaps">Create journey</div>
            <div class="fw-semibold">Wizard — build a 30/60/90 onboarding system</div>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span id="stepPill1" class="badge oh-badge badge-accent">1 — Role</span>
            <span id="stepPill2" class="badge oh-badge">2 — 30/60/90</span>
            <span id="stepPill3" class="badge oh-badge">3 — Review</span>
          </div>

          <div id="jwStep1">
            <div class="row g-3">
              <div class="col-12 col-lg-6">
                <div class="oh-card-soft p-3">
                  <div class="fw-semibold">Basics</div>
                  <div class="text-muted-oh small">Crea claridad: rol, industria y objetivo del journey.</div>
                  <div class="mt-3">
                    <label class="form-label text-muted-oh">Journey name</label>
                    <input id="jwName" class="form-control oh-input" />
                  </div>
                  <div class="mt-3">
                    <label class="form-label text-muted-oh">Role</label>
                    <select id="jwRole" class="form-select oh-input">
                      ${["Role","Account Executive","Sales Development Rep","Customer Success","HR Generalist","Engineer","Store Manager"].map(x=>`<option>${x}</option>`).join("")}
                    </select>
                  </div>
                  <div class="mt-3">
                    <label class="form-label text-muted-oh">Industry</label>
                    <select id="jwIndustry" class="form-select oh-input">
                      ${["SaaS B2B","Retail","Healthcare","Manufacturing","Hospitality","Finance"].map(x=>`<option>${x}</option>`).join("")}
                    </select>
                  </div>
                </div>
              </div>

              <div class="col-12 col-lg-6">
                <div class="oh-card-soft p-3 h-100">
                  <div class="fw-semibold">Outcome design</div>
                  <div class="text-muted-oh small">Define what “good” looks like by day 30/60/90.</div>

                  <div class="row g-2 mt-2">
                    ${[
                      ["Day 30", "Foundations + access, first wins"],
                      ["Day 60", "Consistency + autonomy building"],
                      ["Day 90", "Ownership + measurable impact"]
                    ].map(([t, d])=>`
                      <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center oh-pill">
                          <div class="fw-semibold">${t}</div>
                          <div class="text-muted-oh small">${d}</div>
                        </div>
                      </div>
                    `).join("")}
                  </div>

                  <div class="oh-card-soft p-3 mt-3">
                    <div class="text-muted-oh small">Product principle</div>
                    <div class="fw-semibold">Reduce ambiguity → increase adoption.</div>
                    <div class="text-muted-oh small">OnboardHero estandariza experiencia y permite medir progreso con señales reales.</div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div id="jwStep2" class="d-none">
            <div class="row g-3">
              <div class="col-12 col-lg-4">
                <div class="oh-card-soft p-3">
                  <div class="fw-semibold">30 days tasks</div>
                  <div class="text-muted-oh small">One per line</div>
                  <textarea id="jw30" class="form-control oh-input mt-2" rows="10"></textarea>
                </div>
              </div>
              <div class="col-12 col-lg-4">
                <div class="oh-card-soft p-3">
                  <div class="fw-semibold">60 days tasks</div>
                  <div class="text-muted-oh small">One per line</div>
                  <textarea id="jw60" class="form-control oh-input mt-2" rows="10"></textarea>
                </div>
              </div>
              <div class="col-12 col-lg-4">
                <div class="oh-card-soft p-3">
                  <div class="fw-semibold">90 days tasks</div>
                  <div class="text-muted-oh small">One per line</div>
                  <textarea id="jw90" class="form-control oh-input mt-2" rows="10"></textarea>
                </div>
              </div>
            </div>

            <div class="oh-card-soft p-3 mt-3">
              <div class="fw-semibold">UX note</div>
              <div class="text-muted-oh small">
                Un buen journey mezcla tareas “access”, “skills”, “culture” y “manager touches”.
                Evita listas eternas: mejor 8–12 ítems por fase + señales de calidad.
              </div>
            </div>
          </div>

          <div id="jwStep3" class="d-none">
            <div class="row g-3">
              <div class="col-12 col-lg-6">
                <div class="oh-card-soft p-3">
                  <div class="fw-semibold">Review</div>
                  <div class="text-muted-oh small">Verifica consistencia y foco.</div>

                  <div class="mt-3">
                    <div class="text-muted-oh small">Journey</div>
                    <div class="fw-semibold" id="jwReviewName">—</div>
                  </div>
                  <div class="mt-2 d-flex gap-2">
                    <span class="badge oh-badge" id="jwReviewRole">—</span>
                    <span class="badge oh-badge" id="jwReviewIndustry">—</span>
                    <span class="badge oh-badge badge-success2">30/60/90</span>
                  </div>

                  <div class="oh-card-soft p-3 mt-3">
                    <div class="text-muted-oh small">Expected impact</div>
                    <div class="fw-semibold">Less manual work. More consistency. Real metrics.</div>
                    <div class="text-muted-oh small">Pitch line para TFM: “Convertimos onboarding en un sistema medible, no un PDF.”</div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-lg-6">
                <div class="oh-card-soft p-3">
                  <div class="fw-semibold">Summary</div>
                  <div class="text-muted-oh small">Counts (demo)</div>

                  <div class="row g-2 mt-2">
                    <div class="col-4">
                      <div class="oh-card-soft p-3">
                        <div class="text-muted-oh small">Day 30</div>
                        <div class="kpi" id="jwC30">—</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="oh-card-soft p-3">
                        <div class="text-muted-oh small">Day 60</div>
                        <div class="kpi" id="jwC60">—</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="oh-card-soft p-3">
                        <div class="text-muted-oh small">Day 90</div>
                        <div class="kpi" id="jwC90">—</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 text-muted-oh small">
                    Recommendation: si una fase tiene +15 tareas, dividir en “Required” y “Recommended”.
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer border-0 d-flex justify-content-between">
          <button class="btn btn-outline-light" id="btnJwBack"><i class="bi bi-arrow-left me-1"></i>Back</button>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-light" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-outline-light" id="btnJwNext"><i class="bi bi-arrow-right me-1"></i>Next</button>
            <button class="btn btn-accent d-none" id="btnJwSave"><i class="bi bi-check2-circle me-1"></i>Save journey</button>
          </div>
        </div>

      </div>
    </div>
  </div>
  `;
}

function wizardStep(){
  const s1 = !$("#jwStep1").classList.contains("d-none");
  const s2 = !$("#jwStep2").classList.contains("d-none");
  const s3 = !$("#jwStep3").classList.contains("d-none");
  return s1 ? 1 : s2 ? 2 : 3;
}

function setWizardStep(step){
  $("#jwStep1").classList.toggle("d-none", step !== 1);
  $("#jwStep2").classList.toggle("d-none", step !== 2);
  $("#jwStep3").classList.toggle("d-none", step !== 3);

  $("#stepPill1").classList.toggle("badge-accent", step === 1);
  $("#stepPill2").classList.toggle("badge-accent", step === 2);
  $("#stepPill3").classList.toggle("badge-accent", step === 3);

  $("#btnJwBack").disabled = step === 1;
  $("#btnJwNext").classList.toggle("d-none", step === 3);
  $("#btnJwSave").classList.toggle("d-none", step !== 3);

  if(step === 3){
    const name = $("#jwName").value.trim();
    const role = $("#jwRole").value;
    const ind = $("#jwIndustry").value;

    const c30 = lines($("#jw30").value).length;
    const c60 = lines($("#jw60").value).length;
    const c90 = lines($("#jw90").value).length;

    $("#jwReviewName").textContent = name || "—";
    $("#jwReviewRole").textContent = role;
    $("#jwReviewIndustry").textContent = ind;

    $("#jwC30").textContent = c30;
    $("#jwC60").textContent = c60;
    $("#jwC90").textContent = c90;
  }
}

function lines(txt){
  return (txt||"").split("\n").map(s=>s.trim()).filter(Boolean);
}

function saveWizardJourney(){
  const name = $("#jwName").value.trim();
  const role = $("#jwRole").value;
  const industry = $("#jwIndustry").value;

  if(!name || role === "Role"){
    toast("Please set a journey name and role.", "danger");
    return;
  }

  const journeys = getJourneys();
  const id = "J-" + Math.floor(1000 + Math.random()*9000);

  const j = {
    id,
    name,
    role,
    industry,
    status: "Active",
    updatedAt: nowIso(),
    steps: {
      d30: lines($("#jw30").value),
      d60: lines($("#jw60").value),
      d90: lines($("#jw90").value)
    }
  };

  journeys.unshift(j);
  setJourneys(journeys);

  toast("Journey created.", "success");
  bootstrap.Modal.getInstance($("#modalJourneyWizard")).hide();

  // navigate to journeys to reinforce flow
  navigate("#/journeys");
}
