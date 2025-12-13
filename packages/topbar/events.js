export function initTopbarEvents(ctx) {
  /* ============================
     ELEMENTS
  ============================ */
  const btnConnect = document.getElementById("metaConnectButton");
  const notifBtn = document.getElementById("notificationButton");
  const profileBtn = document.getElementById("profileButton");
  const logoutBtn = document.getElementById("logoutButton");

  const channelSelect = document.getElementById("channelSelect");
  const brandSelect = document.getElementById("brandSelect");
  const campaignSelect = document.getElementById("campaignSelect");

  /* ============================
     VERBINDEN BUTTON
  ============================ */
  if (btnConnect) {
    btnConnect.addEventListener("click", () => {
      ctx.showToast("Verbinde Meta Ads…", "info");
      ctx.showGlobalLoader("Verbinde Meta Ads…");

      setTimeout(() => {
        ctx.hideGlobalLoader();
        ctx.setMetaConnected(true);
        ctx.showToast("Meta Ads erfolgreich verbunden.", "success");
      }, 1100);
    });
  }

  /* ============================
     NOTIFICATIONS
  ============================ */
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      ctx.showToast("Benachrichtigungen kommen bald 🔔", "info");
    });
  }

  /* ============================
     PROFILE BUTTON
  ============================ */
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      ctx.showToast("Profilbereich kommt bald 👤", "info");
    });
  }

  /* ============================
     LOGOUT BUTTON
  ============================ */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      ctx.showToast("Du wurdest ausgeloggt (Demo).", "info");
      ctx.setMetaConnected(false);
    });
  }

  /* ============================
     CHANNEL SELECT
  ============================ */
  if (channelSelect) {
    channelSelect.addEventListener("change", () => {
      ctx.state.channel = channelSelect.value;
      ctx.showToast(`Kanal geändert: ${channelSelect.value}`, "info");
    });
  }

  /* ============================
     BRAND SELECT
  ============================ */
  if (brandSelect) {
    brandSelect.addEventListener("change", () => {
      ctx.state.selectedBrand = brandSelect.value;
      ctx.showToast(`Brand geändert: ${brandSelect.value || "Alle"}`, "info");
    });
  }

  /* ============================
     CAMPAIGN SELECT
  ============================ */
  if (campaignSelect) {
    campaignSelect.addEventListener("change", () => {
      ctx.state.selectedCampaign = campaignSelect.value;
      ctx.showToast(`Kampagne geändert: ${campaignSelect.value || "Alle"}`, "info");
    });
  }

  console.log("[TOPBAR] Events initialisiert.");
}
