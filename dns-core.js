import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  collection,
  getDocs,
  getFirestore,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgxv6Z45-AfrusbFnCSyvYChRUBu6-vXc",
  authDomain: "dns-core.firebaseapp.com",
  projectId: "dns-core",
  storageBucket: "dns-core.firebasestorage.app",
  messagingSenderId: "387653285986",
  appId: "1:387653285986:web:27ad6f2e9a41ea1aebb93b",
  measurementId: "G-2G56PRYNME",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MASTER_COLLECTIONS = [
  "reportingAreas",
  "destinations",
  "organizations",
  "organizationRelationships",
  "seasons",
];

function byId(docs) {
  return Object.freeze(
    Object.fromEntries(docs.map((doc) => [doc.id, Object.freeze(doc)])),
  );
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ");
}

function buildReportingAreaAliasMap(reportingAreas) {
  const map = {};
  for (const area of reportingAreas) {
    const refs = area.legacyRefs ?? {};
    const values = [
      area.id,
      area.canonicalName,
      area.localizedName?.de,
      area.localizedName?.it,
      area.localizedName?.en,
      ...(area.aliases ?? []),
      ...(refs.fair ?? []),
      ...(refs.analytics ?? []),
      ...(refs.partnerPortal ?? []),
    ].filter(Boolean);
    for (const value of values) map[normalize(value)] = area.id;
  }
  return Object.freeze(map);
}

function buildOrganizationAliasMap(organizations) {
  const map = {};
  for (const organization of organizations) {
    const values = [
      organization.id,
      organization.canonicalName,
      organization.localizedName?.de,
      organization.localizedName?.it,
      organization.localizedName?.en,
      ...(organization.aliases ?? []),
    ].filter(Boolean);
    for (const value of values) map[normalize(value)] = organization.id;
  }
  return Object.freeze(map);
}

function setStatus(state, text) {
  const el = document.getElementById("dnsCoreStatus");
  if (!el) return;
  el.dataset.state = state;
  el.textContent = text;
  el.title =
    state === "ready"
      ? "Canonical master data loaded from DNS_Core"
      : "Analytics continues with its existing local datasets";
}

async function loadCollection(name) {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function loadDNSCore() {
  setStatus("loading", "DNS_Core · connecting…");

  try {
    const [
      reportingAreas,
      destinations,
      organizations,
      organizationRelationships,
      seasons,
    ] = await Promise.all(MASTER_COLLECTIONS.map(loadCollection));

    const reportingAreaAliases = buildReportingAreaAliasMap(reportingAreas);
    const organizationAliases = buildOrganizationAliasMap(organizations);

    const master = Object.freeze({
      projectId: firebaseConfig.projectId,
      loadedAt: new Date().toISOString(),
      reportingAreas: Object.freeze(reportingAreas),
      destinations: Object.freeze(destinations),
      organizations: Object.freeze(organizations),
      organizationRelationships: Object.freeze(organizationRelationships),
      seasons: Object.freeze(seasons),
      reportingAreaById: byId(reportingAreas),
      destinationById: byId(destinations),
      organizationById: byId(organizations),
      seasonById: byId(seasons),
      resolveReportingAreaId(value) {
        return reportingAreaAliases[normalize(value)];
      },
      resolveOrganizationId(value) {
        return organizationAliases[normalize(value)];
      },
    });

    window.DNSCore = master;
    window.dispatchEvent(new CustomEvent("dns-core-ready", { detail: master }));
    setStatus(
      "ready",
      `DNS_Core · connected · ${reportingAreas.length}/${organizations.length}`,
    );
  } catch (error) {
    console.error("DNS_Core master-data connection failed:", error);
    window.DNSCore = null;
    window.dispatchEvent(
      new CustomEvent("dns-core-error", { detail: { error } }),
    );
    setStatus("error", "DNS_Core · offline · local data");
  }
}

loadDNSCore();
