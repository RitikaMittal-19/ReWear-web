// ============================================================
// dashboard.js — Replaces hardcoded "Sarah M." data with
// real API data. Add to dashboard.html AFTER api.js
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  // Redirect if not logged in
  if (!Api.isLoggedIn()) {
    Api.showError("Please log in to view your dashboard.");
    setTimeout(() => (window.location.href = "/Re-Wear-website/index.html"), 1000);
    return;
  }

  try {
    // Load user + orders + wishlist in parallel
    const [meData, ordersData, wishlistData, myItemsData] = await Promise.all([
      Api.auth.me(),
      Api.orders.getMine(),
      Api.wishlist.get(),
      Api.items.getMine(),
    ]);

    const user = meData.user;
    const { buying, selling } = ordersData;
    const wishlist = wishlistData.wishlist;
    const myItems = myItemsData.items;

    // ── Profile Header ──────────────────────────────────────
    setTextContent("[data-user-fullname]", `${user.firstName} ${user.lastName}`);
    setTextContent("[data-user-points]", user.points);
    setTextContent("[data-user-rating]", user.rating ? user.rating.toFixed(1) : "New");
    setTextContent("[data-user-items-count]", myItems.length);
    setTextContent("[data-user-exchanges-count]",
      buying.filter((o) => o.status === "COMPLETED").length +
      selling.filter((o) => o.status === "COMPLETED").length
    );

    if (user.avatar) {
      document.querySelectorAll("[data-user-avatar]").forEach((img) => {
        img.src = user.avatar;
        img.alt = user.firstName;
      });
    }

    // Member since
    const memberEl = document.querySelector("[data-member-since]");
    if (memberEl) {
      const date = new Date(user.createdAt);
      memberEl.textContent = `Member since ${date.toLocaleString("default", { month: "long", year: "numeric" })} • ${user.rating ? user.rating.toFixed(1) : "New"} ⭐ rating`;
    }

    // ── My Items Tab ────────────────────────────────────────
    const itemsContainer = document.querySelector("[data-my-items]");
    if (itemsContainer) {
      if (myItems.length === 0) {
        itemsContainer.innerHTML = `
          <div style="text-align:center;padding:40px;opacity:.6">
            <p>You haven't listed any items yet.</p>
            <a href="/Re-Wear-website/add-item.html" style="color:var(--primary,#4f46e5);font-weight:600">List your first item →</a>
          </div>`;
      } else {
        itemsContainer.innerHTML = myItems.map((item) => `
          <div class="item-card" style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:12px">
            <img src="${item.images[0] || "/Re-Wear-website/images/item1.jpg"}" alt="${item.title}"
              style="width:80px;height:80px;object-fit:cover;border-radius:8px">
            <div style="flex:1">
              <h4 style="margin:0 0 4px">${item.title}</h4>
              <p style="margin:0;font-size:13px;opacity:.6">${item.views} views</p>
            </div>
            <div style="text-align:right">
              <p style="margin:0;font-weight:700;color:var(--primary,#4f46e5)">${item.points} pts</p>
              <span style="font-size:12px;padding:2px 10px;border-radius:20px;background:${statusColor(item.status)};color:#fff">${formatStatus(item.status)}</span>
            </div>
            <div style="display:flex;gap:8px">
              <button onclick="deleteItem(${item.id})"
                style="padding:6px 12px;border:1px solid #dc2626;color:#dc2626;background:none;border-radius:6px;cursor:pointer;font-size:13px">
                Delete
              </button>
            </div>
          </div>`).join("");
      }
    }

    // ── Exchanges Tab ────────────────────────────────────────
    const exchangesContainer = document.querySelector("[data-my-exchanges]");
    if (exchangesContainer) {
      const allOrders = [
        ...buying.map((o) => ({ ...o, role: "buyer" })),
        ...selling.map((o) => ({ ...o, role: "seller" })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (allOrders.length === 0) {
        exchangesContainer.innerHTML = `<p style="text-align:center;opacity:.6;padding:40px">No exchanges yet.</p>`;
      } else {
        exchangesContainer.innerHTML = allOrders.map((order) => `
          <div style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:12px">
            <img src="${order.item?.images?.[0] || "/Re-Wear-website/images/item1.jpg"}"
              style="width:60px;height:60px;object-fit:cover;border-radius:8px" alt="${order.item?.title}">
            <div style="flex:1">
              <h4 style="margin:0 0 4px">${order.role === "buyer" ? "Requested" : "Received request for"}: ${order.item?.title}</h4>
              <p style="margin:0;font-size:13px;opacity:.6">${order.role === "buyer"
                ? `From ${order.seller?.firstName} ${order.seller?.lastName}`
                : `From ${order.buyer?.firstName} ${order.buyer?.lastName}`}
              </p>
              <p style="margin:4px 0 0;font-size:12px;opacity:.5">${timeAgo(order.createdAt)}</p>
            </div>
            <div style="text-align:right;display:flex;flex-direction:column;gap:6px">
              <span style="font-size:12px;padding:3px 10px;border-radius:20px;background:${statusColor(order.status)};color:#fff">${formatStatus(order.status)}</span>
              ${order.role === "seller" && order.status === "REQUESTED" ? `
                <button onclick="acceptOrder(${order.id})"
                  style="padding:5px 12px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">Accept</button>
                <button onclick="rejectOrder(${order.id})"
                  style="padding:5px 12px;background:#dc2626;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">Reject</button>` : ""}
            </div>
          </div>`).join("");
      }
    }

    // ── Wishlist Tab ──────────────────────────────────────────
    const wishlistContainer = document.querySelector("[data-my-wishlist]");
    if (wishlistContainer) {
      if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `<p style="text-align:center;opacity:.6;padding:40px">Your wishlist is empty.</p>`;
      } else {
        wishlistContainer.innerHTML = wishlist.map((w) => `
          <div style="display:flex;align-items:center;gap:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:12px">
            <img src="${w.item?.images?.[0] || "/Re-Wear-website/images/item1.jpg"}"
              style="width:80px;height:80px;object-fit:cover;border-radius:8px">
            <div style="flex:1">
              <h4 style="margin:0 0 4px">${w.item.title}</h4>
              <p style="margin:0;font-size:13px;opacity:.6">By ${w.item.seller?.firstName} ${w.item.seller?.lastName}</p>
            </div>
            <div style="text-align:right">
              <p style="font-weight:700;color:var(--primary,#4f46e5)">${w.item.points} pts</p>
              <button onclick="removeWishlist(${w.item.id})"
                style="font-size:12px;padding:4px 10px;border:1px solid #ccc;background:none;border-radius:6px;cursor:pointer">Remove</button>
            </div>
          </div>`).join("");
      }
    }

    // ── Profile Tab ───────────────────────────────────────────
    const profileForm = document.querySelector("[data-profile-form]");
    if (profileForm) {
      const fnInput = profileForm.querySelector('input[name="firstName"]');
      const lnInput = profileForm.querySelector('input[name="lastName"]');
      const emailInput = profileForm.querySelector('input[type="email"]');
      const bioInput = profileForm.querySelector('textarea[name="bio"]');
      const locInput = profileForm.querySelector('input[name="location"]');

      if (fnInput) fnInput.value = user.firstName;
      if (lnInput) lnInput.value = user.lastName;
      if (emailInput) { emailInput.value = user.email; emailInput.disabled = true; }
      if (bioInput) bioInput.value = user.bio || "";
      if (locInput) locInput.value = user.location || "";

      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = profileForm.querySelector('button[type="submit"]');
        const fd = new FormData(profileForm);
        try {
          btn.disabled = true;
          btn.textContent = "Saving...";
          const data = await Api.users.updateMe(fd);
          Api.setUser(data.user);
          Api.showToast("Profile updated successfully!");
        } catch (err) {
          Api.showError(err.message);
        } finally {
          btn.disabled = false;
          btn.textContent = "Edit Profile";
        }
      });
    }

  } catch (err) {
    console.error("Dashboard error:", err);
    Api.showError("Failed to load dashboard. Please refresh.");
  }
});

// ── Action handlers (called from inline onclick) ─────────────
async function deleteItem(itemId) {
  if (!confirm("Delete this listing?")) return;
  try {
    await Api.items.delete(itemId);
    Api.showToast("Listing deleted.");
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    Api.showError(err.message);
  }
}

async function acceptOrder(orderId) {
  try {
    await Api.orders.accept(orderId);
    Api.showToast("Exchange accepted! Points transferred. 🎉");
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    Api.showError(err.message);
  }
}

async function rejectOrder(orderId) {
  try {
    await Api.orders.reject(orderId);
    Api.showToast("Request rejected.", "info");
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    Api.showError(err.message);
  }
}

async function removeWishlist(itemId) {
  try {
    await Api.wishlist.remove(itemId);
    Api.showToast("Removed from wishlist.");
    setTimeout(() => location.reload(), 600);
  } catch (err) {
    Api.showError(err.message);
  }
}

// ── Utilities ─────────────────────────────────────────────────
function setTextContent(selector, value) {
  document.querySelectorAll(selector).forEach((el) => (el.textContent = value));
}

function statusColor(status) {
  const map = {
    ACTIVE: "#16a34a", PENDING_APPROVAL: "#d97706", EXCHANGED: "#6b7280",
    ARCHIVED: "#6b7280", REQUESTED: "#2563eb", ACCEPTED: "#16a34a",
    REJECTED: "#dc2626", COMPLETED: "#7c3aed", CANCELLED: "#6b7280",
  };
  return map[status] || "#6b7280";
}

function formatStatus(status) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
