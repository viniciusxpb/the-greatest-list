(function () {
  "use strict";

  const DATA = { boas: items, chosen: betrayals, meh: meh };

  const TITLES = {
    boas: {
      line1: "COISAS QUE NÃO PRECISAVAM",
      line2: "SER TÃO BOAS",
      sub: (n) => `${n} momentos em que alguém decidiu entregar demais`,
    },
    chosen: {
      line1: "YOU WERE SUPPOSED TO BE",
      line2: "THE CHOSEN ONE",
      sub: (n) => `${n} traições imperdoáveis`,
    },
    meh: {
      line1: "NÃO ESPERAVA NADA E",
      line2: "TÔ DESAPONTADO",
      sub: (n) => `${n} vezes que o mínimo era demais`,
    },
  };

  const state = {
    tab: "boas",
    filter: "todos",
    expandedId: null,
  };

  const $app = document.querySelector("[data-app]");
  const $tabs = document.querySelector("[data-tabs]");
  const $line1 = document.querySelector("[data-title-line1]");
  const $line2 = document.querySelector("[data-title-line2]");
  const $subtitle = document.querySelector("[data-subtitle]");
  const $filters = document.querySelector("[data-filters]");
  const $list = document.querySelector("[data-list]");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[ch]);
  }

  function renderTabs() {
    $tabs.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tab === state.tab);
    });
    $app.dataset.tab = state.tab;
  }

  function renderHeader() {
    const titles = TITLES[state.tab];
    const count = DATA[state.tab].length;
    $line1.textContent = titles.line1;
    $line2.textContent = titles.line2;
    $subtitle.textContent = titles.sub(count);
  }

  function renderFilters() {
    const html = allTags
      .map((tag) => {
        const isActive = state.filter === tag;
        const tagAttr = tag === "todos" ? "" : ` data-tag="${escapeHtml(tag)}"`;
        return `<button type="button" class="filter-btn${isActive ? " is-active" : ""}" data-filter="${escapeHtml(tag)}"${tagAttr}>${escapeHtml(tag)}</button>`;
      })
      .join("");
    $filters.innerHTML = html;
  }

  function renderList() {
    const current = DATA[state.tab];
    const filtered =
      state.filter === "todos"
        ? current
        : current.filter((item) => item.tag === state.filter);

    const html = filtered
      .map((item, index) => {
        const isExpanded = state.expandedId === item.id;
        const quoteHtml = item.quote
          ? `<p class="card__quote">"${escapeHtml(item.quote.text)}" <span class="card__quote-author">— ${escapeHtml(item.quote.author)}</span></p>`
          : "";
        return `
          <article class="card${isExpanded ? " is-expanded" : ""}" data-id="${item.id}" data-tag="${escapeHtml(item.tag)}" style="--card-delay: ${index * 30}ms">
            <header class="card__header">
              <span class="card__number">#${item.id}</span>
              <h2 class="card__title">${escapeHtml(item.title)}</h2>
              <span class="card__tag" data-tag="${escapeHtml(item.tag)}">${escapeHtml(item.tag)}</span>
            </header>
            <div class="card__body">
              <p class="card__desc">${escapeHtml(item.desc)}</p>
              ${quoteHtml}
            </div>
          </article>
        `;
      })
      .join("");

    $list.innerHTML = html;
  }

  function render() {
    renderTabs();
    renderHeader();
    renderFilters();
    renderList();
  }

  $tabs.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-tab]");
    if (!btn) return;
    const nextTab = btn.dataset.tab;
    if (nextTab === state.tab) return;
    state.tab = nextTab;
    state.filter = "todos";
    state.expandedId = null;
    render();
  });

  $filters.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-filter]");
    if (!btn) return;
    const nextFilter = btn.dataset.filter;
    if (nextFilter === state.filter) return;
    state.filter = nextFilter;
    state.expandedId = null;
    renderFilters();
    renderList();
  });

  $list.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    state.expandedId = state.expandedId === id ? null : id;

    $list.querySelectorAll(".card").forEach((el) => {
      const elId = Number(el.dataset.id);
      el.classList.toggle("is-expanded", elId === state.expandedId);
    });
  });

  render();
})();
