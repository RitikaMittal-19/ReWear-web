// ============================================================
// add-item.js — Wires the "List Your Item" form to the backend
// Add to add-item.html AFTER api.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Redirect if not logged in
  if (!Api.isLoggedIn()) {
    Api.showError("Please log in to list an item.");
    setTimeout(() => (window.location.href = "/Re-Wear-website/index.html"), 2000);
    return;
  }

  setupPhotoUpload();
  setupTagInput();
  setupForm();
});

// ── Photo Preview ─────────────────────────────────────────────
let selectedFiles = [];

function setupPhotoUpload() {
  const addPhotoBtn = document.querySelector("[data-add-photo], .add-photo-btn");
  const photoGrid = document.querySelector("[data-photo-grid], .photo-grid");

  // Create a hidden file input if not already present
  let fileInput = document.getElementById("rw-file-input");
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "rw-file-input";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
  }

  if (addPhotoBtn) {
    addPhotoBtn.addEventListener("click", () => fileInput.click());
  }

  fileInput.addEventListener("change", () => {
    const newFiles = Array.from(fileInput.files);
    const totalAllowed = 5 - selectedFiles.length;
    const toAdd = newFiles.slice(0, totalAllowed);

    if (newFiles.length > totalAllowed) {
      Api.showError(`You can only add up to 5 photos. ${totalAllowed} slot(s) remaining.`);
    }

    selectedFiles = [...selectedFiles, ...toAdd];
    renderPhotoPreviews();
    fileInput.value = ""; // reset so same file can be re-added
  });
}

function renderPhotoPreviews() {
  const photoGrid = document.querySelector("[data-photo-grid], .photo-grid");
  if (!photoGrid) return;

  // Keep the "Add Photo" button, remove old previews
  const addBtn = photoGrid.querySelector("[data-add-photo], .add-photo-btn");
  photoGrid.innerHTML = "";
  if (addBtn) photoGrid.appendChild(addBtn);

  selectedFiles.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:relative;width:100px;height:100px;border-radius:8px;overflow:hidden;flex-shrink:0";

    wrapper.innerHTML = `
      <img src="${url}" style="width:100%;height:100%;object-fit:cover">
      <button onclick="removePhoto(${index})"
        style="position:absolute;top:4px;right:4px;width:22px;height:22px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center">
        ✕
      </button>
      ${index === 0 ? '<span style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,.6);color:#fff;font-size:10px;padding:2px 6px;border-radius:4px">Cover</span>' : ""}
    `;
    photoGrid.insertBefore(wrapper, addBtn || null);
  });

  // Update Add Photo button visibility
  const addPhotoBtn = document.querySelector("[data-add-photo], .add-photo-btn");
  if (addPhotoBtn) {
    addPhotoBtn.style.display = selectedFiles.length >= 5 ? "none" : "";
  }
}

window.removePhoto = (index) => {
  selectedFiles.splice(index, 1);
  renderPhotoPreviews();
};

// ── Tag Input ─────────────────────────────────────────────────
let tags = [];

function setupTagInput() {
  const tagInput = document.querySelector("[data-tag-input], .tag-input");
  const tagContainer = document.querySelector("[data-tag-container], .tags-container");

  if (!tagInput) return;

  tagInput.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.value.trim()) {
      e.preventDefault();
      const tag = tagInput.value.trim().toLowerCase().replace(/,/g, "");
      if (tag && !tags.includes(tag) && tags.length < 10) {
        tags.push(tag);
        renderTags();
        tagInput.value = "";
      }
    }
  });
}

function renderTags() {
  const tagContainer = document.querySelector("[data-tag-container], .tags-container, [data-tags-display]");
  if (!tagContainer) return;

  tagContainer.innerHTML = tags.map((tag, i) => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:#f3f4f6;padding:4px 10px;border-radius:20px;font-size:13px;margin:4px 2px">
      #${tag}
      <button onclick="removeTag(${i})" style="border:none;background:none;cursor:pointer;font-size:12px;opacity:.6;line-height:1">✕</button>
    </span>
  `).join("");
}

window.removeTag = (index) => {
  tags.splice(index, 1);
  renderTags();
};

// ── Main Form Submission ──────────────────────────────────────
function setupForm() {
  const form = document.querySelector("[data-add-item-form], #addItemForm, form");
  if (!form) return;

  // Points suggestion based on condition
  const conditionSelect = form.querySelector("select[name='condition'], select");
  const pointsInput = form.querySelector("input[name='points'], input[type='number']");
  const suggestedEl = document.querySelector("[data-points-suggestion]");

  const conditionPoints = { "LIKE_NEW": "80-120", "EXCELLENT": "50-80", "GOOD": "30-50", "FAIR": "10-30" };

  if (conditionSelect && pointsInput) {
    conditionSelect.addEventListener("change", () => {
      const val = conditionSelect.value.toUpperCase().replace(/ /g, "_");
      if (suggestedEl && conditionPoints[val]) {
        suggestedEl.textContent = `Suggested: ${conditionPoints[val]} points`;
      }
    });
  }

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      return Api.showError("Please add at least one photo.");
    }

    const title = form.querySelector("input[name='title'], input[placeholder*='specific']")?.value.trim();
    const description = form.querySelector("textarea[name='description'], textarea")?.value.trim();
    const category = form.querySelector("select[name='category']")?.value;
    const size = form.querySelector("select[name='size']")?.value;
    const condition = form.querySelector("select[name='condition']")?.value;
    const points = form.querySelector("input[name='points'], input[type='number']")?.value;
    const brand = form.querySelector("input[name='brand']")?.value.trim();
    const exchangeType = form.querySelector("select[name='exchangeType']")?.value || "POINTS_ONLY";
    const tradePrefs = form.querySelector("textarea[name='tradePrefs'], input[name='tradePrefs']")?.value.trim();

    if (!title) return Api.showError("Item title is required.");
    if (!description) return Api.showError("Description is required.");
    if (!category || category === "Select Category") return Api.showError("Please select a category.");
    if (!size || size === "Select Size") return Api.showError("Please select a size.");
    if (!condition || condition === "Select Condition") return Api.showError("Please select a condition.");
    if (!points || isNaN(points)) return Api.showError("Please enter a valid points value.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("brand", brand || "");
    formData.append("category", category.toUpperCase().replace(/ /g, "_"));
    formData.append("size", size.toUpperCase());
    formData.append("condition", condition.toUpperCase().replace(/ /g, "_"));
    formData.append("points", points);
    let exchangeTypeMapped = "POINTS_ONLY";

    const rawType = form.querySelector("select[name='exchangeType']")?.value;

    if (rawType === "points") exchangeTypeMapped = "POINTS_ONLY";
    else if (rawType === "trade") exchangeTypeMapped = "DIRECT_TRADE";
    else if (rawType === "both") exchangeTypeMapped = "POINTS_OR_TRADE";

formData.append("exchangeType", exchangeTypeMapped);
    formData.append("tradePrefs", tradePrefs || "");

    tags.forEach((tag) => formData.append("tags", tag));
    selectedFiles.forEach((file) => formData.append("images", file));

    const submitBtn = form.querySelector("button[type='submit'], [data-submit-btn]");
    const draftBtn = form.querySelector("[data-draft-btn]");

    try {
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Listing..."; }
      if (draftBtn) draftBtn.disabled = true;

      const data = await Api.items.create(formData);
      Api.showToast("Item listed successfully! 🎉");
      setTimeout(() => (window.location.href = "/Re-Wear-website/dashboard.html"), 1000);
    } catch (err) {
      Api.showError(err.message || "Failed to list item. Please try again.");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "List Item"; }
      if (draftBtn) draftBtn.disabled = false;
    }
  });

  // Save Draft (no-op for now — just shows a toast)
  const draftBtn = form.querySelector("[data-draft-btn], button:not([type='submit'])");
  if (draftBtn && draftBtn.textContent.toLowerCase().includes("draft")) {
    draftBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Api.showToast("Draft saved locally. (Full draft support coming in V2)", "info");
    });
  }
}
