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
const customItemQuantity = document.getElementById("customItemQuantity");
const saveTripBtn = document.getElementById("saveTripBtn");
const saveTripStatus = document.getElementById("saveTripStatus");
const savedTripsList = document.getElementById("savedTripsList");
const feedbackButton = document.getElementById("feedbackButton");
const feedbackModal = document.getElementById("feedbackModal");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackArea = document.getElementById("feedbackArea");
const feedbackStatus = document.getElementById("feedbackStatus");
const closeFeedbackModal = document.getElementById("closeFeedbackModal");

const sharedTripModal = document.getElementById("sharedTripModal");
const sharedTripTitle = document.getElementById("sharedTripTitle");
const sharedTripDescription = document.getElementById("sharedTripDescription");
const sharedTripPreview = document.getElementById("sharedTripPreview");
const importSharedTrip = document.getElementById("importSharedTrip");
const dismissSharedTrip = document.getElementById("dismissSharedTrip");
const closeSharedTripModal = document.getElementById("closeSharedTripModal");


const expandAllSections = document.getElementById("expandAllSections");
const collapseAllSections = document.getElementById("collapseAllSections");
const clearQuantities = document.getElementById("clearQuantities");
const tripSummaryCard = document.getElementById("tripSummaryCard");
const tripSummaryName = document.getElementById("tripSummaryName");
const tripSummaryDetails = document.getElementById("tripSummaryDetails");
const customItemStatus = document.getElementById("customItemStatus");

const CURRENT_CHECKLIST_KEY = "camping-classics-current-checklist-v20";
const CURRENT_PLANNER_KEY = "camping-classics-current-planner-v20";
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
  const normalized = {};

  if (!checklist || typeof checklist !== "object") {
    return cloneData(defaultChecklist);
  }

  Object.entries(checklist).forEach(([category, items]) => {
    if (!Array.isArray(items)) return;

    normalized[category] = items.map((item) => {
      if (typeof item === "string") {
        return createChecklistItem(item);
      }

      return createChecklistItem(
        item.label ?? item.name ?? "Checklist item",
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
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveCurrentState() {
  localStorage.setItem(CURRENT_CHECKLIST_KEY, JSON.stringify(currentChecklist));

  if (currentPlannerSettings) {
    localStorage.setItem(CURRENT_PLANNER_KEY, JSON.stringify(currentPlannerSettings));
  }

  if (currentTripId) {
    localStorage.setItem(ACTIVE_TRIP_KEY, currentTripId);
    persistActiveTrip();
  } else {
    localStorage.removeItem(ACTIVE_TRIP_KEY);
  }
}

let currentChecklist = loadCurrentChecklist();
let currentPlannerSettings = loadCurrentPlanner();
let currentTripId = localStorage.getItem(ACTIVE_TRIP_KEY) || null;

function getAllChecklistItems() {
  return Object.values(currentChecklist).flat();
}

function updatePlannerPreview() {
  const items = getAllChecklistItems();

  plannerList.innerHTML = items
    .map((item) => `<li>${escapeChecklistText(item.label)} <strong>×${item.quantity}</strong></li>`)
    .join("");
}

function checklistProgressStats(checklist = currentChecklist) {
  const items = Object.values(normalizeChecklist(checklist)).flat();

  const selectedItems = items.filter((item) => item.checked);
  const packedItems = selectedItems.filter(
    (item) => clampQuantity(item.quantity) > 0
  );

  const total = selectedItems.length;
  const checked = packedItems.length;
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

                  <span
                    class="quantity-value"
                    aria-label="${escapeChecklistText(item.label)} quantity"
                  >${item.quantity}</span>

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

      if (target.item.quantity > 0) {
        target.item.checked = true;
      }

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
      saveCurrentState();
      updateProgress();
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

      currentChecklist[target.category].splice(target.itemIndex, 1);

      if (currentChecklist[target.category].length === 0) {
        delete currentChecklist[target.category];
      }

      renderChecklist();
      updatePlannerPreview();
      renderSavedTrips();
    });
  });
}

function plannerItem(label, quantity = 0) {
  return createChecklistItem(label, 0);
}

function addPlannerItem(checklist, category, label, quantity = 0) {
  if (!checklist[category]) checklist[category] = [];

  const existing = checklist[category].find((item) => item.label === label);

  if (!existing) {
    checklist[category].push(plannerItem(label, 0));
  }
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

function tripDateLabel(settings) {
  if (settings?.startDate && settings?.endDate) {
    return `${formatDateOnly(settings.startDate)} – ${formatDateOnly(settings.endDate)}`;
  }

  if (settings?.startDate) {
    return `Starts ${formatDateOnly(settings.startDate)}`;
  }

  return `${settings?.days || "?"} day${settings?.days === 1 ? "" : "s"}`;
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
    <span>${settings.campers || "?"} camper${settings.campers === 1 ? "" : "s"}</span>
    <span>${escapeChecklistText(tripDateLabel(settings))}</span>
    <span>${escapeChecklistText(campTypeLabel(settings.campType))}</span>
    <span>${escapeChecklistText(activityText)}</span>
  `;

  tripSummaryCard.hidden = false;
}


tripForm.addEventListener("submit", (event) => {
  event.preventDefault();

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

  const generated = {
    "Shelter & Sleep": [],
    "Food & Water": [],
    "Clothing": [],
    "Safety & Essentials": []
  };

  if (campType === "tent") {
    addPlannerItem(generated, "Shelter & Sleep", "Tent with stakes", Math.max(1, Math.ceil(campers / 4)));
    addPlannerItem(generated, "Shelter & Sleep", "Sleeping bag", campers);
    addPlannerItem(generated, "Shelter & Sleep", "Sleeping pad", campers);
    addPlannerItem(generated, "Shelter & Sleep", "Pillow", campers);
  } else if (campType === "cabin") {
    addPlannerItem(generated, "Shelter & Sleep", "Bedding or sleeping bag", campers);
    addPlannerItem(generated, "Shelter & Sleep", "Pillow", campers);
    addPlannerItem(generated, "Shelter & Sleep", "Indoor shoes or slippers", campers);
  } else {
    addPlannerItem(generated, "Shelter & Sleep", "RV hookup supplies", 1);
    addPlannerItem(generated, "Shelter & Sleep", "Bedding", campers);
    addPlannerItem(generated, "Shelter & Sleep", "Pillow", campers);
  }

  addPlannerItem(generated, "Food & Water", "Meals", campers * days * 3);
  addPlannerItem(generated, "Food & Water", "Snack servings", campers * days * 2);
  addPlannerItem(generated, "Food & Water", "Drinking water servings", campers * days * 2);
  addPlannerItem(generated, "Food & Water", "Cooler", Math.max(1, Math.ceil(campers / 4)));
  addPlannerItem(generated, "Food & Water", "Plates and utensil sets", campers);

  addPlannerItem(generated, "Clothing", "Comfortable shoe pairs", campers);
  addPlannerItem(generated, "Clothing", "Extra sock pairs", campers * Math.max(1, days));

  addPlannerItem(generated, "Safety & Essentials", "Flashlight or headlamp", campers);
  addPlannerItem(generated, "Safety & Essentials", "First-aid kit", 1);
  addPlannerItem(generated, "Safety & Essentials", "Trash bags", Math.max(2, days));
  addPlannerItem(generated, "Safety & Essentials", "Phone charger or power bank", Math.max(1, Math.ceil(campers / 2)));

  if (weather === "rain") {
    addPlannerItem(generated, "Clothing", "Rain jacket", campers);
    addPlannerItem(generated, "Clothing", "Extra sock pairs", campers * Math.max(2, days));
    addPlannerItem(generated, "Safety & Essentials", "Waterproof bag for clothes", Math.max(1, campers));
    addPlannerItem(generated, "Shelter & Sleep", "Extra tarp", 1);
  } else if (weather === "cold") {
    addPlannerItem(generated, "Clothing", "Warm layers", campers);
    addPlannerItem(generated, "Clothing", "Hat and glove sets", campers);
    addPlannerItem(generated, "Shelter & Sleep", "Extra blanket", campers);
  } else if (weather === "hot") {
    addPlannerItem(generated, "Clothing", "Lightweight clothing sets", campers);
    addPlannerItem(generated, "Clothing", "Sun hat", campers);
    addPlannerItem(generated, "Food & Water", "Extra drinking water servings", campers * days);
  } else {
    addPlannerItem(generated, "Clothing", "Light jacket", campers);
  }

  if (activities.includes("hiking")) {
    addPlannerItem(generated, "Activities", "Daypack", campers);
    addPlannerItem(generated, "Activities", "Trail map or offline map", 1);
    addPlannerItem(generated, "Activities", "Hiking water bottle", campers);
  }

  if (activities.includes("fishing")) {
    addPlannerItem(generated, "Activities", "Fishing gear set", 1);
    addPlannerItem(generated, "Activities", "Tackle box", 1);
  }

  if (activities.includes("swimming")) {
    addPlannerItem(generated, "Activities", "Swimsuit", campers);
    addPlannerItem(generated, "Activities", "Towel", campers);
    addPlannerItem(generated, "Activities", "Water shoes", campers);
  }

  if (withKids) {
    addPlannerItem(generated, "Extras", "Kid activities or games", 1);
    addPlannerItem(generated, "Extras", "Extra kid clothing sets", 2);
  }

  if (withPet) {
    addPlannerItem(generated, "Food & Water", "Pet food servings", days * 2);
    addPlannerItem(generated, "Food & Water", "Pet water servings", days * 2);
    addPlannerItem(generated, "Extras", "Pet leash", 1);
    addPlannerItem(generated, "Extras", "Pet waste bags", Math.max(2, days * 2));
  }

  if (cookAtCamp) {
    addPlannerItem(generated, "Food & Water", "Camp stove or approved cooking setup", 1);
    addPlannerItem(generated, "Food & Water", "Cooking utensil set", 1);
    addPlannerItem(generated, "Food & Water", "Food storage containers", Math.max(1, days));
  }

  if (noWater) {
    addPlannerItem(generated, "Food & Water", "Extra water supply servings", campers * days * 2);
  }

  currentChecklist = normalizeChecklist(generated);

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
  updatePlannerPreview();

  const displayName = tripName || "Your trip";
  plannerSummary.textContent =
    `${displayName}: checklist created for ${campers} camper${campers === 1 ? "" : "s"} over ${currentPlannerSettings.days} day${currentPlannerSettings.days === 1 ? "" : "s"}. Set the quantities you plan to bring below.`;

  saveTripStatus.textContent = "";
  document.getElementById("checklist").scrollIntoView({ behavior: "smooth", block: "start" });
});

customItemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const label = customItemName.value.trim();
  if (!label) return;

  const category = customItemCategory.value || "Extras";
  const quantity = clampQuantity(customItemQuantity.value);

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
    createChecklistItem(label, quantity, true, true)
  );

  customItemName.value = "";
  customItemQuantity.value = "0";
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

if (clearQuantities) {
  clearQuantities.addEventListener("click", () => {
    Object.values(currentChecklist).flat().forEach((item) => {
      item.quantity = 0;
      item.checked = false;
    });

    renderChecklist();
    updatePlannerPreview();
    renderSavedTrips();
    saveTripStatus.textContent = "All checklist quantities set to 0.";
    trackEvent("clear_checklist_quantities");
  });
}

resetChecklist.addEventListener("click", () => {
  currentChecklist = cloneData(defaultChecklist);
  currentPlannerSettings = null;
  currentTripId = null;

  localStorage.removeItem(CURRENT_CHECKLIST_KEY);
  localStorage.removeItem(ACTIVE_TRIP_KEY);
  localStorage.removeItem(CURRENT_PLANNER_KEY);

  renderChecklist();
  updatePlannerPreview();

  plannerSummary.textContent = "Fill out the planner and generate your list.";

  if (customItemStatus) customItemStatus.textContent = "";
  updateTripSummary();
  saveTripStatus.textContent = "Checklist reset.";
});

function loadSavedTrips() {
  try {
    const saved = localStorage.getItem(SAVED_TRIPS_KEY);
    return saved ? JSON.parse(saved) : [];
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
    checklist: normalizeChecklist(trip.checklist)
  };

  const url = new URL(window.location.href);
  url.hash = `sharedTrip=${encodeSharePayload(payload)}`;

  return url.toString();
}

async function shareSavedTrip(trip) {
  const url = createTripShareUrl(trip);
  const shareData = {
    title: `Camping Classics — ${trip.name}`,
    text: `Here is my Camping Classics trip: ${trip.name}`,
    url
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      trackEvent("share_trip", { method: "native_share" });
      return "Trip shared.";
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      trackEvent("share_trip", { method: "copy_link" });
      return "Share link copied.";
    }

    window.prompt("Copy this trip link:", url);
    trackEvent("share_trip", { method: "copy_prompt" });
    return "Share link ready.";
  } catch (error) {
    if (error?.name === "AbortError") {
      return "";
    }

    window.prompt("Copy this trip link:", url);
    return "Share link ready.";
  }
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

let pendingSharedTrip = null;

function showSharedTripImport(payload) {
  if (!payload || typeof payload !== "object") return;

  const checklist = normalizeChecklist(payload.checklist || {});
  const settings = payload.planner || {};
  const stats = checklistProgressStats(checklist);
  const name = String(payload.name || settings.tripName || "Shared Camping Trip").slice(0, 120);

  pendingSharedTrip = {
    name,
    planner: {
      ...settings,
      tripName: name
    },
    checklist
  };

  sharedTripTitle.textContent = name;
  sharedTripDescription.textContent = "Someone shared this Camping Classics trip with you.";
  sharedTripPreview.innerHTML = `
    <div class="shared-trip-preview-icon" aria-hidden="true">${tripTypeIcon(settings.campType)}</div>
    <div>
      <strong>${escapeChecklistText(name)}</strong>
      <p>
        ${settings.campers || "?"} camper${settings.campers === 1 ? "" : "s"}
        · ${escapeChecklistText(tripDateLabel(settings))}
        · ${escapeChecklistText(campTypeLabel(settings.campType))}
      </p>
      <span>${stats.checked} of ${stats.total} packed</span>
    </div>
  `;

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
          <span>${settings.campers || "?"} camper${settings.campers === 1 ? "" : "s"}</span>
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
          <button class="btn primary open-saved-trip" type="button" data-trip-id="${trip.id}">Open Trip</button>
          <button class="btn secondary share-saved-trip" type="button" data-trip-id="${trip.id}">Share</button>
          <button class="btn secondary duplicate-saved-trip" type="button" data-trip-id="${trip.id}">Duplicate</button>
          <button class="btn secondary rename-saved-trip" type="button" data-trip-id="${trip.id}">Rename</button>
          ${
            archived
              ? `<button class="btn secondary restore-saved-trip" type="button" data-trip-id="${trip.id}">Restore</button>`
              : canArchive
                ? `<button class="btn secondary archive-saved-trip" type="button" data-trip-id="${trip.id}">Archive</button>`
                : ""
          }
          <button class="btn secondary delete-saved-trip" type="button" data-trip-id="${trip.id}">Delete</button>
        </div>

        <p class="saved-trip-action-status" data-status-for="${trip.id}" aria-live="polite"></p>
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

      populatePlannerForm(currentPlannerSettings);
      renderChecklist();
      updatePlannerPreview();
      updateTripSummary();

      plannerSummary.textContent =
        `${trip.name} loaded. Changes to this saved trip are preserved as you edit it.`;

      saveTripStatus.textContent = `Loaded "${trip.name}".`;
      trackEvent("open_saved_trip");
      document.getElementById("checklist").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  savedTripsList.querySelectorAll(".share-saved-trip").forEach((button) => {
    button.addEventListener("click", async () => {
      const trip = loadSavedTrips().find((savedTrip) => savedTrip.id === button.dataset.tripId);
      if (!trip) return;

      const message = await shareSavedTrip(trip);
      const status = savedTripsList.querySelector(`[data-status-for="${trip.id}"]`);

      if (status && message) {
        status.textContent = message;
      }
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
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    trips.push(importedTrip);
    writeSavedTrips(trips);

    currentTripId = importedTrip.id;
    currentPlannerSettings = cloneData(importedTrip.planner);
    currentChecklist = normalizeChecklist(importedTrip.checklist);

    localStorage.setItem(ACTIVE_TRIP_KEY, currentTripId);
    saveCurrentState();

    populatePlannerForm(currentPlannerSettings);
    renderChecklist();
    updatePlannerPreview();
    updateTripSummary();
    renderSavedTrips();

    closeSiteModal(sharedTripModal);
    pendingSharedTrip = null;
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);

    trackEvent("import_shared_trip");
    saveTripStatus.textContent = `Shared trip "${importedTrip.name}" saved.`;
    document.getElementById("checklist").scrollIntoView({ behavior: "smooth", block: "start" });
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

if (feedbackForm) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const useful = new FormData(feedbackForm).get("feedbackUseful");
    const area = feedbackArea.value;

    if (!useful || !area) return;

    trackEvent("feedback_submit", {
      useful: String(useful),
      improvement_area: area
    });

    feedbackStatus.textContent = "Thanks — your feedback was sent.";
    feedbackForm.reset();

    window.setTimeout(() => {
      closeSiteModal(feedbackModal);
    }, 900);
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
});


if (currentPlannerSettings) {
  populatePlannerForm(currentPlannerSettings);
}

if (currentTripId && !loadSavedTrips().some((trip) => trip.id === currentTripId)) {
  currentTripId = null;
  localStorage.removeItem(ACTIVE_TRIP_KEY);
}

renderChecklist();
updatePlannerPreview();
updateTripSummary();
renderSavedTrips();
attachStaticCollapsibleControls();
checkForSharedTripLink();

const useLocationBtn = document.getElementById("useLocationBtn");
const campSearchForm = document.getElementById("campSearchForm");
const campSearchInput = document.getElementById("campSearchInput");
const finderStatus = document.getElementById("finderStatus");
const campResults = document.getElementById("campResults");
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
      ["name"]
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
    ""
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

  window.setTimeout(() => {
    campResults.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

async function findNearbyCamps(lat, lon, label, waitBeforeSearch = false) {
  lastCampSearch = { lat, lon, label, waitBeforeSearch };
  trackEvent("camp_search");
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
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  finderStatus.textContent =
    camps.length > 0
      ? `Showing the 5 closest campground listings found within about 40 miles of ${label}.`
      : `No named campground listings were found within about 40 miles of ${label}.`;

  renderCampList(camps, label);
}

if (campSearchForm && campSearchInput && finderStatus) {
  campSearchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const locationText = campSearchInput.value.trim();

    if (!locationText) {
      finderStatus.textContent = "Enter a city or ZIP code first.";
      campSearchInput.focus();
      return;
    }

    finderStatus.textContent = `Finding ${locationText}...`;

    try {
      const place = await geocodeLocation(locationText);

      // Keep the visible label concise instead of printing the entire geocoder result.
      await findNearbyCamps(place.lat, place.lon, place.label, place.usedNominatim === true);
    } catch (error) {
      finderStatus.textContent =
        error.message || "Could not search that location.";
      campResults.hidden = true;
    }
  });
}

if (useLocationBtn && finderStatus) {
  useLocationBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      finderStatus.textContent =
        "Location access is not supported in this browser. Try the city or ZIP search instead.";
      return;
    }

    finderStatus.textContent = "Waiting for location permission...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await findNearbyCamps(
          position.coords.latitude,
          position.coords.longitude,
          "your current location",
          false
        );
      },
      () => {
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


const toggleGamesBtn = document.getElementById("toggleGamesBtn");
const extraGames = [...document.querySelectorAll(".extra-game")];

if (toggleGamesBtn && extraGames.length > 0) {
  toggleGamesBtn.addEventListener("click", () => {
    const isExpanded = toggleGamesBtn.getAttribute("aria-expanded") === "true";
    const newExpanded = !isExpanded;

    extraGames.forEach((card) => {
      card.hidden = !newExpanded;
    });

    toggleGamesBtn.setAttribute("aria-expanded", String(newExpanded));
    toggleGamesBtn.textContent = newExpanded
      ? "Show Fewer Games"
      : "Show 6 More Games";
    trackEvent(newExpanded ? "games_expand" : "games_collapse");
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
