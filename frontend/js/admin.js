// ============================================================
// admin.js — Wires admin-panel.html to real backend data
// Add to admin-panel.html AFTER api.js
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  // Redirect if not logged in or not admin
  if (!Api.isLoggedIn()) {
    alert("Admin access required. Please log in.");
    window.location.href = "/Re-Wear-website/index.html";
    return;
  }

  const user = Api.getUser();
  if (user?.role !== "ADMIN") {
    alert("You do not have admin privileges.");
    window.location.href = "/Re-Wear-website/index.html";
    return;
  }

  // Load all admin data in parallel
  try {
    const [statsData, usersData, itemsData, ordersData] = await Promise.all([
      Api.admin.getStats(),
      Api.admin.getUsers({ limit: 50 }),
      Api.admin.getItems({ limit: 50 }),
      Api.admin.getOrders({ limit: 50 }),
    ]);

    renderStats(statsData);
    renderUsers(usersData.users);
    renderItems(itemsData.items);
    renderOrders(ordersData.orders);

  } catch (err) {
    console.error("Admin load error:", err);
    Api.showError("Failed to load admin data: " + err.message);
  }
});

// ── Stats ─────────────────────────────────────────────────────
function renderStats(stats) {
  const map = {
    "[data-stat-users]": stats.totalUsers,
    "[data-stat-items]": stats.totalItems,
    "[data-stat-orders]": stats.totalOrders,
    "[data-stat-completed]": stats.completedOrders,
  };
  Object.entries(map).forEach(([sel, val]) => {
    document.querySelectorAll(sel).forEach((el) => (el.textContent = val));
  });
}

// ── Users Table ───────────────────────────────────────────────
function renderUsers(users) {
  const container = document.querySelector("[data-admin-users]");
  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = `<p style="opacity:.5;padding:20px">No users found.</p>`;
    return;
  }

  container.innerHTML = users.map((u) => `
    <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #f3f4f6">
      <img src="${u.avatar || "/Re-Wear-website/assets/women1.jpg"}" alt="${u.firstName}"
        style="width:44px;height:44px;border-radius:50%;object-fit:cover">
      <div style="flex:1">
        <p style="margin:0;font-weight:600">${u.firstName} ${u.lastName}</p>
        <p style="margin:0;font-size:13px;opacity:.5">${u.email}</p>
        <p style="margin:0;font-size:12px;opacity:.4">${u._count.listings} listings · ${u._count.ordersBuyer} orders · ${u.points} pts</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <span style="font-size:12px;padding:3px 10px;border-radius:20px;background:${u.isActive ? "#dcfce7" : "#fee2e2"};color:${u.isActive ? "#16a34a" : "#dc2626"}">
          ${u.isActive ? "Active" : "Inactive"}
        </span>
        <span style="font-size:11px;opacity:.4">${u.role}</span>
        <div style="display:flex;gap:6px">
          <button onclick="toggleUser(${u.id}, ${!u.isActive})"
            style="font-size:12px;padding:4px 10px;border:1px solid ${u.isActive ? "#dc2626" : "#16a34a"};color:${u.isActive ? "#dc2626" : "#16a34a"};background:none;border-radius:6px;cursor:pointer">
            ${u.isActive ? "Deactivate" : "Activate"}
          </button>
          ${u.role !== "ADMIN" ? `
            <button onclick="makeAdmin(${u.id})"
              style="font-size:12px;padding:4px 10px;border:1px solid #7c3aed;color:#7c3aed;background:none;border-radius:6px;cursor:pointer">
              Make Admin
            </button>` : ""}
        </div>
      </div>
    </div>`).join("");
}

// ── Items Table ───────────────────────────────────────────────
function renderItems(items) {
  const container = document.querySelector("[data-admin-items]");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p style="opacity:.5;padding:20px">No listings found.</p>`;
    return;
  }

  container.innerHTML = items.map((item) => `
    <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #f3f4f6">
      <img src="${item.images?.[0] || "/Re-Wear-website/assets/men1.avif"}" alt="${item.title}"
        style="width:60px;height:60px;object-fit:cover;border-radius:8px">
      <div style="flex:1">
        <p style="margin:0;font-weight:600">${item.title}</p>
        <p style="margin:0;font-size:13px;opacity:.5">
          ${item.category} · ${item.points} pts · by ${item.seller?.firstName} ${item.seller?.lastName}
        </p>
        <p style="margin:0;font-size:12px;opacity:.4">${item.views} views</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <span style="font-size:12px;padding:3px 10px;border-radius:20px;background:${statusBg(item.status)};color:${statusColor(item.status)}">
          ${formatStatus(item.status)}
        </span>
        <div style="display:flex;gap:6px">
          ${item.status === "ACTIVE" ? `
            <button onclick="archiveItem(${item.id})"
              style="font-size:12px;padding:4px 10px;border:1px solid #d97706;color:#d97706;background:none;border-radius:6px;cursor:pointer">
              Archive
            </button>` : ""}
          ${item.status === "ARCHIVED" ? `
            <button onclick="restoreItem(${item.id})"
              style="font-size:12px;padding:4px 10px;border:1px solid #16a34a;color:#16a34a;background:none;border-radius:6px;cursor:pointer">
              Restore
            </button>` : ""}
        </div>
      </div>
    </div>`).join("");
}

// ── Orders Table ──────────────────────────────────────────────
function renderOrders(orders) {
  const container = document.querySelector("[data-admin-orders]");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<p style="opacity:.5;padding:20px">No orders found.</p>`;
    return;
  }

  container.innerHTML = orders.map((order) => `
    <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid #f3f4f6">
      <img src="${order.item?.images?.[0] || "/Re-Wear-website/assets/men1.avif"}" alt="${order.item?.title}"
        style="width:56px;height:56px;object-fit:cover;border-radius:8px">
      <div style="flex:1">
        <p style="margin:0;font-weight:600">#${order.id} · ${order.item?.title}</p>
        <p style="margin:0;font-size:13px;opacity:.5">
          Buyer: ${order.buyer?.firstName} ${order.buyer?.lastName} →
          Seller: ${order.seller?.firstName} ${order.seller?.lastName}
        </p>
        <p style="margin:0;font-size:12px;opacity:.4">${order.pointsUsed} pts · ${new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
      <span style="font-size:12px;padding:3px 10px;border-radius:20px;background:${statusBg(order.status)};color:${statusColor(order.status)}">
        ${formatStatus(order.status)}
      </span>
    </div>`).join("");
}

// ── Admin Actions ─────────────────────────────────────────────
window.toggleUser = async (userId, activate) => {
  if (!confirm(`${activate ? "Activate" : "Deactivate"} this user?`)) return;
  try {
    await Api.admin.updateUser(userId, { isActive: activate });
    Api.showToast(`User ${activate ? "activated" : "deactivated"}.`);
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    Api.showError(err.message);
  }
};

window.makeAdmin = async (userId) => {
  if (!confirm("Grant admin privileges to this user?")) return;
  try {
    await Api.admin.updateUser(userId, { role: "ADMIN" });
    Api.showToast("User is now an admin.");
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    Api.showError(err.message);
  }
};

window.archiveItem = async (itemId) => {
  if (!confirm("Archive this listing?")) return;
  try {
    await Api.admin.updateItem(itemId, "ARCHIVED");
    Api.showToast("Listing archived.");
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    Api.showError(err.message);
  }
};

window.restoreItem = async (itemId) => {
  try {
    await Api.admin.updateItem(itemId, "ACTIVE");
    Api.showToast("Listing restored.");
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    Api.showError(err.message);
  }
};

// ── Utilities ─────────────────────────────────────────────────
function statusColor(status) {
  const map = {
    ACTIVE: "#16a34a", ARCHIVED: "#92400e", EXCHANGED: "#1d4ed8",
    REQUESTED: "#1d4ed8", ACCEPTED: "#16a34a", REJECTED: "#dc2626",
    COMPLETED: "#7c3aed", CANCELLED: "#6b7280",
  };
  return map[status] || "#6b7280";
}

function statusBg(status) {
  const map = {
    ACTIVE: "#dcfce7", ARCHIVED: "#fef3c7", EXCHANGED: "#dbeafe",
    REQUESTED: "#dbeafe", ACCEPTED: "#dcfce7", REJECTED: "#fee2e2",
    COMPLETED: "#ede9fe", CANCELLED: "#f3f4f6",
  };
  return map[status] || "#f3f4f6";
}

function formatStatus(s) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
