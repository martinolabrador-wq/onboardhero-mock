// Minimal fake data + storage keys
const OH_KEYS = {
  session: "oh_session",
  journeys: "oh_journeys",
  people: "oh_people",
  settings: "oh_settings"
};

const OH_DEFAULTS = {
  user: { name: "Guillermo Martino", role: "Founder / PM", company: "OnboardHero" },
  settings: {
    brandName: "OnboardHero",
    accent: "#7c5cff",
    notificationsEmail: true,
    notificationsSlack: false,
    permissionMode: "Role-based"
  },
  journeys: [
    {
      id: "J-1001",
      name: "Sales Onboarding — 30/60/90",
      role: "Account Executive",
      industry: "SaaS B2B",
      status: "Active",
      updatedAt: "2026-01-18",
      steps: {
        d30: ["Access & tools", "Product basics", "ICP + messaging", "Shadow 3 demos"],
        d60: ["Own pipeline", "Run 5 demos", "Objection handling", "CRM hygiene"],
        d90: ["Close first deals", "Forecast cadence", "Advanced playbooks", "Quarter plan"]
      }
    },
    {
      id: "J-1002",
      name: "People Ops — Foundations",
      role: "HR Generalist",
      industry: "SMB",
      status: "Draft",
      updatedAt: "2026-01-10",
      steps: {
        d30: ["Policies & compliance", "Hiring workflow", "Tools setup", "First-week experience"],
        d60: ["Performance cycle", "Manager enablement", "Pulse surveys", "Docs library"],
        d90: ["Automation roadmap", "KPIs baseline", "Vendor review", "Quarter OKRs"]
      }
    }
  ],
  people: [
    { id: "P-2001", name: "Ana Pérez", role: "Account Executive", startDate: "2026-01-22", manager: "Sales Lead", status: "Onboarding", journeyId: "J-1001", progress: 34 },
    { id: "P-2002", name: "Diego Romero", role: "Customer Success", startDate: "2026-01-15", manager: "Head of CS", status: "Onboarding", journeyId: "J-1001", progress: 58 },
    { id: "P-2003", name: "Marta López", role: "HR Generalist", startDate: "2026-02-03", manager: "People Lead", status: "Invited", journeyId: "J-1002", progress: 0 }
  ],
  templates: [
    { id: "T-3001", title: "Retail: Store Manager", industry: "Retail", level: "Starter", tags: ["30/60/90", "Ops", "Training"] },
    { id: "T-3002", title: "SaaS: SDR → AE ramp", industry: "SaaS", level: "Pro", tags: ["Quota ramp", "Playbooks", "Coaching"] },
    { id: "T-3003", title: "Healthcare: Nurse onboarding", industry: "Healthcare", level: "Pro", tags: ["Compliance", "Shift", "Culture"] },
    { id: "T-3004", title: "Manufacturing: Plant operator", industry: "Manufacturing", level: "Starter", tags: ["Safety", "SOPs", "Mentor"] }
  ]
};

function ohLoad(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){
    return fallback;
  }
}

function ohSave(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function ohEnsureDefaults(){
  const journeys = ohLoad(OH_KEYS.journeys, null);
  const people = ohLoad(OH_KEYS.people, null);
  const settings = ohLoad(OH_KEYS.settings, null);

  if(!journeys) ohSave(OH_KEYS.journeys, OH_DEFAULTS.journeys);
  if(!people) ohSave(OH_KEYS.people, OH_DEFAULTS.people);
  if(!settings) ohSave(OH_KEYS.settings, OH_DEFAULTS.settings);
}

ohEnsureDefaults();
