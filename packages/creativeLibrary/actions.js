/* ============================================
   Creative Library – Actions / Wiring
   ============================================ */

export function wireCreativeLibrary(root, handlers) {
  if (!root) return;

  const { onFilterChange, onSortChange, onOpenDetails, onAnalyzeWithSensei } =
    handlers;

  // Filter Buttons
  root.querySelectorAll(".cl-filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bucket = btn.getAttribute("data-bucket");

      root.querySelectorAll(".cl-filter-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");

      onFilterChange?.({ bucket });
    });
  });

  // Search Input
  const searchInput = root.querySelector("#clSearchInput");
  if (searchInput) {
    let searchTimeout = null;
    searchInput.addEventListener("input", (e) => {
      const value = e.target.value;
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        onFilterChange?.({ search: value });
      }, 200);
    });
  }

  // Type Select
  const typeSelect = root.querySelector("#clTypeSelect");
  if (typeSelect) {
    typeSelect.addEventListener("change", (e) => {
      onFilterChange?.({ type: e.target.value });
    });
  }

  // Sort Select
  const sortSelect = root.querySelector("#clSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      onSortChange?.(e.target.value);
    });
  }

  // Card Actions (Details / Sensei)
  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".cl-action-btn");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "details") {
      onOpenDetails?.(id);
    } else if (action === "sensei") {
      onAnalyzeWithSensei?.(id);
    }
  });
}
