// ============================================================
// auth.js — Wires existing login/signup modals to the backend
// Add to index.html AFTER api.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // ── If already logged in, update CTA buttons ──────────────
  if (Api.isLoggedIn()) {
    const startBtn = document.querySelector('a[href="#"]');
    if (startBtn && startBtn.textContent.includes("Start")) {
      startBtn.href = "/Re-Wear-website/dashboard.html";
    }
  }

  // ── Modal open/close logic ────────────────────────────────
  // Your existing HTML has modal divs — we hook into them via
  // the existing Login / Sign Up buttons in the nav.
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");

  // Open modals (your HTML uses onclick="#" — upgrade these)
  document.querySelectorAll("[data-open-login], .nav-login-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginModal) loginModal.style.display = "flex";
    });
  });

  document.querySelectorAll("[data-open-signup], .nav-signup-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (signupModal) signupModal.style.display = "flex";
    });
  });

  // Close modals when clicking backdrop
  [loginModal, signupModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

  // Switch between modals (your HTML has "Don't have an account? Sign up")
  document.querySelectorAll("[data-switch-signup]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (loginModal) loginModal.style.display = "none";
      if (signupModal) signupModal.style.display = "flex";
    });
  });
  document.querySelectorAll("[data-switch-login]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (signupModal) signupModal.style.display = "none";
      if (loginModal) loginModal.style.display = "flex";
    });
  });

  // ── LOGIN FORM ────────────────────────────────────────────
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      const email = loginForm.querySelector('input[type="email"]').value.trim();
      const password = loginForm.querySelector('input[type="password"]').value;

      if (!email || !password) {
        return Api.showError("Please fill in all fields.");
      }

      btn.disabled = true;
      btn.textContent = "Signing in...";

      try {
        const data = await Api.auth.login({ email, password });
        Api.setToken(data.token);
        Api.setUser(data.user);
        Api.showToast(`Welcome back, ${data.user.firstName}!`);
        setTimeout(() => {
          window.location.href = "/Re-Wear-website/dashboard.html";
        }, 800);
      } catch (err) {
        Api.showError(err.message);
        btn.disabled = false;
        btn.textContent = "Sign In";
      }
    });
  }

  // ── SIGNUP FORM ───────────────────────────────────────────
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('button[type="submit"]');
      const inputs = signupForm.querySelectorAll("input");

      // Collect form values (your modal has: firstName, lastName, email, password)
      const firstName = signupForm.querySelector('input[name="firstName"], input[placeholder*="First"]')?.value.trim();
      const lastName = signupForm.querySelector('input[name="lastName"], input[placeholder*="Last"]')?.value.trim();
      const email = signupForm.querySelector('input[type="email"]')?.value.trim();
      const password = signupForm.querySelector('input[type="password"]')?.value;
      const agreed = signupForm.querySelector('input[type="checkbox"]')?.checked;

      if (!firstName || !lastName || !email || !password) {
        return Api.showError("Please fill in all fields.");
      }
      if (!agreed) {
        return Api.showError("Please agree to the Terms of Service.");
      }
      if (password.length < 6) {
        return Api.showError("Password must be at least 6 characters.");
      }

      btn.disabled = true;
      btn.textContent = "Creating account...";

      try {
        const data = await Api.auth.register({ firstName, lastName, email, password });
        Api.setToken(data.token);
        Api.setUser(data.user);
        Api.showToast(`Welcome to ReWear, ${data.user.firstName}! 🎉`);
        setTimeout(() => {
          window.location.href = "/Re-Wear-website/dashboard.html";
        }, 800);
      } catch (err) {
        Api.showError(err.message);
        btn.disabled = false;
        btn.textContent = "Create Account";
      }
    });
  }

  // ── LOGOUT ────────────────────────────────────────────────
  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      Api.logout();
    });
  });
});
