(function () {
  "use strict";

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
    entries: [],
    tags: [],
    allFilters: ["todos"],
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

  function entryHasTag(entry, tagId) {
    return Array.isArray(entry.tags) && entry.tags.includes(tagId);
  }

  function primaryTag(entry) {
    return Array.isArray(entry.tags) && entry.tags.length > 0 ? entry.tags[0] : null;
  }

  function entriesForSection(sectionId) {
    return state.entries.filter((e) => e.sectionId === sectionId);
  }

  function renderTabs() {
    $tabs.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tab === state.tab);
    });
    $app.dataset.tab = state.tab;
  }

  function renderHeader() {
    const titles = TITLES[state.tab];
    const count = entriesForSection(state.tab).length;
    $line1.textContent = titles.line1;
    $line2.textContent = titles.line2;
    $subtitle.textContent = titles.sub(count);
  }

  function renderFilters() {
    const html = state.allFilters
      .map((tag) => {
        const isActive = state.filter === tag;
        const tagAttr = tag === "todos" ? "" : ` data-tag="${escapeHtml(tag)}"`;
        return `<button type="button" class="filter-btn${isActive ? " is-active" : ""}" data-filter="${escapeHtml(tag)}"${tagAttr}>${escapeHtml(tag)}</button>`;
      })
      .join("");
    $filters.innerHTML = html;
  }

  function renderList() {
    const sectionEntries = entriesForSection(state.tab);
    const filtered =
      state.filter === "todos"
        ? sectionEntries
        : sectionEntries.filter((e) => entryHasTag(e, state.filter));

    const html = filtered
      .map((entry, index) => {
        const isExpanded = state.expandedId === entry.id;
        const primary = primaryTag(entry);
        const tagBadges = (entry.tags || [])
          .map((t) => `<span class="card__tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>`)
          .join("");
        const quoteHtml = entry.quote
          ? `<p class="card__quote">"${escapeHtml(entry.quote.text)}" <span class="card__quote-author">— ${escapeHtml(entry.quote.author)}</span></p>`
          : "";
        const primaryAttr = primary ? ` data-tag="${escapeHtml(primary)}"` : "";
        return `
          <article class="card${isExpanded ? " is-expanded" : ""}" data-id="${entry.id}"${primaryAttr} style="--card-delay: ${index * 30}ms">
            <header class="card__header">
              <span class="card__number">#${entry.id}</span>
              <h2 class="card__title">${escapeHtml(entry.name)}</h2>
              ${tagBadges}
            </header>
            <div class="card__body">
              <p class="card__desc">${escapeHtml(entry.description)}</p>
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

  function renderError(message) {
    $list.innerHTML = `<p style="text-align:center;color:#ff6666;font-family:monospace">${escapeHtml(message)}</p>`;
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

  Promise.all([
    fetch("entries.json").then((r) => {
      if (!r.ok) throw new Error(`entries.json: HTTP ${r.status}`);
      return r.json();
    }),
    fetch("tags.json").then((r) => {
      if (!r.ok) throw new Error(`tags.json: HTTP ${r.status}`);
      return r.json();
    }),
  ])
    .then(([entries, tags]) => {
      state.entries = entries;
      state.tags = tags;
      state.allFilters = ["todos", ...tags.map((t) => t.id)];
      render();
    })
    .catch((err) => {
      console.error(err);
      renderError("Falha ao carregar os dados. Veja o console pra detalhes.");
    });
})();
