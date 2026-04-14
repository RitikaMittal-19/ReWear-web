// ============================================================
// items.js — Replaces hardcoded featured items on index.html
// with real items from the API. Add to index.html AFTER api.js
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadFeaturedItems();
  setupCategoryFilters();
  setupSearch();
});

// ── Load Featured Items ───────────────────────────────────────
async function loadFeaturedItems(params = {}) {
  const container = document.querySelector("[data-featured-items]");
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:40px;opacity:.5;grid-column:1/-1">Loading items...</div>`;

  try {
    const { items } = await Api.items.getAll({ limit: 8, ...params });

    if (items.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:40px;opacity:.5;grid-column:1/-1">No items found.</div>`;
      return;
    }

    container.innerHTML = items.map((item) => buildItemCard(item)).join("");

    // Attach wishlist + request handlers
    container.querySelectorAll("[data-wishlist-btn]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!Api.isLoggedIn()) {
          Api.showError("Please log in to save items to your wishlist.");
          return;
        }
        const itemId = btn.dataset.wishlistBtn;
        try {
          await Api.wishlist.add(itemId);
          btn.textContent = "♥";
          btn.style.color = "#dc2626";
          Api.showToast("Added to wishlist!");
        } catch (err) {
          Api.showError(err.message);
        }
      });
    });

    container.querySelectorAll("[data-request-btn]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (!Api.isLoggedIn()) {
          Api.showError("Please log in to request this item.");
          return;
        }
        const itemId = btn.dataset.requestBtn;
        const note = prompt("Add a note to the seller (optional):");
        try {
          btn.disabled = true;
          btn.textContent = "Requesting...";
          await Api.orders.request(Number(itemId), note);
          Api.showToast("Exchange request sent! The seller will review it. 🎉");
          btn.textContent = "Requested ✓";
        } catch (err) {
          Api.showError(err.message);
          btn.disabled = false;
          btn.textContent = "Request Item";
        }
      });
    });

  } catch (err) {
    console.error("Items load error:", err);
    container.innerHTML = `<div style="text-align:center;padding:40px;color:#dc2626;grid-column:1/-1">Failed to load items. Please refresh.</div>`;
  }
}

// ── Build Item Card HTML ──────────────────────────────────────
function buildItemCard(item) {
  const image = item.images?.[0] || "/Re-Wear-website/images/item1.jpg";
  const sellerName = item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : "Community Member";

  return `
    <div class="item-card" style="border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;background:#fff;transition:transform .2s,box-shadow .2s;cursor:pointer"
      onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 30px rgba(0,0,0,.12)'"
      onmouseleave="this.style.transform='';this.style.boxShadow=''">
      <div style="position:relative">
        <img src="${image}" alt="${item.title}"
          style="width:100%;height:220px;object-fit:cover"
          onerror="this.src='/Re-Wear-website/images/item1.jpg'">
        <button data-wishlist-btn="${item.id}"
          style="position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.9);border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)">
          ♡
        </button>
        <span style="position:absolute;top:12px;left:12px;background:rgba(0,0,0,.6);color:#fff;font-size:11px;padding:3px 10px;border-radius:20px">
          ${item.condition.replace(/_/g, " ")}
        </span>
      </div>
      <div style="padding:16px">
        <h4 style="margin:0 0 4px;font-size:15px;font-weight:600">${item.title}</h4>
        <p style="margin:0 0 4px;font-size:13px;opacity:.5">${item.brand || "No brand"} · Size ${item.size}</p>
        <p style="margin:0 0 12px;font-size:12px;opacity:.45">by ${sellerName}</p>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-weight:700;font-size:16px;color:var(--primary,#4f46e5)">${item.points} pts</span>
          <button data-request-btn="${item.id}"
            style="padding:7px 16px;background:var(--primary,#4f46e5);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;transition:opacity .2s"
            onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">
            Request Item
          </button>
        </div>
      </div>
    </div>`;
}

// ── Category Filter Buttons ───────────────────────────────────
function setupCategoryFilters() {
  // Your HTML has category buttons in "Shop by Category" section
  // We add data-category attributes via JS since HTML is static
  const categoryMap = {
    "Men": "TOPS",
    "Women": "DRESSES",
    "Kids": "KIDS",
    "Ethnic": "ETHNIC",
    "Winterwear": "WINTERWEAR",
    "Accessories": "ACCESSORIES",
  };

  document.querySelectorAll("[data-category-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.categoryFilter;
      document.querySelectorAll("[data-category-filter]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (category === "all") {
        loadFeaturedItems();
      } else {
        loadFeaturedItems({ category });
      }
    });
  });
}

// ── Search ────────────────────────────────────────────────────
function setupSearch() {
  const searchInput = document.querySelector("[data-search-input]");
  const searchBtn = document.querySelector("[data-search-btn]");

  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      loadFeaturedItems(q ? { search: q } : {});
    }, 400);
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const q = searchInput.value.trim();
      loadFeaturedItems(q ? { search: q } : {});
    });
  }
}
