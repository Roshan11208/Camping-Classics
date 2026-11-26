function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

const tripForm = document.getElementById("tripForm");
const plannerList = document.getElementById("plannerList");
const plannerSummary = document.getElementById("plannerSummary");
const checklistGrid = document.getElementById("checklistGrid");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const packingProgressBar = document.getElementById("packingProgressBar");
const packingProgressFill = document.getElementById("packingProgressFill");
const resetChecklist = document.getElementById("resetChecklist");
const customItemForm = document.getElementById("customItemForm");
const customItemName = document.getElementById("customItemName");
const customItemCategory = document.getElementById("customItemCategory");
const saveTripBtn = document.getElementById("saveTripBtn");
const saveTripStatus = document.getElementById("saveTripStatus");
const savedTripsList = document.getElementById("savedTripsList");
const feedbackButton = document.getElementById("feedbackButton");
const feedbackModal = document.getElementById("feedbackModal");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackArea = document.getElementById("feedbackArea");
const feedbackStatus = document.getElementById("feedbackStatus");
const feedbackComment = document.getElementById("feedbackComment");
const feedbackCharCount = document.getElementById("feedbackCharCount");
const closeFeedbackModal = document.getElementById("closeFeedbackModal");

const sharedTripModal = document.getElementById("sharedTripModal");
const sharedTripTitle = document.getElementById("sharedTripTitle");
const sharedTripDescription = document.getElementById("sharedTripDescription");
const sharedTripPreview = document.getElementById("sharedTripPreview");
const importSharedTrip = document.getElementById("importSharedTrip");
const dismissSharedTrip = document.getElementById("dismissSharedTrip");
const closeSharedTripModal = document.getElementById("closeSharedTripModal");
const shareTripModal = document.getElementById("shareTripModal");
const closeShareTripModal = document.getElementById("closeShareTripModal");
const shareTripLink = document.getElementById("shareTripLink");
const copyShareTripLink = document.getElementById("copyShareTripLink");
const nativeShareTrip = document.getElementById("nativeShareTrip");
const shareTripStatus = document.getElementById("shareTripStatus");
const offlineStatus = document.getElementById("offlineStatus");


const expandAllSections = document.getElementById("expandAllSections");
const collapseAllSections = document.getElementById("collapseAllSections");

const printChecklist = document.getElementById("printChecklist");
const dayPlannerGrid = document.getElementById("dayPlannerGrid");
const dayPlannerTripLabel = document.getElementById("dayPlannerTripLabel");
const dayPlannerCaption = document.getElementById("dayPlannerCaption");
const dayPlannerStatus = document.getElementById("dayPlannerStatus");
const tripSummaryCard = document.getElementById("tripSummaryCard");
const tripSummaryName = document.getElementById("tripSummaryName");
const tripSummaryDetails = document.getElementById("tripSummaryDetails");
const customItemStatus = document.getElementById("customItemStatus");

const CURRENT_CHECKLIST_KEY = "camping-classics-current-checklist-v20";
const CURRENT_PLANNER_KEY = "camping-classics-current-planner-v20";
const CURRENT_DAY_PLANS_KEY = "camping-classics-current-day-plans-v35";
const SAVED_TRIPS_KEY = "camping-classics-saved-trips-v15";
const ACTIVE_TRIP_KEY = "camping-classics-active-trip-v21";

function escapeChecklistText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clampQuantity(value) {
  if (typeof value !== "number" && typeof value !== "string") return 0;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(99, Math.max(0, parsed));
}

function createChecklistItem(label, quantity = 0, checked = false, custom = false) {
  return {
    label: String(label),
    quantity: clampQuantity(quantity),
    checked: Boolean(checked),
    custom: Boolean(custom)
  };
}

const defaultChecklist = {
  "Shelter & Sleep": [
    createChecklistItem("Tent or shelter", 0),
    createChecklistItem("Sleeping bag", 0),
    createChecklistItem("Sleeping pad", 0),
    createChecklistItem("Pillow", 0)
  ],
  "Food & Water": [
    createChecklistItem("Drinking water", 0),
    createChecklistItem("Meals and snacks", 0),
    createChecklistItem("Cooler", 0),
    createChecklistItem("Plates and utensils", 0)
  ],
  "Clothing": [
    createChecklistItem("Extra layers", 0),
    createChecklistItem("Rain jacket", 0),
    createChecklistItem("Comfortable shoes", 0),
    createChecklistItem("Extra socks", 0)
  ],
  "Safety & Essentials": [
    createChecklistItem("Flashlight or headlamp", 0),
    createChecklistItem("Extra batteries", 0),
    createChecklistItem("First-aid kit", 0),
    createChecklistItem("Trash bags", 0)
  ]
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeChecklist(checklist) {
  const normalized = Object.create(null);

  if (!checklist || typeof checklist !== "object" || Array.isArray(checklist)) {
    return cloneData(defaultChecklist);
  }

  let remaining = 1000;
  Object.entries(checklist).slice(0, 24).forEach(([category, items]) => {
    if (!Array.isArray(items) || ["__proto__", "constructor", "prototype"].includes(category)) return;

    const validItems = items.filter(item => typeof item === "string" || (item && typeof item === "object" && !Array.isArray(item))).slice(0, remaining);
    remaining -= validItems.length;
    normalized[category.slice(0, 80)] = validItems.map((item) => {
      if (typeof item === "string") {
        return createChecklistItem(item.slice(0, 160));
      }

      return createChecklistItem(
        typeof item.label === "string" ? item.label.slice(0, 160) : typeof item.name === "string" ? item.name.slice(0, 160) : "Checklist item",
        item.quantity ?? 0,
        item.checked ?? false,
        item.custom ?? false
      );
    });
  });

  return Object.keys(normalized).length > 0
    ? normalized
    : cloneData(defaultChecklist);
}

function loadCurrentChecklist() {
  try {
    const current = localStorage.getItem(CURRENT_CHECKLIST_KEY);
    if (current) return normalizeChecklist(JSON.parse(current));

  } catch {
    // Fall back to the default checklist.
  }

  return cloneData(defaultChecklist);
}

function loadCurrentPlanner() {
  try {
    const saved = localStorage.getItem(CURRENT_PLANNER_KEY);
    return saved ? normalizePlannerSettings(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

function saveCurrentState() {
  localStorage.setItem(CURRENT_CHECKLIST_KEY, JSON.stringify(currentChecklist));

  
localStorage.setItem(CURRENT_DAY_PLANS_KEY, JSON.stringify(currentDayPlans));
  if (currentPlannerSettings) {
    localStorage.setItem(CURRENT_PLANNER_KEY, JSON.stringify(currentPlannerSettings));
  }

  if (currentTripId) {
    localStorage.setItem(ACTIVE_TRIP_KEY, currentTripId);
    persistActiveTrip();
  } else {
    localStorage.removeItem(ACTIVE_TRIP_KEY);
  }
  updateTripStorageStatus();
}

let currentChecklist = loadCurrentChecklist();
let currentPlannerSettings = loadCurrentPlanner();
let currentTripId = localStorage.getItem(ACTIVE_TRIP_KEY) || null;
let currentDayPlans = loadCurrentDayPlans();
let removalHistory = [];
const itemColumns = new WeakMap();

function getAllChecklistItems() {
  return Object.values(currentChecklist).flat();
}

function updatePlannerPreview() {
  const settings = collectPlannerSettings();
  const items = Object.values(buildPackingSuggestions(settings)).flat();
  plannerList.innerHTML = items
    .map(item => `<li>${escapeChecklistText(item.label)} <strong>×${item.quantity}</strong></li>`)
    .join("");
  plannerSummary.textContent = `Suggestions for ${settings.campers} camper${settings.campers === 1 ? "" : "s"} over ${settings.days} day${settings.days === 1 ? "" : "s"}. Generate your list when ready.`;
}

function checklistProgressStats(checklist = currentChecklist) {
  const items = Object.values(normalizeChecklist(checklist)).flat();

  const total = items.length;
  const checked = items.filter((item) => item.checked && clampQuantity(item.quantity) > 0).length;
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);

  return { total, checked, percent };
}

function updateProgress() {
  const { total, checked, percent } = checklistProgressStats();

  progressText.textContent = `${checked} of ${total} packed`;
  progressPercent.textContent = `${percent}%`;
  packingProgressFill.style.width = `${percent}%`;
  packingProgressBar.setAttribute("aria-valuenow", String(percent));
}

function checklistSectionKey(category) {
  return `checklist-${String(category)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function renderChecklist() {
  saveCurrentState();

  const categories = Object.keys(currentChecklist);

  checklistGrid.innerHTML = categories
    .map((category, categoryIndex) => {
      const items = currentChecklist[category];
      const sectionKey = checklistSectionKey(category);

      return `
        <div class="check-card collapsible-card" data-collapsible="${sectionKey}">
          <button
            class="collapsible-toggle check-section-toggle"
            type="button"
            data-target="${sectionKey}"
            aria-expanded="true"
          >
            <span class="collapsible-title-wrap">
              <h3>${escapeChecklistText(category)}</h3>
            </span>
            <span class="collapsible-right">
              <span class="section-count">${items.length} item${items.length === 1 ? "" : "s"}</span>
              <span class="collapsible-arrow" aria-hidden="true">
                <svg class="chevron-icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </span>
            </span>
          </button>

          <div class="check-items collapsible-content" data-content="${sectionKey}">
            ${items.map((item, itemIndex) => `
              <div class="check-item">
                <label class="check-main ${item.quantity === 0 ? "quantity-zero" : ""}">
                  <input
                    type="checkbox"
                    class="check-item-box"
                    data-category-index="${categoryIndex}"
                    data-item-index="${itemIndex}"
                    ${item.checked ? "checked" : ""}
                  >
                  <span>${escapeChecklistText(item.label)}</span>
                </label>

                <div class="quantity-control" aria-label="Quantity controls">
                  <button
                    type="button"
                    class="quantity-btn quantity-minus"
                    data-category-index="${categoryIndex}"
                    data-item-index="${itemIndex}"
                    aria-label="Decrease ${escapeChecklistText(item.label)} quantity"
                  >−</button>

                  <button
                    type="button"
                    class="quantity-value quantity-value-button"
                    data-category-index="${categoryIndex}"
                    data-item-index="${itemIndex}"
                    aria-label="Use ${escapeChecklistText(item.label)} quantity to update selection"
                  >${item.quantity}</button>

                  <button
                    type="button"
                    class="quantity-btn quantity-plus"
                    data-category-index="${categoryIndex}"
                    data-item-index="${itemIndex}"
                    aria-label="Increase ${escapeChecklistText(item.label)} quantity"
                  >+</button>
                </div>

                <button
                  type="button"
                  class="remove-checklist-item"
                  data-category-index="${categoryIndex}"
                  data-item-index="${itemIndex}"
                  aria-label="Remove ${escapeChecklistText(item.label)} from checklist"
                >
                  Remove
                </button>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    })
    .join("");

  checklistGrid.querySelectorAll(".check-items").forEach(group => {
    const columns = [document.createElement("div"),document.createElement("div")];
    columns.forEach(col => col.className = "packing-column");
    for (const row of [...group.children]) {
      const box = row.querySelector("input");
      const {item} = getChecklistItemByIndexes(+box.dataset.categoryIndex,+box.dataset.itemIndex);
      const col = itemColumns.get(item) ?? (columns[0].children.length <= columns[1].children.length ? 0 : 1);
      itemColumns.set(item,col); columns[col].append(row);
    }
    group.append(...columns);
  });
  if (removalHistory.some(entry => entry.checklist !== currentChecklist)) {
    removalHistory = [];
    document.getElementById("itemUndoToast").hidden = true;
  }
  attachChecklistControls();
  attachCollapsibleControls();
  updateProgress();

  updateTripSummary();
}


const COLLAPSED_SECTIONS_KEY = "camping-classics-collapsed-sections-v21";

function loadCollapsedSections() {
  try {
    const saved = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

let collapsedSections = loadCollapsedSections();

function saveCollapsedSections() {
  localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(collapsedSections));
}

function setSectionExpanded(targetKey, expanded, remember = true) {
  const toggle = document.querySelector(`.collapsible-toggle[data-target="${targetKey}"]`);
  const content = document.querySelector(`.collapsible-content[data-content="${targetKey}"]`);
  const card = document.querySelector(`.collapsible-card[data-collapsible="${targetKey}"]`);

  if (!toggle || !content) return;

  toggle.setAttribute("aria-expanded", String(expanded));
  content.hidden = !expanded;

  if (card) {
    card.classList.toggle("collapsed", !expanded);
  }

  if (remember) {
    collapsedSections[targetKey] = !expanded;
    saveCollapsedSections();
  }
}

function applyCollapsedState(root = document) {
  root.querySelectorAll(".collapsible-toggle").forEach((toggle) => {
    const key = toggle.dataset.target;
    const isCollapsed = collapsedSections[key] === true;
    setSectionExpanded(key, !isCollapsed, false);
  });
}

function bindCollapsibleToggle(toggle) {
  if (toggle.dataset.collapseBound === "true") return;

  toggle.dataset.collapseBound = "true";

  toggle.addEventListener("click", () => {
    const targetKey = toggle.dataset.target;
    const currentlyExpanded = toggle.getAttribute("aria-expanded") === "true";
    setSectionExpanded(targetKey, !currentlyExpanded, true);
  });
}

function attachCollapsibleControls() {
  checklistGrid
    .querySelectorAll(".collapsible-toggle")
    .forEach(bindCollapsibleToggle);

  applyCollapsedState(checklistGrid);
}

function attachStaticCollapsibleControls() {
  document
    .querySelectorAll(".collapsible-toggle")
    .forEach((toggle) => {
      if (!checklistGrid.contains(toggle)) {
        bindCollapsibleToggle(toggle);
      }
    });

  applyCollapsedState(document);
}

function setAllChecklistSections(expanded) {
  document
    .querySelectorAll("#checklist .collapsible-toggle")
    .forEach((toggle) => {
      setSectionExpanded(toggle.dataset.target, expanded, true);
    });
}

function getChecklistItemByIndexes(categoryIndex, itemIndex) {
  const categories = Object.keys(currentChecklist);
  const category = categories[categoryIndex];

  if (!category || !currentChecklist[category]?.[itemIndex]) {
    return null;
  }

  return {
    category,
    itemIndex,
    item: currentChecklist[category][itemIndex]
  };
}

function attachChecklistControls() {
  checklistGrid.querySelectorAll(".quantity-plus").forEach((button) => {
    button.addEventListener("click", () => {
      const target = getChecklistItemByIndexes(
        Number(button.dataset.categoryIndex),
        Number(button.dataset.itemIndex)
      );

      if (!target) return;

      target.item.quantity = Math.min(99, clampQuantity(target.item.quantity) + 1);
      target.item.checked = target.item.quantity > 0;

      renderChecklist();
      updatePlannerPreview();
      renderSavedTrips();
    });
  });

  checklistGrid.querySelectorAll(".quantity-minus").forEach((button) => {
    button.addEventListener("click", () => {
      const target = getChecklistItemByIndexes(
        Number(button.dataset.categoryIndex),
        Number(button.dataset.itemIndex)
      );

      if (!target) return;

      target.item.quantity = Math.max(0, clampQuantity(target.item.quantity) - 1);

      if (target.item.quantity === 0) {
        target.item.checked = false;
      }

      renderChecklist();
      updatePlannerPreview();
      renderSavedTrips();
    });
  });

  checklistGrid.querySelectorAll(".quantity-value-button").forEach((button) => {
    button.addEventListener("click", () => {
      const target = getChecklistItemByIndexes(
        Number(button.dataset.categoryIndex),
        Number(button.dataset.itemIndex)
      );

      if (!target) return;

      target.item.checked = clampQuantity(target.item.quantity) > 0;

      renderChecklist();
      updatePlannerPreview();
      renderSavedTrips();
    });
  });

  checklistGrid.querySelectorAll(".check-item-box").forEach((box) => {
    box.addEventListener("change", () => {
      const target = getChecklistItemByIndexes(
        Number(box.dataset.categoryIndex),
        Number(box.dataset.itemIndex)
      );

      if (!target) return;

      target.item.checked = box.checked;

      if (box.checked && clampQuantity(target.item.quantity) === 0) {
        target.item.quantity = 1;
      }

      renderChecklist();
      updatePlannerPreview();
      renderSavedTrips();
    });
  });

  checklistGrid.querySelectorAll(".remove-checklist-item").forEach((button) => {
    button.addEventListener("click", () => {
      const target = getChecklistItemByIndexes(
        Number(button.dataset.categoryIndex),
        Number(button.dataset.itemIndex)
      );

      if (!target) return;

      removalHistory.push({checklist:currentChecklist, category:target.category, index:target.itemIndex, item:target.item});
      currentChecklist[target.category].splice(target.itemIndex, 1);

      if (currentChecklist[target.category].length === 0) {
        delete currentChecklist[target.category];
      }

      renderChecklist();
      updatePlannerPreview();
      renderSavedTrips();
      showRemovalUndo();
    });
  });
}

function showRemovalUndo() {
  const entry = removalHistory.at(-1);
  const toast = document.getElementById("itemUndoToast");
  toast.hidden = !entry;
  if (entry) document.getElementById("itemUndoMessage").textContent = `${entry.item.label} removed.`;
}
document.getElementById("undoRemoveItem").addEventListener("click", () => {
  const entry = removalHistory.pop();
  if (!entry || entry.checklist !== currentChecklist) { removalHistory = []; showRemovalUndo(); return; }
  if (!currentChecklist[entry.category]) currentChecklist[entry.category] = [];
  currentChecklist[entry.category].splice(Math.min(entry.index,currentChecklist[entry.category].length),0,entry.item);
  renderChecklist();
  updatePlannerPreview();
  renderSavedTrips();
  showRemovalUndo();
  if (document.getElementById("itemUndoToast").hidden) {
    const categoryIndex = Object.keys(currentChecklist).indexOf(entry.category);
    const itemIndex = currentChecklist[entry.category].indexOf(entry.item);
    const restoredControl = checklistGrid.querySelector(`.remove-checklist-item[data-category-index="${categoryIndex}"][data-item-index="${itemIndex}"]`);
    restoredControl?.focus({preventScroll:true});
  }
});
document.getElementById("dismissItemUndo").addEventListener("click", () => {
  removalHistory = [];
  showRemovalUndo();
  document.getElementById("masterChecklistToggle").focus({preventScroll:true});
});

function addSuggestedItem(checklist, category, label, quantity) {
  if (!checklist[category]) checklist[category] = [];
  const amount = Math.max(0, Math.trunc(Number(quantity) || 0));
  const existing = checklist[category].find(item => item.label === label);
  if (existing) existing.quantity = Math.max(existing.quantity, amount);
  else checklist[category].push({label, quantity:amount});
}

function buildPackingSuggestions(settings) {
  const {campers, days, campType, weather, activities, withKids, withPet, cookAtCamp, noWater} = settings;
  const generated = {
    "Shelter & Sleep": [],
    "Food & Water": [],
    "Clothing": [],
    "Safety & Essentials": []
  };

  if (campType === "tent") {
    addSuggestedItem(generated, "Shelter & Sleep", "Tent with stakes", Math.max(1, Math.ceil(campers / 4)));
    addSuggestedItem(generated, "Shelter & Sleep", "Sleeping bag", campers);
    addSuggestedItem(generated, "Shelter & Sleep", "Sleeping pad", campers);
    addSuggestedItem(generated, "Shelter & Sleep", "Pillow", campers);
  } else if (campType === "cabin") {
    addSuggestedItem(generated, "Shelter & Sleep", "Bedding or sleeping bag", campers);
    addSuggestedItem(generated, "Shelter & Sleep", "Pillow", campers);
    addSuggestedItem(generated, "Shelter & Sleep", "Indoor shoes or slippers", campers);
  } else {
    addSuggestedItem(generated, "Shelter & Sleep", "RV hookup supplies", 1);
    addSuggestedItem(generated, "Shelter & Sleep", "Bedding", campers);
    addSuggestedItem(generated, "Shelter & Sleep", "Pillow", campers);
  }

  addSuggestedItem(generated, "Food & Water", "Meals", campers * days * 3);
  addSuggestedItem(generated, "Food & Water", "Snack servings", campers * days * 2);
  addSuggestedItem(generated, "Food & Water", "Drinking water servings", campers * days * 2);
  addSuggestedItem(generated, "Food & Water", "Cooler", Math.max(1, Math.ceil(campers / 4)));
  addSuggestedItem(generated, "Food & Water", "Plates and utensil sets", campers);

  addSuggestedItem(generated, "Clothing", "Comfortable shoe pairs", campers);
  addSuggestedItem(generated, "Clothing", "Extra sock pairs", campers * Math.max(1, days));

  addSuggestedItem(generated, "Safety & Essentials", "Flashlight or headlamp", campers);
  addSuggestedItem(generated, "Safety & Essentials", "First-aid kit", 1);
  addSuggestedItem(generated, "Safety & Essentials", "Trash bags", Math.max(2, days));
  addSuggestedItem(generated, "Safety & Essentials", "Phone charger or power bank", Math.max(1, Math.ceil(campers / 2)));

  if (weather === "rain") {
    addSuggestedItem(generated, "Clothing", "Rain jacket", campers);
    addSuggestedItem(generated, "Clothing", "Extra sock pairs", campers * Math.max(2, days));
    addSuggestedItem(generated, "Safety & Essentials", "Waterproof bag for clothes", Math.max(1, campers));
    addSuggestedItem(generated, "Shelter & Sleep", "Extra tarp", 1);
  } else if (weather === "cold") {
    addSuggestedItem(generated, "Clothing", "Warm layers", campers);
    addSuggestedItem(generated, "Clothing", "Hat and glove sets", campers);
    addSuggestedItem(generated, "Shelter & Sleep", "Extra blanket", campers);
  } else if (weather === "hot") {
    addSuggestedItem(generated, "Clothing", "Lightweight clothing sets", campers);
    addSuggestedItem(generated, "Clothing", "Sun hat", campers);
    addSuggestedItem(generated, "Food & Water", "Extra drinking water servings", campers * days);
  } else {
    addSuggestedItem(generated, "Clothing", "Light jacket", campers);
  }

  if (activities.includes("hiking")) {
    addSuggestedItem(generated, "Activities", "Daypack", campers);
    addSuggestedItem(generated, "Activities", "Trail map or offline map", 1);
    addSuggestedItem(generated, "Activities", "Hiking water bottle", campers);
  }

  if (activities.includes("fishing")) {
    addSuggestedItem(generated, "Activities", "Fishing gear set", 1);
    addSuggestedItem(generated, "Activities", "Tackle box", 1);
  }

  if (activities.includes("swimming")) {
    addSuggestedItem(generated, "Activities", "Swimsuit", campers);
    addSuggestedItem(generated, "Activities", "Towel", campers);
    addSuggestedItem(generated, "Activities", "Water shoes", campers);
  }

  if (withKids) {
    addSuggestedItem(generated, "Extras", "Kid activities or games", 1);
    addSuggestedItem(generated, "Extras", "Extra kid clothing sets", 2);
  }

  if (withPet) {
    addSuggestedItem(generated, "Food & Water", "Pet food servings", days * 2);
    addSuggestedItem(generated, "Food & Water", "Pet water servings", days * 2);
    addSuggestedItem(generated, "Extras", "Pet leash", 1);
    addSuggestedItem(generated, "Extras", "Pet waste bags", Math.max(2, days * 2));
  }

  if (cookAtCamp) {
    addSuggestedItem(generated, "Food & Water", "Camp stove or approved cooking setup", 1);
    addSuggestedItem(generated, "Food & Water", "Cooking utensil set", 1);
    addSuggestedItem(generated, "Food & Water", "Food storage containers", Math.max(1, days));
  }

  if (noWater) {
    addSuggestedItem(generated, "Food & Water", "Extra water supply servings", campers * days * 2);
  }

  return generated;
}

function buildStartingChecklist(settings) {
  return Object.fromEntries(Object.entries(buildPackingSuggestions(settings)).map(([category, items]) =>
    [category, items.map(item => createChecklistItem(item.label, 0, false, false))]));
}

// Shared links, backups and browser storage are untrusted input. Keep only
// known fields and bounded values before they reach any renderer or form.
function normalizePlannerSettings(raw) {
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const integer = (input, maximum, fallback) => {
    if (!["number", "string"].includes(typeof input) || String(input).trim() === "") return fallback;
    const number = Number(input);
    return Number.isFinite(number) ? Math.min(maximum, Math.max(1, Math.trunc(number))) : fallback;
  };
  const date = input => {
    if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return "";
    const parsed = new Date(input + "T00:00:00Z");
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === input ? input : "";
  };
  const startDate = date(value.startDate);
  let endDate = date(value.endDate);
  let days = integer(value.days, 30, 2);
  if (startDate && endDate && endDate >= startDate) {
    days = Math.min(30, Math.floor((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1);
    endDate = new Date(Date.parse(startDate) + (days - 1) * 86400000).toISOString().slice(0, 10);
  } else if (endDate) {
    endDate = "";
  }
  return {
    tripName: typeof value.tripName === "string" ? value.tripName.slice(0, 120) : "",
    campers: integer(value.campers, 20, 2), days, startDate, endDate,
    campType: ["tent", "cabin", "rv"].includes(value.campType) ? value.campType : "tent",
    weather: ["mild", "hot", "cold", "rain"].includes(value.weather) ? value.weather : "mild",
    activities: ["hiking", "fishing", "swimming"].filter(activity => Array.isArray(value.activities) && value.activities.includes(activity)),
    withKids: value.withKids === true, withPet: value.withPet === true,
    cookAtCamp: value.cookAtCamp === true, noWater: value.noWater === true
  };
}

function collectPlannerSettings() {
  return {
    tripName: document.getElementById("tripName").value.trim(),
    campers: Math.min(20, Math.max(1, Number(document.getElementById("campers").value) || 1)),
    days: Math.min(30, Math.max(1, Number(document.getElementById("days").value) || 1)),
    startDate: document.getElementById("startDate").value || "",
    endDate: document.getElementById("endDate").value || "",
    campType: document.getElementById("campType").value,
    weather: document.getElementById("weather").value,
    activities: [...document.querySelectorAll('input[name="activity"]:checked')].map((input) => input.value),
    withKids: document.getElementById("withKids").checked,
    withPet: document.getElementById("withPet").checked,
    cookAtCamp: document.getElementById("cookAtCamp").checked,
    noWater: document.getElementById("noWater").checked
  };
}

function populatePlannerForm(settings) {
  if (!settings) return;

  document.getElementById("tripName").value = settings.tripName || "";
  document.getElementById("campers").value = settings.campers || 2;
  document.getElementById("days").value = settings.days || 2;
  document.getElementById("startDate").value = settings.startDate || "";
  document.getElementById("endDate").value = settings.endDate || "";
  document.getElementById("campType").value = settings.campType || "tent";
  document.getElementById("weather").value = settings.weather || "mild";
  document.getElementById("withKids").checked = Boolean(settings.withKids);
  document.getElementById("withPet").checked = Boolean(settings.withPet);
  document.getElementById("cookAtCamp").checked = Boolean(settings.cookAtCamp);
  document.getElementById("noWater").checked = Boolean(settings.noWater);

  syncPlannerDates("restore", false);
  document.querySelectorAll('input[name="activity"]').forEach((input) => {
    input.checked = Array.isArray(settings.activities)
      ? settings.activities.includes(input.value)
      : false;
  });
}

function campTypeLabel(value) {
  return {
    tent: "Tent",
    cabin: "Cabin",
    rv: "RV"
  }[value] || "Camping";
}

function parseDateOnly(value) {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function inclusiveDaysBetween(startValue, endValue) {
  const start = parseDateOnly(startValue);
  const end = parseDateOnly(endValue);

  if (!start || !end || end < start) return null;

  return Math.floor((end - start) / 86400000) + 1;
}

function formatDateOnly(value) {
  const date = parseDateOnly(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

// User-written notes stay on this device and are only shared when the user shares a trip.
function normalizeDayPlans(rawPlans, days = 30) {
  const total = Math.min(30, Math.max(0, Number.parseInt(days, 10) || 0));
  const source = Array.isArray(rawPlans) ? rawPlans : [];
  return Array.from({ length: total }, (_, dayIndex) => {
    const item = source[dayIndex];
    return {
      title: typeof item?.title === "string" ? item.title.slice(0, 80) : "",
      notes: typeof item?.notes === "string" ? item.notes.slice(0, 1200) : ""
    };
  });
}

function loadCurrentDayPlans() {
  try {
    const saved = localStorage.getItem(CURRENT_DAY_PLANS_KEY);
    return saved ? normalizeDayPlans(JSON.parse(saved)) : [];
  } catch {
    return [];
  }
}

function dayDateLabel(startDate, offset) {
  const start = parseDateOnly(startDate);
  if (!start) return "";
  start.setUTCDate(start.getUTCDate() + offset);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC"
  }).format(start);
}

function dayPlanExample(index, totalDays, settings = {}) {
  const activityIdeas = {
    hiking: ["Walk a nearby nature trail", "Explore a different trail", "Take a short scenic hike"],
    fishing: ["Spend time fishing", "Try a different fishing spot", "Enjoy a quiet morning by the water"],
    swimming: ["Visit the designated swimming area", "Relax by the water", "Go for an afternoon swim"]
  };
  const selected = (settings.activities || []).filter(activity => activityIdeas[activity]);
  const ideas = selected.length
    ? selected.flatMap(activity => activityIdeas[activity])
    : ["Explore the campground", "Take a scenic walk", "Visit a nearby viewpoint", "Enjoy an outdoor picnic"];
  const activity = ideas[Math.max(0, index - 1) % ideas.length];
  const setup = settings.campType === "cabin" ? "Check in and settle into the cabin" : settings.campType === "rv" ? "Arrive and set up the RV" : "Arrive and set up camp";
  if (totalDays === 1) return {title:"A day outdoors", notes:`Morning: Arrive and explore the area\nAfternoon: ${activity}\nBefore leaving: Pack your gear and check for litter`};
  if (index === 0) return {title:"Arrive and settle in", notes:`Arrival: ${setup}\nAfternoon: Get familiar with the campground\nEvening: ${settings.cookAtCamp ? "Prepare dinner at camp" : "Enjoy dinner"} and play a game`};
  if (index === totalDays - 1) return {title:"Pack up and head home", notes:"Morning: Have breakfast and pack your gear\nBefore checkout: Clean the campsite and collect all litter\nDeparture: Check for forgotten items and head home"};
  const evenings = ["Play charades with your group", "Enjoy a quiet evening and look at the stars", "Share stories and plan tomorrow", "Play a favorite camping game"];
  return {title:`Day ${index + 1}: Explore and unwind`, notes:`Morning: ${activity}\nAfternoon: ${settings.weather === "rain" ? "Plan a sheltered activity and check the weather" : ideas[(index + 1) % ideas.length]}\nEvening: ${evenings[(index - 1) % evenings.length]}`};
}

function renderDayPlans() {
  if (!dayPlannerGrid) return;
  if (!currentPlannerSettings) {
    dayPlannerTripLabel.textContent = "Your itinerary";
    dayPlannerCaption.textContent = "Generate a trip above to get started.";
    dayPlannerStatus.textContent = "Stored on this device";
    dayPlannerGrid.innerHTML = `
      <div class="day-planner-empty">
        <h3>Your daily plans start here</h3>
        <p>Choose the number of days in the Trip Planner, then generate your packing list.</p>
        <a href="#planner" class="btn primary">Create a Trip</a>
      </div>`;
    return;
  }

  const days = Math.min(30, Math.max(1, Number(currentPlannerSettings.days) || 1));
  currentDayPlans = normalizeDayPlans(currentDayPlans, days);
  dayPlannerTripLabel.textContent = currentPlannerSettings.tripName?.trim() || "Your camping trip";
  dayPlannerCaption.textContent = `${days} day${days === 1 ? "" : "s"} to plan`;
  dayPlannerStatus.textContent = "Auto-saved on this device";

  dayPlannerGrid.innerHTML = currentDayPlans.map((day, i) => {
    const date = dayDateLabel(currentPlannerSettings.startDate, i);
    const example = dayPlanExample(i, days, currentPlannerSettings);
    return `
      <article class="day-plan-card" data-day-index="${i}">
        <div class="day-plan-card-head">
          <h3>Day ${i + 1}</h3>
          ${date ? `<span class="day-plan-date">${escapeChecklistText(date)}</span>` : ""}
        </div>
        <label for="day-title-${i}">Day title
          <input id="day-title-${i}" class="day-title-input" type="text" maxlength="80"
            placeholder="${escapeChecklistText(example.title)}" value="${escapeChecklistText(day.title)}" />
        </label>
        <p class="day-example-label">Example plan below · Write your own notes</p>
        <label for="day-notes-${i}">Activities & notes
          <textarea id="day-notes-${i}" class="day-notes-input" maxlength="1200"
            placeholder="${escapeChecklistText(example.notes)}">${escapeChecklistText(day.notes)}</textarea>
        </label>
      </article>`;
  }).join("");
}

if (dayPlannerGrid) {
  dayPlannerGrid.addEventListener("input", (event) => {
    const field = event.target;
    if (!field.matches(".day-title-input, .day-notes-input")) return;
    const card = field.closest(".day-plan-card");
    const i = Number(card?.dataset.dayIndex);
    if (!Number.isInteger(i) || !currentDayPlans[i]) return;

    if (field.classList.contains("day-title-input")) {
      currentDayPlans[i].title = field.value.slice(0, 80);
    } else {
      currentDayPlans[i].notes = field.value.slice(0, 1200);
    }
    saveCurrentState();
    dayPlannerStatus.textContent = "Auto-saved on this device";
  });

  dayPlannerGrid.addEventListener("change", (event) => {
    const field = event.target;
    if (!field.matches(".day-title-input, .day-notes-input")) return;
    const card = field.closest(".day-plan-card");
    trackEvent("day_plan_update", {
      day_number: Number(card?.dataset.dayIndex) + 1,
      field: field.classList.contains("day-title-input") ? "title" : "notes"
    });
    renderSavedTrips();
  });
}

function tripDateLabel(settings) {
  if (settings?.startDate && settings?.endDate) {
    return `${formatDateOnly(settings.startDate)} – ${formatDateOnly(settings.endDate)}`;
  }

  if (settings?.startDate) {
    return `Starts ${formatDateOnly(settings.startDate)}`;
  }

  return `${settings?.days || "?"} day${settings?.days === 1 ? "" : "s"}`;
}

function updateTripStorageStatus() {
  const status = document.getElementById("tripStorageStatus");
  if (!status) return;
  status.textContent = currentTripId
    ? "Saved trip · Changes save automatically on this device."
    : "Draft saved on this device. Choose Save Current Trip to add it to Saved Trips.";
}

function updateTripSummary() {
  if (!tripSummaryCard) return;

  if (!currentPlannerSettings) {
    tripSummaryCard.hidden = true;
    return;
  }

  const settings = currentPlannerSettings;
  const name = settings.tripName?.trim() || "Current Camping Trip";
  const activityText =
    Array.isArray(settings.activities) && settings.activities.length > 0
      ? settings.activities.map((activity) =>
          activity.charAt(0).toUpperCase() + activity.slice(1)
        ).join(" + ")
      : "No activities selected";

  tripSummaryName.textContent = name;
  tripSummaryDetails.innerHTML = `
    <span>${escapeChecklistText(settings.campers || "?")} camper${settings.campers === 1 ? "" : "s"}</span>
    <span>${escapeChecklistText(tripDateLabel(settings))}</span>
    <span>${escapeChecklistText(campTypeLabel(settings.campType))}</span>
    <span>${escapeChecklistText(activityText)}</span>
  `;

  tripSummaryCard.hidden = false;
  updateTripStorageStatus();
}



// V36: master checklist, collapsible trip starter and day planner popup.
const starterToggle = document.getElementById("starterToggle");
const starterBody = document.getElementById("starterBody");
const masterChecklistToggle = document.getElementById("masterChecklistToggle");
const checklistBody = document.getElementById("checklistBody");
const dayPlannerModal = document.getElementById("dayPlannerModal");
const openDayPlanner = document.getElementById("openDayPlanner");
const closeDayPlannerModal = document.getElementById("closeDayPlannerModal");
function togglePanel(button, body, expanded, remember = false) {
  if (!button || !body) return;
  button.setAttribute("aria-expanded", String(expanded));
  body.hidden = !expanded;
  if (body === checklistBody) {
    if (remember) localStorage.setItem("camping-classics-checklist-expanded", String(expanded));
    const opener = document.getElementById("openChecklist");
    opener.hidden = expanded;
    opener.textContent = "Open Checklist";
    opener.setAttribute("aria-expanded", String(expanded));
  }
  if (button === masterChecklistToggle) {
    button.setAttribute("aria-label", expanded ? "Collapse everything below current trip" : "Expand everything below current trip");
  }
}
document.getElementById("openChecklist").addEventListener("click", () => {
  togglePanel(masterChecklistToggle, checklistBody, checklistBody.hidden, true);
});
starterToggle?.addEventListener("click", () => {
  togglePanel(starterToggle, starterBody, starterToggle.getAttribute("aria-expanded") !== "true");
});
masterChecklistToggle?.addEventListener("click", () => {
  const expanded = masterChecklistToggle.getAttribute("aria-expanded") !== "true";
  togglePanel(masterChecklistToggle, checklistBody, expanded, true);
  trackEvent(expanded ? "checklist_master_expand" : "checklist_master_collapse");
});
openDayPlanner?.addEventListener("click", () => {
  renderDayPlans();
  openSiteModal(dayPlannerModal);
  dayPlannerModal?.querySelector(".site-modal")?.focus();
  trackEvent("day_planner_open");
});
function finishDayPlans() {
  saveCurrentState();
  closeSiteModal(dayPlannerModal);
  openDayPlanner?.focus({preventScroll:true});
}
closeDayPlannerModal?.addEventListener("click", finishDayPlans);
document.getElementById("doneDayPlanner").addEventListener("click", finishDayPlans);
dayPlannerModal?.addEventListener("click", (event) => {
  if (event.target === dayPlannerModal) closeSiteModal(dayPlannerModal);
});

const plannerDaysInput = document.getElementById("days");
const plannerStartInput = document.getElementById("startDate");
const plannerEndInput = document.getElementById("endDate");
const tripDateStatus = document.getElementById("tripDateStatus");
let lastValidTripDates = {days:plannerDaysInput.value, startDate:plannerStartInput.value, endDate:plannerEndInput.value};

function datePlusDays(value, offset) {
  const date = parseDateOnly(value);
  if (!date) return "";
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function syncPlannerDates(changedField, updateCurrent = true) {
  let days = Math.min(30, Math.max(1, Math.trunc(Number(plannerDaysInput.value) || 1)));
  let startDate = plannerStartInput.value;
  let endDate = plannerEndInput.value;
  let message = "";
  if (changedField === "startDate" && !startDate) endDate = "";
  if (!startDate && endDate) startDate = datePlusDays(endDate, 1 - days);
  if (startDate) {
    if (changedField === "days" || !endDate) endDate = datePlusDays(startDate, days - 1);
    if (endDate < startDate) {
      endDate = changedField === "startDate" ? datePlusDays(startDate, days - 1) : startDate;
      message = "End date adjusted: it cannot be before the start date.";
    }
    const count = inclusiveDaysBetween(startDate, endDate);
    if (count > 30) {
      endDate = datePlusDays(startDate, 29);
      message = "Trips can be up to 30 days. The end date has been adjusted.";
    }
    days = inclusiveDaysBetween(startDate, endDate);
  }
  if (updateCurrent && currentPlannerSettings && days < currentPlannerSettings.days &&
      currentDayPlans.slice(days).some(day => day.title.trim() || day.notes.trim()) &&
      !window.confirm(`Shortening this trip to ${days} days removes notes for the later days. Continue?`)) {
    plannerDaysInput.value = lastValidTripDates.days;
    plannerStartInput.value = lastValidTripDates.startDate;
    plannerEndInput.value = lastValidTripDates.endDate;
    tripDateStatus.textContent = "Trip length kept so your daily notes stay intact.";
    refreshDateFields();
    return false;
  }
  plannerDaysInput.value = String(days);
  plannerStartInput.value = startDate;
  plannerEndInput.value = endDate;
  plannerEndInput.min = startDate;
  plannerEndInput.max = startDate ? datePlusDays(startDate, 29) : "";
  plannerEndInput.setCustomValidity("");
  lastValidTripDates = {days:String(days),startDate,endDate};
  refreshDateFields();
  tripDateStatus.textContent = message || `${days} day${days === 1 ? "" : "s"} · Includes arrival and departure day.`;
  if (updateCurrent && currentPlannerSettings) {
    currentPlannerSettings.days = days;
    currentPlannerSettings.startDate = startDate;
    currentPlannerSettings.endDate = endDate;
    currentDayPlans = normalizeDayPlans(currentDayPlans, days);
    renderDayPlans();
    saveCurrentState();
    updateTripSummary();
    renderSavedTrips();
  }
  return true;
}
[plannerStartInput, plannerEndInput, plannerDaysInput].forEach(input => {
  input.addEventListener("input", () => {
    if (input === plannerDaysInput && !input.value) return;
    syncPlannerDates(input.id);
  });
  input.addEventListener("change", () => syncPlannerDates(input.id));
});

tripForm.addEventListener("input", updatePlannerPreview);
tripForm.addEventListener("change", updatePlannerPreview);

tripForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!syncPlannerDates("submit")) return;
  currentPlannerSettings = collectPlannerSettings();
  currentTripId = null;
  localStorage.removeItem(ACTIVE_TRIP_KEY);

  if (currentPlannerSettings.startDate && currentPlannerSettings.endDate) {
    const calculatedDays = inclusiveDaysBetween(
      currentPlannerSettings.startDate,
      currentPlannerSettings.endDate
    );

    if (calculatedDays === null) {
      plannerSummary.textContent = "End date must be the same as or after the start date.";
      return;
    }

    currentPlannerSettings.days = Math.min(30, calculatedDays);
    document.getElementById("days").value = currentPlannerSettings.days;
  }

  const {
    tripName,
    campers,
    days,
    campType,
    weather,
    activities,
    withKids,
    withPet,
    cookAtCamp,
    noWater
  } = currentPlannerSettings;

  currentChecklist = buildStartingChecklist(currentPlannerSettings);
  currentDayPlans = normalizeDayPlans(currentDayPlans, currentPlannerSettings.days);

  trackEvent("generate_packing_list", {
    campers: campers,
    days: currentPlannerSettings.days,
    camp_type: campType,
    weather: weather,
    activity_count: activities.length,
    with_kids: withKids,
    with_pet: withPet,
    cooking_at_camp: cookAtCamp
  });

  saveCurrentState();
  renderChecklist();
  renderDayPlans();
  updatePlannerPreview();
  togglePanel(starterToggle, starterBody, false);
  togglePanel(masterChecklistToggle, checklistBody, true, true);

  const displayName = tripName || "Your trip";
  plannerSummary.textContent =
    `${displayName}: checklist created for ${campers} camper${campers === 1 ? "" : "s"} over ${currentPlannerSettings.days} day${currentPlannerSettings.days === 1 ? "" : "s"}. Set the quantities you plan to bring below.`;

  saveTripStatus.textContent = "";
  requestAnimationFrame(() => {
    masterChecklistToggle.focus({preventScroll:true});
    showChecklistSection();
  });
});

customItemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const label = customItemName.value.trim();
  if (!label) return;

  const category = customItemCategory.value || "Extras";
  const quantity = 0;

  if (!currentChecklist[category]) {
    currentChecklist[category] = [];
  }

  const duplicate = currentChecklist[category].find(
    (item) => item.label.trim().toLowerCase() === label.toLowerCase()
  );

  if (duplicate) {
    customItemStatus.textContent =
      `"${label}" is already in ${category}. Change its quantity in the checklist instead.`;
    customItemName.focus();
    return;
  }

  currentChecklist[category].push(
    createChecklistItem(label, quantity, false, true)
  );

  customItemName.value = "";
  customItemStatus.textContent = `"${label}" added to ${category}.`;

  renderChecklist();
  updatePlannerPreview();
  renderSavedTrips();
  customItemName.focus();
});


if (expandAllSections) {
  expandAllSections.addEventListener("click", () => {
    setAllChecklistSections(true);
    trackEvent("checklist_expand_all");
  });
}

if (collapseAllSections) {
  collapseAllSections.addEventListener("click", () => {
    setAllChecklistSections(false);
    trackEvent("checklist_collapse_all");
  });
}


function buildPrintChecklist() {
  const sheet = document.getElementById("printChecklistSheet");
  const settings = currentPlannerSettings;
  const stats = checklistProgressStats();
  const title = settings?.tripName?.trim() || "Camping packing checklist";
  const details = settings ? `${tripDateLabel(settings)} · ${settings.campers} campers · ${campTypeLabel(settings.campType)}` : "Camping Classics";
  sheet.innerHTML = `<header class="print-heading"><p>Camping Classics</p><h1>${escapeChecklistText(title)}</h1><p>${escapeChecklistText(details)}</p><p>${stats.checked} of ${stats.total} items packed · Quantities show how many you plan to bring.</p></header>` +
    Object.entries(currentChecklist).map(([category, items]) => `<table class="print-category"><caption>${escapeChecklistText(category)}</caption><thead><tr><th class="print-packed-col">Packed</th><th>Item</th><th class="print-qty-col">Qty</th></tr></thead><tbody>${items.map(item => `<tr><td><span class="print-box">${item.checked && item.quantity > 0 ? "✓" : ""}</span></td><td>${escapeChecklistText(item.label)}</td><td>${clampQuantity(item.quantity)}</td></tr>`).join("")}</tbody></table>`).join("") +
    `<p class="print-footnote">Check items off as you pack. Generated from your current trip.</p>`;
}
window.addEventListener("beforeprint", buildPrintChecklist);

if (printChecklist) {
  printChecklist.addEventListener("click", () => {
    trackEvent("print_checklist");
    buildPrintChecklist();
    window.print();
  });
}

resetChecklist.addEventListener("click", () => {
  if (!window.confirm("Reset the checklist to default items and clear packing progress? Custom items will be removed. Your trip details and daily notes will stay.")) return;
  currentChecklist = cloneData(defaultChecklist);
  renderChecklist();
  updateTripSummary();
  saveTripStatus.textContent = "Checklist reset to default items. Your trip details and daily plans are kept.";
});

function loadSavedTrips() {
  try {
    const saved = localStorage.getItem(SAVED_TRIPS_KEY);
    const raw = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(raw)) return [];
    return raw.filter(trip => trip && typeof trip === "object" && typeof trip.id === "string").map(trip => ({
      id: trip.id.slice(0, 160),
      name: typeof trip.name === "string" ? trip.name.slice(0, 120) : "Camping Trip",
      planner: normalizePlannerSettings(trip.planner),
      checklist: normalizeChecklist(trip.checklist),
      dayPlans: normalizeDayPlans(trip.dayPlans, normalizePlannerSettings(trip.planner).days),
      archived: trip.archived === true,
      createdAt: Number.isFinite(trip.createdAt) ? trip.createdAt : 0,
      updatedAt: Number.isFinite(trip.updatedAt) ? trip.updatedAt : 0
    }));
  } catch {
    return [];
  }
}

function writeSavedTrips(trips) {
  localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
}

function checklistCompletion(checklist) {
  return checklistProgressStats(checklist).percent;
}

function persistActiveTrip() {
  if (!currentTripId || !currentPlannerSettings) return;

  const trips = loadSavedTrips();
  const index = trips.findIndex((trip) => trip.id === currentTripId);

  if (index < 0) {
    localStorage.removeItem(ACTIVE_TRIP_KEY);
    currentTripId = null;
    return;
  }

  trips[index] = {
    ...trips[index],
    name: currentPlannerSettings.tripName?.trim() || trips[index].name,
    planner: cloneData(currentPlannerSettings),
    checklist: cloneData(currentChecklist),
    dayPlans: cloneData(currentDayPlans),
    updatedAt: Date.now()
  };

  writeSavedTrips(trips);
}


function tripTypeIcon(campType) {
  if (campType === "rv") return "🚐";
  if (campType === "cabin") return "🏡";
  return "⛺";
}

function encodeSharePayload(value) {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodeSharePayload(value) {
  if (typeof value !== "string" || value.length > 100000 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid shared trip");
  }
  const padded = value
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json);
}

function createTripShareUrl(trip) {
  const payload = {
    v: 1,
    name: trip.name,
    planner: trip.planner || {},
    checklist: normalizeChecklist(trip.checklist),
    dayPlans: normalizeDayPlans(trip.dayPlans, trip.planner?.days || 1)
  };

  const url = new URL(window.location.href);
  url.hash = `sharedTrip=${encodeSharePayload(payload)}`;

  return url.toString();
}

function openShareTripModal(trip) {
  const url = createTripShareUrl(trip);
  const tooLong = url.length > 18000;

  shareTripModal.dataset.tripName = trip.name;
  shareTripLink.value = tooLong ? "" : url;
  shareTripStatus.textContent = tooLong
    ? "This trip contains too much text for a reliable share link. Shorten some day notes to share it."
    : "";
  copyShareTripLink.disabled = tooLong;

  const canNativeShare =
    window.isSecureContext &&
    location.protocol !== "file:" &&
    typeof navigator.share === "function";

  nativeShareTrip.hidden = !canNativeShare || tooLong;

  openSiteModal(shareTripModal);
  shareTripLink.focus();
  shareTripLink.select();
}

function openSiteModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeSiteModal(modal) {
  if (!modal) return;
  modal.hidden = true;

  if (!document.querySelector(".modal-backdrop:not([hidden])")) {
    document.body.classList.remove("modal-open");
  }
}

if (copyShareTripLink) {
  copyShareTripLink.addEventListener("click", async () => {
    const value = shareTripLink.value;

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        shareTripLink.focus();
        shareTripLink.select();
        document.execCommand("copy");
      }

      shareTripStatus.textContent = "Link copied.";
      trackEvent("share_trip", { method: "copy_link" });
    } catch {
      shareTripLink.focus();
      shareTripLink.select();
      shareTripStatus.textContent = "Select the link and copy it.";
    }
  });
}

if (nativeShareTrip) {
  nativeShareTrip.addEventListener("click", async () => {
    if (!navigator.share || !window.isSecureContext || location.protocol === "file:") return;

    try {
      await navigator.share({
        title: `Camping Classics — ${shareTripModal.dataset.tripName || "Trip"}`,
        text: "Here is my Camping Classics trip.",
        url: shareTripLink.value
      });

      trackEvent("share_trip", { method: "native_share" });
      closeSiteModal(shareTripModal);
    } catch (error) {
      if (error?.name !== "AbortError") {
        shareTripStatus.textContent = "Sharing was unavailable. Use Copy Link instead.";
      }
    }
  });
}

if (closeShareTripModal) {
  closeShareTripModal.addEventListener("click", () => {
    closeSiteModal(shareTripModal);
  });
}

if (shareTripModal) {
  shareTripModal.addEventListener("click", (event) => {
    if (event.target === shareTripModal) {
      closeSiteModal(shareTripModal);
    }
  });
}



let pendingSharedTrip = null;

function showSharedTripImport(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;

  const checklist = normalizeChecklist(payload.checklist || {});
  const settings = normalizePlannerSettings(payload.planner);
  const stats = checklistProgressStats(checklist);
  const name = (typeof payload.name === "string" && payload.name.trim() ? payload.name : settings.tripName || "Shared Camping Trip").slice(0, 120);

  pendingSharedTrip = {
    name,
    planner: {
      ...settings,
      tripName: name
    },
    checklist,
    dayPlans: normalizeDayPlans(payload.dayPlans, settings.days || 1)
  };

  sharedTripTitle.textContent = name;
  sharedTripDescription.textContent = "Someone shared this Camping Classics trip with you.";
  const icon = document.createElement("div");
  icon.className = "shared-trip-preview-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = tripTypeIcon(settings.campType);
  const details = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = name;
  const description = document.createElement("p");
  description.textContent = `${settings.campers} camper${settings.campers === 1 ? "" : "s"} · ${tripDateLabel(settings)} · ${campTypeLabel(settings.campType)}`;
  const progress = document.createElement("span");
  progress.textContent = `${stats.checked} of ${stats.total} packed`;
  details.append(title, description, progress);
  sharedTripPreview.replaceChildren(icon, details);

  openSiteModal(sharedTripModal);
}

function checkForSharedTripLink() {
  const prefix = "#sharedTrip=";

  if (!window.location.hash.startsWith(prefix)) return;

  try {
    const payload = decodeSharePayload(window.location.hash.slice(prefix.length));
    showSharedTripImport(payload);
  } catch {
    // Ignore invalid or incomplete shared-trip links.
  }
}


function renderSavedTrips() {
  updateTripStorageStatus();
  const trips = loadSavedTrips().sort((a, b) => b.updatedAt - a.updatedAt);

  if (trips.length === 0) {
    savedTripsList.innerHTML = `
      <div class="saved-trip-empty">
        <h3>No saved trips yet</h3>
        <p>Generate a packing list, give the trip a name, and choose <strong>Save Current Trip</strong>.</p>
      </div>
    `;
    return;
  }

  const upcomingTrips = trips.filter((trip) => !trip.archived);
  const pastTrips = trips.filter((trip) => trip.archived);

  const renderTripCard = (trip, archived = false) => {
    const settings = trip.planner || {};
    const stats = checklistProgressStats(trip.checklist);
    const lastEdited = new Date(trip.updatedAt || trip.createdAt || Date.now()).toLocaleString(
      undefined,
      { dateStyle: "medium", timeStyle: "short" }
    );
    const canArchive = !archived && stats.total > 0 && stats.percent === 100;

    return `
      <article class="saved-trip-card ${archived ? "archived-trip-card" : ""}">
        <div class="saved-trip-card-header">
          <div class="saved-trip-icon" aria-hidden="true">${tripTypeIcon(settings.campType)}</div>

          <div class="saved-trip-heading">
            <p class="eyebrow">${archived ? "Past Trip" : "Saved Trip"}</p>
            <h3>${escapeChecklistText(trip.name)}</h3>
          </div>

          <div class="saved-trip-status-wrap">
            <strong class="saved-trip-percent">${stats.percent}% packed</strong>
            ${
              canArchive
                ? '<span class="saved-trip-ready">Ready to archive</span>'
                : archived
                  ? '<span class="saved-trip-archived">Archived</span>'
                  : ""
            }
          </div>
        </div>

        <div class="saved-trip-detail-chips">
          <span>${escapeChecklistText(settings.campers || "?")} camper${settings.campers === 1 ? "" : "s"}</span>
          <span>${escapeChecklistText(tripDateLabel(settings))}</span>
          <span>${escapeChecklistText(campTypeLabel(settings.campType))}</span>
        </div>

        <div class="saved-trip-progress-row">
          <span>${stats.checked} of ${stats.total} packed</span>
          <span>Last edited ${escapeChecklistText(lastEdited)}</span>
        </div>

        <div class="mini-progress-track" aria-hidden="true">
          <div class="mini-progress-fill" style="width:${stats.percent}%"></div>
        </div>

        <div class="saved-trip-actions">
          <button class="btn primary open-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Open Trip</button>
          <button class="btn secondary share-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Share</button>
          <button class="btn secondary duplicate-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Duplicate</button>
          <button class="btn secondary rename-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Rename</button>
          ${
            archived
              ? `<button class="btn secondary restore-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Restore</button>`
              : canArchive
                ? `<button class="btn secondary archive-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Archive</button>`
                : ""
          }
          <button class="btn secondary delete-saved-trip" type="button" data-trip-id="${escapeChecklistText(trip.id)}">Delete</button>
        </div>

        <p class="saved-trip-action-status" data-status-for="${escapeChecklistText(trip.id)}" aria-live="polite"></p>
      </article>
    `;
  };

  const upcomingMarkup = upcomingTrips.length
    ? upcomingTrips.map((trip) => renderTripCard(trip, false)).join("")
    : `
      <div class="saved-trip-empty compact-empty">
        <h3>No upcoming trips</h3>
        <p>Your archived trips are still available below.</p>
      </div>
    `;

  const pastMarkup = pastTrips.length
    ? pastTrips.map((trip) => renderTripCard(trip, true)).join("")
    : `
      <div class="saved-trip-empty compact-empty">
        <p>Completed trips you archive will appear here.</p>
      </div>
    `;

  savedTripsList.innerHTML = `
    <div class="saved-trip-group">
      <div class="saved-trip-group-heading">
        <div>
          <p class="eyebrow">Planning</p>
          <h3>Upcoming Trips</h3>
        </div>
        <span>${upcomingTrips.length}</span>
      </div>
      <div class="saved-trips-grid">${upcomingMarkup}</div>
    </div>

    <div class="saved-trip-group">
      <div class="saved-trip-group-heading">
        <div>
          <p class="eyebrow">History</p>
          <h3>Past Trips</h3>
        </div>
        <span>${pastTrips.length}</span>
      </div>
      <div class="saved-trips-grid">${pastMarkup}</div>
    </div>
  `;

  savedTripsList.querySelectorAll(".open-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trip = loadSavedTrips().find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      currentTripId = trip.id;
      localStorage.setItem(ACTIVE_TRIP_KEY, trip.id);
      currentPlannerSettings = trip.planner || null;
      currentChecklist = normalizeChecklist(trip.checklist);
      togglePanel(masterChecklistToggle, checklistBody, true);
      currentDayPlans = normalizeDayPlans(trip.dayPlans, trip.planner?.days || 1);

      populatePlannerForm(currentPlannerSettings);
      renderChecklist();
      renderDayPlans();
      updatePlannerPreview();
      updateTripSummary();

      plannerSummary.textContent =
        `${trip.name} loaded. Changes to this saved trip are preserved as you edit it.`;

      saveTripStatus.textContent = `Loaded "${trip.name}".`;
      trackEvent("open_saved_trip");
      showChecklistSection();
    });
  });

  savedTripsList.querySelectorAll(".share-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trip = loadSavedTrips().find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      openShareTripModal(trip);
    });
  });

  savedTripsList.querySelectorAll(".duplicate-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trips = loadSavedTrips();
      const source = trips.find((trip) => trip.id === button.dataset.tripId);
      if (!source) return;

      const now = Date.now();
      const copy = cloneData(source);
      copy.id = `trip-${now}-${Math.random().toString(36).slice(2, 8)}`;
      copy.name = `${source.name} Copy`;
      copy.createdAt = now;
      copy.updatedAt = now;
      copy.archived = false;

      if (copy.planner) {
        copy.planner.tripName = copy.name;
      }

      trips.push(copy);
      writeSavedTrips(trips);
      renderSavedTrips();
    });
  });

  savedTripsList.querySelectorAll(".rename-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trips = loadSavedTrips();
      const trip = trips.find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      const newName = window.prompt("Rename this trip:", trip.name);
      if (newName === null) return;

      const cleaned = newName.trim();
      if (!cleaned) return;

      trip.name = cleaned;
      trip.updatedAt = Date.now();

      if (trip.planner) {
        trip.planner.tripName = cleaned;
      }

      if (currentTripId === trip.id && currentPlannerSettings) {
        currentPlannerSettings.tripName = cleaned;
        document.getElementById("tripName").value = cleaned;
        updateTripSummary();
      }

      writeSavedTrips(trips);
      renderSavedTrips();
    });
  });

  savedTripsList.querySelectorAll(".archive-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trips = loadSavedTrips();
      const trip = trips.find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      trip.archived = true;
      trip.updatedAt = Date.now();

      writeSavedTrips(trips);
      trackEvent("archive_trip");
      renderSavedTrips();
    });
  });

  savedTripsList.querySelectorAll(".restore-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trips = loadSavedTrips();
      const trip = trips.find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      trip.archived = false;
      trip.updatedAt = Date.now();

      writeSavedTrips(trips);
      trackEvent("restore_trip");
      renderSavedTrips();
    });
  });

  savedTripsList.querySelectorAll(".delete-saved-trip").forEach((button) => {
    button.addEventListener("click", () => {
      const trips = loadSavedTrips();
      const trip = trips.find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      if (!window.confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;

      writeSavedTrips(trips.filter((savedTrip) => savedTrip.id !== trip.id));

      if (currentTripId === trip.id) {
        currentTripId = null;
        localStorage.removeItem(ACTIVE_TRIP_KEY);
      }

      renderSavedTrips();
    });
  });
}

saveTripBtn.addEventListener("click", () => {
  currentPlannerSettings = {
    ...(currentPlannerSettings || {}),
    ...collectPlannerSettings()
  };

  currentDayPlans = normalizeDayPlans(currentDayPlans, currentPlannerSettings.days);
  renderDayPlans();

  let tripName = currentPlannerSettings.tripName.trim();

  if (!tripName) {
    tripName = `Camping Trip ${new Date().toLocaleDateString()}`;
    currentPlannerSettings.tripName = tripName;
    document.getElementById("tripName").value = tripName;
  }

  const trips = loadSavedTrips();
  const now = Date.now();

  if (currentTripId) {
    const existingIndex = trips.findIndex((trip) => trip.id === currentTripId);

    if (existingIndex >= 0) {
      trips[existingIndex] = {
        ...trips[existingIndex],
        name: tripName,
        planner: cloneData(currentPlannerSettings),
        checklist: cloneData(currentChecklist),
        dayPlans: cloneData(currentDayPlans),
        archived: false,
        updatedAt: now
      };
    } else {
      currentTripId = null;
    }
  }

  if (!currentTripId) {
    currentTripId = `trip-${now}-${Math.random().toString(36).slice(2, 8)}`;

    trips.push({
      id: currentTripId,
      name: tripName,
      planner: cloneData(currentPlannerSettings),
      checklist: cloneData(currentChecklist),
      dayPlans: cloneData(currentDayPlans),
      archived: false,
      createdAt: now,
      updatedAt: now
    });
  }

  writeSavedTrips(trips);
  localStorage.setItem(ACTIVE_TRIP_KEY, currentTripId);
  saveCurrentState();
  updateTripSummary();
  renderSavedTrips();

  saveTripStatus.textContent = `"${tripName}" saved.`;
  trackEvent("save_trip", {
    checklist_item_count: Object.values(currentChecklist).flat().length,
    active_item_count: checklistProgressStats(currentChecklist).total
  });
});


if (importSharedTrip) {
  importSharedTrip.addEventListener("click", () => {
    if (!pendingSharedTrip) return;

    const trips = loadSavedTrips();
    const now = Date.now();
    const importedTrip = {
      id: `trip-${now}-${Math.random().toString(36).slice(2, 8)}`,
      name: pendingSharedTrip.name,
      planner: cloneData(pendingSharedTrip.planner),
      checklist: cloneData(pendingSharedTrip.checklist),
      dayPlans: cloneData(pendingSharedTrip.dayPlans),
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    trips.push(importedTrip);
    writeSavedTrips(trips);

    currentTripId = importedTrip.id;
    currentPlannerSettings = cloneData(importedTrip.planner);
    currentChecklist = normalizeChecklist(importedTrip.checklist);
    togglePanel(masterChecklistToggle, checklistBody, true);
    currentDayPlans = normalizeDayPlans(importedTrip.dayPlans, importedTrip.planner?.days || 1);

    localStorage.setItem(ACTIVE_TRIP_KEY, currentTripId);
    saveCurrentState();

    populatePlannerForm(currentPlannerSettings);
    renderChecklist();
    renderDayPlans();
    updatePlannerPreview();
    updateTripSummary();
    renderSavedTrips();

    closeSiteModal(sharedTripModal);
    pendingSharedTrip = null;
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);

    trackEvent("import_shared_trip");
    saveTripStatus.textContent = `Shared trip "${importedTrip.name}" saved.`;
    showChecklistSection();
  });
}

[dismissSharedTrip, closeSharedTripModal].forEach((button) => {
  button?.addEventListener("click", () => {
    closeSiteModal(sharedTripModal);
  });
});

if (feedbackButton) {
  feedbackButton.addEventListener("click", () => {
    feedbackStatus.textContent = "";
    openSiteModal(feedbackModal);
    trackEvent("feedback_open");
  });
}

if (closeFeedbackModal) {
  closeFeedbackModal.addEventListener("click", () => {
    closeSiteModal(feedbackModal);
  });
}


if (feedbackComment && feedbackCharCount) {
  feedbackComment.addEventListener("input", () => {
    feedbackCharCount.textContent = `${feedbackComment.value.length}/30`;
  });
}

const feedbackConfirmation = document.getElementById("feedbackConfirmation");
function dismissFeedbackConfirmation() {
  closeSiteModal(feedbackConfirmation);
  feedbackButton?.focus({preventScroll:true});
}
document.getElementById("closeFeedbackConfirmation").addEventListener("click", dismissFeedbackConfirmation);
feedbackConfirmation.addEventListener("click", event => {
  if (event.target === feedbackConfirmation) dismissFeedbackConfirmation();
});
if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = feedbackForm.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const useful = new FormData(feedbackForm).get("feedbackUseful");
    const area = feedbackArea.value;
    const comment = feedbackComment.value.trim();
    if (!["yes", "not_yet"].includes(useful) || !["trip_planner", "checklist", "saved_trips", "camp_finder", "guides", "games", "other"].includes(area) || comment.length > 30 || !feedbackForm.reportValidity()) return;
    const endpoint = feedbackForm.dataset.endpoint;
    if (!endpoint) {
      const link = document.createElement("a");
      link.href = "mailto:campingclassics2026@gmail.com?" + new URLSearchParams({
        subject: "Camping Classics feedback",
        body: "Useful: " + useful + "\nArea: " + area + "\nComment: " + comment
      }).toString().replace(/\+/g, "%20");
      link.textContent = "Open email draft";
      feedbackStatus.replaceChildren("Email your feedback to Camping Classics: ", link);
      return;
    }
    button.disabled = true;
    feedbackStatus.textContent = "Sending feedback…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Accept": "application/json", "Content-Type": "application/json"},
        body: JSON.stringify({usefulness: useful, improvement_area: area, comment})
      });
      if (!response.ok) throw new Error("Submission failed");
    } catch {
      feedbackStatus.textContent = "Feedback could not be sent. Your answers are here so you can try again.";
      return;
    } finally {
      button.disabled = false;
    }
    trackEvent("feedback_submit", {useful: String(useful), improvement_area: area, has_comment: Boolean(comment)});
    feedbackStatus.textContent = "";
    feedbackForm.reset();

    if (feedbackCharCount) {
      feedbackCharCount.textContent = "0/30";
    }

    closeSiteModal(feedbackModal);
    openSiteModal(feedbackConfirmation);
    document.getElementById("closeFeedbackConfirmation").focus({preventScroll:true});
  });
}

[feedbackModal, sharedTripModal].forEach((modal) => {
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeSiteModal(modal);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeSiteModal(feedbackModal);
  closeSiteModal(sharedTripModal);
  closeSiteModal(shareTripModal);
  closeSiteModal(dayPlannerModal);
  if (!feedbackConfirmation.hidden) dismissFeedbackConfirmation();
});


if (currentPlannerSettings) {
  populatePlannerForm(currentPlannerSettings);
} else {
  syncPlannerDates("restore", false);
}

if (currentTripId && !loadSavedTrips().some((trip) => trip.id === currentTripId)) {
  currentTripId = null;
  localStorage.removeItem(ACTIVE_TRIP_KEY);
}

renderChecklist();
renderDayPlans();
updatePlannerPreview();
updateTripSummary();
renderSavedTrips();
attachStaticCollapsibleControls();
togglePanel(masterChecklistToggle, checklistBody, Boolean(currentPlannerSettings) && localStorage.getItem("camping-classics-checklist-expanded") !== "false");
checkForSharedTripLink();

const useLocationBtn = document.getElementById("useLocationBtn");
const campSearchForm = document.getElementById("campSearchForm");
const campSearchInput = document.getElementById("campSearchInput");
const finderStatus = document.getElementById("finderStatus");
const campResults = document.getElementById("campResults");
const showCampResults = document.getElementById("showCampResults");
const hideCampResults = document.getElementById("hideCampResults");
hideCampResults.addEventListener("click", () => {
  campResults.hidden = true;
  showCampResults.hidden = false;
  showCampResults.setAttribute("aria-expanded", "false");
  showCampResults.focus({preventScroll:true});
});
showCampResults.addEventListener("click", () => {
  campResults.hidden = false;
  showCampResults.hidden = true;
  showCampResults.setAttribute("aria-expanded", "true");
  hideCampResults.focus({preventScroll:true});
});
const campResultsTitle = document.getElementById("campResultsTitle");
const campCount = document.getElementById("campCount");
const campList = document.getElementById("campList");
let lastCampSearch = null;

if (campList) {
  campList.addEventListener("click", (event) => {
    const mapsLink = event.target.closest(".camp-map-btn");
    if (mapsLink) {
      trackEvent("camp_maps_click");
      return;
    }

    const officialLink = event.target.closest(".camp-result-actions a:not(.camp-map-btn)");
    if (officialLink) {
      trackEvent("camp_official_website_click");
    }
  });
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function milesBetween(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

async function geocodeLocation(locationText) {
  const cleaned = locationText.trim();

  if (/^\d{5}$/.test(cleaned)) {
    const zipResponse = await fetch(
      `https://api.zippopotam.us/us/${encodeURIComponent(cleaned)}`
    );

    if (!zipResponse.ok) {
      throw new Error("That U.S. ZIP code could not be found.");
    }

    const zipData = await zipResponse.json();
    const place = Array.isArray(zipData.places) ? zipData.places[0] : null;

    if (!place) {
      throw new Error("That U.S. ZIP code could not be found.");
    }

    return {
      lat: Number(place.latitude),
      lon: Number(place.longitude),
      label: `${cleaned} — ${place["place name"]}, ${place["state abbreviation"]}`,
      usedNominatim: false
    };
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    countrycodes: "us",
    addressdetails: "1",
    q: cleaned
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "Accept": "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error("Could not look up that U.S. location.");
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Location not found. Try a U.S. city, state, or ZIP code.");
  }

  const result = data[0];
  const address = result.address || {};

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    cleaned;

  const state =
    address.state_code ||
    address["ISO3166-2-lvl4"]?.replace("US-", "") ||
    address.state ||
    "";

  return {
    lat: Number(result.lat),
    lon: Number(result.lon),
    label: state ? `${city}, ${state}` : city,
    usedNominatim: true
  };
}

function normalizeCamp(result, originLat, originLon) {
  const lat = Number(result.lat);
  const lon = Number(result.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const namedetails = result.namedetails || {};
  const address = result.address || {};

  const displayFirstPart = String(result.display_name || "").split(",")[0].trim();
  const name =
    namedetails.name ||
    namedetails["name:en"] ||
    displayFirstPart;

  if (!name || name.length < 2) {
    return null;
  }

  const addressParts = [
    address.road,
    address.city || address.town || address.village,
    address.state
  ].filter(Boolean);

  return {
    id: `${result.osm_type || "place"}-${result.osm_id || result.place_id}`,
    name,
    lat,
    lon,
    distance: milesBetween(originLat, originLon, lat, lon),
    typeLabel: result.type === "caravan_site" ? "RV / caravan site" : "Campground",
    address: addressParts.join(", "),
    website: result.extratags?.website || result.extratags?.["contact:website"] || ""
  };
}


function campgroundBoundingBox(lat, lon, miles = 40) {
  const latDelta = miles / 69;
  const lonDelta =
    miles / (69 * Math.max(Math.cos(lat * Math.PI / 180), 0.2));

  return {
    south: lat - latDelta,
    west: lon - lonDelta,
    north: lat + latDelta,
    east: lon + lonDelta
  };
}

async function queryOverpassCamps(lat, lon) {
  const box = campgroundBoundingBox(lat, lon, 40);

  const query = `
    [out:json][timeout:7];
    nwr
      ["tourism"~"^(camp_site|caravan_site)$"]
      (${box.south},${box.west},${box.north},${box.east});
    out center;
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "Accept": "application/json"
        },
        body: `data=${encodeURIComponent(query)}`
      }
    );

    if (!response.ok) {
      throw new Error(`OpenStreetMap search returned ${response.status}.`);
    }

    const data = await response.json();
    return Array.isArray(data.elements) ? data.elements : [];
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizeOverpassCamp(element, originLat, originLon) {
  const tags = element.tags || {};
  const lat = Number(element.lat ?? element.center?.lat);
  const lon = Number(element.lon ?? element.center?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  const name = String(
    tags.name ||
    tags["name:en"] ||
    tags.official_name ||
    (tags.tourism === "caravan_site" ? "Unnamed RV site" : "Unnamed campground")
  ).trim();

  if (!name) {
    return null;
  }

  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"]
  ].filter(Boolean);

  return {
    id: `${element.type}-${element.id}`,
    name,
    lat,
    lon,
    distance: milesBetween(originLat, originLon, lat, lon),
    typeLabel:
      tags.tourism === "caravan_site"
        ? "RV / caravan site"
        : "Campground",
    address: addressParts.join(" "),
    website: tags.website || tags["contact:website"] || ""
  };
}

async function queryNominatimCamps(lat, lon) {
  const miles = 40;
  const latDelta = miles / 69;
  const lonDelta = miles / (69 * Math.max(Math.cos(lat * Math.PI / 180), 0.2));

  const left = lon - lonDelta;
  const right = lon + lonDelta;
  const top = lat + latDelta;
  const bottom = lat - latDelta;

  const params = new URLSearchParams({
    format: "jsonv2",
    q: "[Camp Sites]",
    bounded: "1",
    viewbox: `${left},${top},${right},${bottom}`,
    countrycodes: "us",
    addressdetails: "1",
    namedetails: "1",
    extratags: "1",
    limit: "20"
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        signal: controller.signal,
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Campground search returned ${response.status}.`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}


function safeExternalUrl(value) {
  if (!value) return "";

  let candidate = String(value).trim();

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderCampList(camps, label) {
  showCampResults.hidden = true;
  campResults.hidden = false;
  campResultsTitle.textContent = `Closest campgrounds near ${label}`;

  if (camps.length === 0) {
    campCount.textContent = "";
    campList.innerHTML = `
      <div class="camp-empty">
        No campground listings were found nearby. Try a different city or ZIP code.
      </div>
    `;
    return;
  }

  const visibleCamps = camps.slice(0, 5);
  campCount.textContent = `${visibleCamps.length} result${visibleCamps.length === 1 ? "" : "s"}`;

  campList.innerHTML = visibleCamps.map((camp, index) => {
    const mapsQuery = `${camp.lat},${camp.lon}`;
    const mapsUrl =
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

    const officialUrl = safeExternalUrl(camp.website);

    const addressHtml = camp.address
      ? `<span>${escapeHtml(camp.address)}</span>`
      : "";

    const officialWebsiteButton = officialUrl
      ? `
        <a
          class="btn secondary"
          href="${escapeHtml(officialUrl)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Official Website
        </a>
      `
      : "";

    return `
      <article class="camp-result-card">
        <div class="camp-rank" aria-label="Result ${index + 1}">${index + 1}</div>

        <div class="camp-result-info">
          <h4>${escapeHtml(camp.name)}</h4>
          <div class="camp-result-meta">
            <span class="camp-distance">${camp.distance.toFixed(1)} mi away</span>
            <span>${escapeHtml(camp.typeLabel)}</span>
            ${addressHtml}
          </div>
        </div>

        <div class="camp-result-actions">
          ${officialWebsiteButton}
          <a
            class="btn secondary camp-map-btn"
            href="${mapsUrl}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </div>
      </article>
    `;
  }).join("");

  // Results appear in place without taking scroll control from the visitor.
}

let campMap;
let campPins;
let campRequest = 0;
const areaButton = document.getElementById("searchMapArea");
function openCampMap() {
  if (campMap || !window.L) return campMap;
  document.getElementById("openCampMap").remove();
  campMap = L.map("campMap", {scrollWheelZoom: false}).setView([38, -97], 4);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(campMap);
  campPins = L.layerGroup().addTo(campMap);
  areaButton.hidden = false;
  return campMap;
}
document.getElementById("openCampMap").addEventListener("click", openCampMap);
areaButton.addEventListener("click", () => {
  const center = campMap.getCenter().wrap();
  findNearbyCamps(center.lat, center.lng, "the map center");
});
function plotCampgrounds(camps) {
  if (!campPins) return;
  const icon = L.divIcon({className: "camp-pin", iconSize: [18, 18]});
  for (const camp of camps) {
    const detail = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = camp.name;
    const directions = document.createElement("a");
    directions.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([camp.lat, camp.lon].join(","));
    directions.textContent = "Open in Google Maps";
    directions.target = "_blank";
    directions.rel = "noopener noreferrer";
    detail.append(name, document.createElement("br"), camp.distance.toFixed(1) + " mi from search center", document.createElement("br"), directions);
    L.marker([camp.lat, camp.lon], {icon, title: camp.name, alt: camp.name}).bindPopup(detail).addTo(campPins);
  }
  if (camps.length) campMap.fitBounds(camps.map(camp => [camp.lat, camp.lon]), {padding: [20, 20], maxZoom: 12});
}

async function findNearbyCamps(lat, lon, label, waitBeforeSearch = false) {
  const searchId = ++campRequest;
  const map = openCampMap();
  map?.setView([lat, lon], 9);
  campPins?.clearLayers();
  lastCampSearch = { lat, lon, label, waitBeforeSearch };
  trackEvent("camp_search");
  showCampResults.hidden = true;
  finderStatus.textContent = "Searching for nearby campgrounds...";
  campResults.hidden = true;

  let camps = [];

  try {
    const elements = await queryOverpassCamps(lat, lon);

    camps = elements
      .map((element) => normalizeOverpassCamp(element, lat, lon))
      .filter(Boolean);
  } catch (overpassError) {
    try {
      if (waitBeforeSearch) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }

      const results = await queryNominatimCamps(lat, lon);
      camps = results
        .map((result) => normalizeCamp(result, lat, lon))
        .filter(Boolean);
    } catch (fallbackError) {
      if (searchId !== campRequest) return;
      finderStatus.textContent =
        "Campground results could not load right now. Try again in a moment.";

      campResults.hidden = false;
      campResultsTitle.textContent = "Campground search";
      campCount.textContent = "";
      campList.innerHTML = `
        <div class="camp-error">
          <p>
            ${escapeHtml(
              fallbackError.name === "AbortError"
                ? "The campground data services took too long to respond."
                : fallbackError.message ||
                  overpassError.message ||
                  "The campground search service is temporarily unavailable."
            )}
          </p>
          <button class="btn primary" id="retryCampSearch" type="button">Try Again</button>
        </div>
      `;

      const retryButton = document.getElementById("retryCampSearch");
      if (retryButton && lastCampSearch) {
        retryButton.addEventListener("click", () => {
          findNearbyCamps(
            lastCampSearch.lat,
            lastCampSearch.lon,
            lastCampSearch.label,
            lastCampSearch.waitBeforeSearch
          );
        });
      }

      return;
    }
  }

  if (searchId !== campRequest) return;
  const seen = new Set();

  camps = camps
    .filter((camp) => camp.distance <= 40)
    .filter((camp) => {
      const dedupeKey =
        `${camp.name.toLowerCase()}-${camp.lat.toFixed(4)}-${camp.lon.toFixed(4)}`;

      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    })
    .sort((a, b) => a.distance - b.distance);

  plotCampgrounds(camps);

  finderStatus.textContent =
    camps.length > 0
      ? `Found ${camps.length} campground listings within about 40 miles of ${label}.`
      : `No campground listings were found within about 40 miles of ${label}.`;

  renderCampList(camps, label);
}

if (campSearchForm && campSearchInput && finderStatus) {
  campSearchInput.addEventListener("keydown", event => {
    if (event.key !== "Enter" || event.isComposing) return;
    event.preventDefault();
    if (!event.repeat) campSearchForm.requestSubmit();
  });
  campSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();


    const locationText = campSearchInput.value.trim();

    if (!locationText) {
      finderStatus.textContent = "Enter a city or ZIP code first.";
      campSearchInput.focus();
      return;
    }

    const request = ++campRequest;
    finderStatus.textContent = `Finding ${locationText}...`;

    try {
      const place = await geocodeLocation(locationText);
      if (request !== campRequest) return;

      // Keep the visible label concise instead of printing the entire geocoder result.
      await findNearbyCamps(place.lat, place.lon, place.label, place.usedNominatim === true);
    } catch (error) {
      if (request !== campRequest) return;
      finderStatus.textContent =
        error.message || "Could not search that location.";
      campResults.hidden = true;
    }
  });
}

if (useLocationBtn && finderStatus) {
  useLocationBtn.addEventListener("click", async () => {

    if (!("geolocation" in navigator)) {
      finderStatus.textContent =
        "Location access is not supported in this browser. Try the city or ZIP search instead.";
      return;
    }

    const request = ++campRequest;
    finderStatus.textContent = "Waiting for location permission...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (request !== campRequest) return;
        await findNearbyCamps(
          Number(position.coords.latitude.toFixed(1)),
          Number(position.coords.longitude.toFixed(1)),
          "your current location",
          false
        );
      },
      () => {
        if (request !== campRequest) return;
        finderStatus.textContent =
          "Location access was unavailable. You can still search using a city or ZIP code.";
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}


document.getElementById("year").textContent = new Date().getFullYear();


const sidebarPin = document.getElementById("sidebarPin");
const sidebarHeader = document.getElementById("sidebarHeader");

if (sidebarPin && sidebarHeader) {
  sidebarPin.addEventListener("click", () => {
    const pinned = document.body.classList.toggle("sidebar-pinned");
    sidebarPin.setAttribute("aria-pressed", String(pinned));
    sidebarPin.setAttribute("aria-label", pinned ? "Allow sidebar to collapse" : "Keep sidebar open");
  });
}


const sidebarNavLinks = [...document.querySelectorAll('#navMenu a[href^="#"]')];
const observedSections = sidebarNavLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveSidebarLink(sectionId) {
  sidebarNavLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window && observedSections.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]) {
        setActiveSidebarLink(visible[0].target.id);
      }
    },
    {
      rootMargin: "-20% 0px -65% 0px",
      threshold: [0, 0.05, 0.15]
    }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}


const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

navMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("open"));
});


function updateOfflineStatus() {
  if (!offlineStatus) return;
  offlineStatus.hidden = navigator.onLine;
}

window.addEventListener("online", updateOfflineStatus);
window.addEventListener("offline", updateOfflineStatus);
updateOfflineStatus();

let siteUpdateRegistration = null;
let siteUpdateRefreshRequested = false;
let siteUpdateLastCheck = 0;
function offerSiteUpdate(registration) {
  if (!registration.waiting || !navigator.serviceWorker.controller) return;
  siteUpdateRegistration = registration;
  document.getElementById("siteUpdatePrompt").hidden = false;
}
document.getElementById("dismissSiteUpdate").addEventListener("click", () => {
  document.getElementById("siteUpdatePrompt").hidden = true;
});
document.getElementById("refreshSiteUpdate").addEventListener("click", () => {
  try { saveCurrentState(); } catch (_) {
    document.getElementById("siteUpdateMessage").textContent = "Could not save this trip. Download a trip backup before refreshing.";
    return;
  }
  if (siteUpdateRegistration?.waiting) {
    siteUpdateRefreshRequested = true;
    document.getElementById("refreshSiteUpdate").disabled = true;
    siteUpdateRegistration.waiting.postMessage({type:"SKIP_WAITING"});
  } else window.location.reload();
});
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (siteUpdateRefreshRequested) window.location.reload();
  });
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {updateViaCache:"none"});
      siteUpdateRegistration = registration;
      offerSiteUpdate(registration);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed") offerSiteUpdate(registration);
        });
      });
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden && navigator.onLine && Date.now() - siteUpdateLastCheck > 60000) {
          siteUpdateLastCheck = Date.now();
          registration.update().catch(() => {});
        }
      });
      registration.update().catch(() => {});
    } catch (_) { /* Core planning works when offline support is unavailable. */ }
  });
}

// Search keeps categories and item controls intact.
const packingSearch = document.getElementById("packingSearch");
function filterPackingItems() {
  const query = (packingSearch?.value || "").trim().toLowerCase();
  let totalMatches = 0;
  document.querySelectorAll("#checklistGrid .check-card").forEach(card => {
    let matches = 0;
    card.querySelectorAll(".check-item").forEach(row => {
      row.hidden = !row.querySelector(".check-main span").textContent.toLowerCase().includes(query);
      if (!row.hidden) matches++;
    });
    totalMatches += matches;
    card.hidden = matches === 0;
    if (query && matches) setSectionExpanded(card.dataset.collapsible, true, false);
  });
  if (!query) applyCollapsedState(checklistGrid);
  document.getElementById("packingSearchEmpty").hidden = !query || totalMatches > 0;
}
packingSearch?.addEventListener("input", filterPackingItems);
new MutationObserver(filterPackingItems).observe(checklistGrid, {childList:true});
// Optional browser agent integration shares the actual packing state.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: "read_packing_progress", title: "Read packing progress",
      description: "Read the current trip's packed and total item counts.",
      inputSchema: {type:"object", properties:{}, additionalProperties:false},
      annotations: {readOnlyHint:true},
      execute(input) {
        if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length) throw new Error("Expected an empty object.");
        return checklistProgressStats();
      }
    }, {signal:lifecycle.signal})).catch(() => {});
    window.addEventListener("pagehide", () => lifecycle.abort(), {once:true});
  } catch (_) {}
}

// Portable backups contain user trip data only; restores append new saved trips.
function createTripBackup() {
  const trips = cloneData(loadSavedTrips());
  if (currentPlannerSettings && !currentTripId) {
    trips.push({
      name: currentPlannerSettings.tripName?.trim() || "Current trip draft",
      planner: cloneData(currentPlannerSettings),
      checklist: cloneData(currentChecklist),
      dayPlans: normalizeDayPlans(currentDayPlans, currentPlannerSettings.days),
      archived: false
    });
  }
  return {app:"Camping Classics", formatVersion:1, exportedAt:new Date().toISOString(), trips};
}

function validateTripBackup(payload) {
  if (!payload || payload.app !== "Camping Classics" || payload.formatVersion !== 1 ||
      !Array.isArray(payload.trips) || payload.trips.length > 200) {
    throw new Error("Choose a Camping Classics trip backup (up to 200 trips).");
  }
  const isRecord = value => value && typeof value === "object" && !Array.isArray(value);
  return payload.trips.map(raw => {
    if (!isRecord(raw) || typeof raw.name !== "string" || !raw.name.trim() || raw.name.length > 120 ||
        !isRecord(raw.planner) || !isRecord(raw.checklist)) throw new Error("The backup contains an invalid trip.");
    const src = raw.planner;
    const days = Number(src.days);
    const campers = Number(src.campers);
    if (!Number.isInteger(days) || days < 1 || days > 30 ||
        !Number.isInteger(campers) || campers < 1 || campers > 20) throw new Error("The backup contains an invalid trip length or camper count.");
    const validDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      parseDateOnly(value)?.toISOString().slice(0,10) === value;
    let startDate = src.startDate || "", endDate = src.endDate || "";
    if ((startDate && !validDate(startDate)) || (endDate && !validDate(endDate))) throw new Error("The backup contains an invalid trip date.");
    if (startDate) endDate = datePlusDays(startDate, days - 1);
    else if (endDate) startDate = datePlusDays(endDate, 1 - days);
    const checklist = {};
    let itemCount = 0;
    const entries = Object.entries(raw.checklist);
    if (entries.length > 30) throw new Error("The backup contains too many categories.");
    entries.forEach(([category, items]) => {
      if (!category.trim() || category.length > 80 || ["__proto__","constructor","prototype"].includes(category) || !Array.isArray(items)) {
        throw new Error("The backup contains an invalid checklist category.");
      }
      itemCount += items.length;
      if (itemCount > 1000) throw new Error("A trip in this backup has too many items.");
      checklist[category] = items.map(item => {
        if (!isRecord(item) || typeof item.label !== "string" || !item.label.trim() || item.label.length > 160 ||
            !Number.isInteger(item.quantity) || item.quantity < 0 || item.quantity > 99 || typeof item.checked !== "boolean") {
          throw new Error("The backup contains an invalid checklist item.");
        }
        return createChecklistItem(item.label, item.quantity, item.checked, Boolean(item.custom));
      });
    });
    if (raw.dayPlans != null && (!Array.isArray(raw.dayPlans) || raw.dayPlans.length > 30 || raw.dayPlans.some(day =>
      !isRecord(day) || (day.title != null && (typeof day.title !== "string" || day.title.length > 80)) ||
      (day.notes != null && (typeof day.notes !== "string" || day.notes.length > 1200))))) {
      throw new Error("The backup contains invalid daily notes.");
    }
    return {
      name: raw.name.trim(),
      planner: {tripName:raw.name.trim(),days,campers,startDate,endDate,
        campType:["tent","cabin","rv"].includes(src.campType) ? src.campType : "tent",
        weather:["mild","hot","cold","rain"].includes(src.weather) ? src.weather : "mild",
        activities:Array.isArray(src.activities) ? src.activities.filter(x => ["hiking","fishing","swimming"].includes(x)) : [],
        withKids:Boolean(src.withKids),withPet:Boolean(src.withPet),cookAtCamp:Boolean(src.cookAtCamp),noWater:Boolean(src.noWater)},
      checklist, dayPlans:normalizeDayPlans(raw.dayPlans,days), archived:Boolean(raw.archived)
    };
  });
}

function restoreTripBackupData(payload) {
  const incoming = validateTripBackup(payload);
  const existing = loadSavedTrips();
  const now = Date.now();
  const copies = incoming.map((trip, i) => ({...trip,
    id:`trip-restored-${now}-${i}-${crypto.randomUUID()}`, createdAt:now, updatedAt:now}));
  if (copies.length) writeSavedTrips([...existing,...copies]);
  renderSavedTrips();
  return copies.length;
}

document.getElementById("exportTripBackup").addEventListener("click", () => {
  const status = document.getElementById("tripBackupStatus");
  const backup = createTripBackup();
  if (!backup.trips.length) { status.textContent = "Create or save a trip before downloading a backup."; return; }
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `camping-classics-trips-${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url),10000);
  status.textContent = `Backup download started for ${backup.trips.length} trip${backup.trips.length === 1 ? "" : "s"}. Keep the file to restore your plans later.`;
});
document.getElementById("restoreTripBackup").addEventListener("click", () => document.getElementById("tripBackupFile").click());
document.getElementById("tripBackupFile").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  const status = document.getElementById("tripBackupStatus");
  try {
    if (file.size > 2 * 1024 * 1024) throw new Error("Choose a backup smaller than 2 MB.");
    const payload = JSON.parse(await file.text());
    const trips = validateTripBackup(payload);
    if (!trips.length) {status.textContent = "This backup has no trips to restore.";return;}
    if (!window.confirm(`Add ${trips.length} trip${trips.length === 1 ? "" : "s"} from this backup to Saved Trips? Your current trip and existing saved trips will stay as they are.`)) return;
    const count = restoreTripBackupData(payload);
    status.textContent = `${count} trip${count === 1 ? "" : "s"} restored to Saved Trips. Existing trips were kept.`;
  } catch (error) {
    status.textContent = error instanceof SyntaxError ? "This file is not valid JSON. Choose a Camping Classics backup." :
      error.name === "QuotaExceededError" ? "There is not enough browser storage to restore these trips. Your existing trips were kept." :
      error.message || "Could not restore this backup. Your existing trips were kept.";
  } finally {event.target.value = "";}
});

function refreshDateFields() {
  for (const [button,input] of [["pickStart","startDate"],["pickEnd","endDate"]]) {
    const value=document.getElementById(input).value;
    document.querySelector("#"+button+" strong").textContent=value ? formatDateOnly(value)+" "+value.slice(0,4) : "Choose date";
  }
}
(() => {
  const el=id=>document.getElementById(id), panel=el("rangeCalendar"), days=el("rangeDays");
  let phase,month,start,end,opener;
  const iso=date=>date.toISOString().slice(0,10);
  function draw() {
    el("rangeMonth").textContent=month.toLocaleDateString(undefined,{month:"long",year:"numeric",timeZone:"UTC"});
    el("rangeHint").textContent=phase==="start"?"Choose your arrival day.":"Choose your departure day (up to 30 days).";
    days.replaceChildren();
    for(const w of ["Su","Mo","Tu","We","Th","Fr","Sa"]) {const n=document.createElement("small");n.textContent=w;days.append(n);}
    const count=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
    for(let i=1;i<=count;i++){
      const d=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),i)),key=iso(d),btn=document.createElement("button");
      btn.type="button";btn.textContent=i;btn.dataset.date=key;
      btn.setAttribute("aria-label",d.toLocaleDateString(undefined,{dateStyle:"full",timeZone:"UTC"})+(key===start?", arrival":"")+(key===end?", departure":""));
      if(i===1)btn.style.gridColumnStart=month.getUTCDay()+1;
      btn.disabled=phase==="end"&&(key<start||key>datePlusDays(start,29));
      if(key===start||key===end)btn.className="range-edge";else if(start&&end&&key>start&&key<end)btn.className="in-range";
      days.append(btn);
    }
  }
  function close(focus=true){panel.hidden=true;for(const id of ["pickStart","pickEnd"])el(id).setAttribute("aria-expanded","false");if(focus)opener?.focus({preventScroll:true});}
  function open(id){
    opener=el(id); start=plannerStartInput.value;end=plannerEndInput.value;phase=id==="pickEnd"&&start?"end":"start";
    const now=new Date();month=parseDateOnly((phase==="end"?end:start)||start)||new Date(Date.UTC(now.getFullYear(),now.getMonth(),1));month.setUTCDate(1);
    panel.hidden=false;for(const k of ["pickStart","pickEnd"])el(k).setAttribute("aria-expanded",String(k===id));draw();
    (days.querySelector(".range-edge:not(:disabled)")||days.querySelector("button:not(:disabled)"))?.focus({preventScroll:true});
  }
  for(const id of ["pickStart","pickEnd"])el(id).onclick=()=>open(id);
  for(const [id,delta] of [["prevMonth",-1],["nextMonth",1]])el(id).onclick=()=>{month.setUTCMonth(month.getUTCMonth()+delta);draw();};
  days.onclick=event=>{const key=event.target.dataset.date;if(!key)return;
    if(phase==="start"){start=key;end="";phase="end";draw();days.querySelector(".range-edge")?.focus({preventScroll:true});return;}
    plannerStartInput.value=start;plannerEndInput.value=key;
    syncPlannerDates("range");updatePlannerPreview();close();
  };
  function previewEnd(key) {
    if(phase!=="end")return;
    for(const btn of days.querySelectorAll("[data-date]"))btn.classList.toggle("range-preview",!!key&&btn.dataset.date>start&&btn.dataset.date<=key);
  }
  days.addEventListener("pointerover",e=>previewEnd(e.target.disabled?"":e.target.dataset.date));
  days.addEventListener("focusin",e=>previewEnd(e.target.dataset.date));
  days.addEventListener("pointerleave",()=>previewEnd(""));
  el("clearDates").onclick=()=>{plannerStartInput.value="";plannerEndInput.value="";syncPlannerDates("startDate");updatePlannerPreview();close();};
  el("cancelDates").onclick=()=>close();el("rangePicker").addEventListener("keydown",e=>{if(!panel.hidden&&e.key==="Escape"){e.stopPropagation();close();}});
  document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!el("rangePicker").contains(e.target))close(false);});
})();
function packSuggested(checklist,suggestions) {
  let changed=0;
  for(const [category,items] of Object.entries(checklist)){
    const amounts=new Map((Object.hasOwn(suggestions,category)?suggestions[category]:[]).map(s=>[s.label,s.quantity]));
    for(const item of items){if(!amounts.has(item.label))continue;
      if(!item.checked||!item.quantity)changed++;
      item.quantity=clampQuantity(item.quantity||amounts.get(item.label));item.checked=item.quantity>0;
    }
  }
  return changed;
}
document.getElementById("autoPack").addEventListener("click",()=>{
  const count=packSuggested(currentChecklist,buildPackingSuggestions(collectPlannerSettings()));
  renderChecklist();renderSavedTrips();
  document.getElementById("autoPackStatus").textContent=count?count+" suggested item"+(count===1?"":"s")+" marked as packed.":"No additional suggested items to pack.";
});

function animateSectionArrival(section) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  section.animate([{opacity: 0.68, transform: "translateY(5px)"}, {opacity: 1, transform: "none"}],
    {duration: 220, easing: "ease-out"});
}

function showChecklistSection() {
  const section = document.getElementById("checklist");
  section.scrollIntoView({behavior: "instant", block: "start"});
  animateSectionArrival(section);
}

// Let the browser handle anchor focus, URL history and modifier keys.
document.addEventListener("click", event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const section = document.getElementById(link.hash.slice(1));
  if (section) requestAnimationFrame(() => animateSectionArrival(section));
});
