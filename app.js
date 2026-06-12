(() => {
  "use strict";

  const config = window.PORTFOLIO_CONFIG;
  const state = {
    projects: [],
    category: "All",
    search: "",
    sort: "featured",
  };

  const elements = {
    grid: document.querySelector("#project-grid"),
    filters: document.querySelector("#filter-list"),
    count: document.querySelector("#project-count"),
    status: document.querySelector("#status"),
    empty: document.querySelector("#empty-state"),
    search: document.querySelector("#search-input"),
    sort: document.querySelector("#sort-select"),
    template: document.querySelector("#project-template"),
  };

  const categoryRules = [
    ["Data & BI", /power.?bi|\bdax\b|chart|data|filter.?context|infograph|analytics|theme/i],
    ["Games", /game|rummy|thayam|dice|paddle|carrom|tris|fortris|chain.?breaker|color.?match|tubes/i],
    ["3D & Graphics", /\b3d\b|three\.?js|cube|spiro|kaleido|stereo|vr|firework|circle.?magic|hypercube|animation|word.?cloud/i],
    ["Tamil & Culture", /tamil|thirukkural|thiruppugazh|thayam|be.?indian/i],
    ["Business Tools", /finance|financial|account|audit|loan|calculator|business|productivity|tally|costing|excel|smart.?split/i],
    ["Automation", /automation|selenium|rpa|ocr|connector/i],
    ["AI & Learning", /\bai\b|machine.?learning|transformer|learning|neural/i],
  ];

  const languageColors = {
    JavaScript: "#f1c40f",
    TypeScript: "#3178c6",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572a5",
    "C#": "#178600",
  };

  function normalizeRepository(repository) {
    const override = config.overrides[repository.name] || {};
    const searchable = [
      repository.name,
      repository.description,
      repository.language,
      ...(repository.topics || []),
    ]
      .filter(Boolean)
      .join(" ");

    const categories = new Set(override.categories || []);
    categoryRules.forEach(([category, pattern]) => {
      if (pattern.test(searchable)) categories.add(category);
    });

    if (!categories.size) categories.add("Web Apps");

    return {
      ...repository,
      description:
        override.description ||
        repository.description ||
        "An experimental project exploring ideas through code and interaction.",
      displayName: override.title || repository.name.replaceAll("-", " "),
      categories: [...categories],
      featured: config.featured.includes(repository.name),
      demoUrl: override.homepage || repository.homepage || inferPagesUrl(repository),
    };
  }

  function inferPagesUrl(repository) {
    if (!repository.has_pages) return "";
    return `https://${config.username.toLowerCase()}.github.io/${repository.name}/`;
  }

  async function loadProjects() {
    const endpoint = `https://api.github.com/users/${config.username}/repos?per_page=100&sort=updated`;
    const cacheKey = `portfolio-repositories:${config.username}`;
    let repositories;

    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      repositories = await response.json();
      localStorage.setItem(cacheKey, JSON.stringify(repositories));
    } catch (error) {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) throw error;
      repositories = JSON.parse(cached);
    }

    state.projects = repositories
      .filter((repo) => !repo.fork && !repo.archived && !config.hidden.includes(repo.name))
      .map(normalizeRepository);
  }

  function renderFilters() {
    const counts = new Map([["All", state.projects.length]]);
    state.projects.forEach((project) => {
      project.categories.forEach((category) => {
        counts.set(category, (counts.get(category) || 0) + 1);
      });
    });

    elements.filters.replaceChildren(
      ...[...counts.entries()].map(([category, count]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `filter-chip${category === state.category ? " active" : ""}`;
        button.textContent = `${category} · ${count}`;
        button.setAttribute("aria-pressed", String(category === state.category));
        button.addEventListener("click", () => {
          state.category = category;
          renderFilters();
          renderProjects();
        });
        return button;
      }),
    );
  }

  function visibleProjects() {
    const query = state.search.trim().toLowerCase();
    const projects = state.projects.filter((project) => {
      const inCategory = state.category === "All" || project.categories.includes(state.category);
      const haystack = [
        project.name,
        project.description,
        project.language,
        ...project.categories,
        ...(project.topics || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return inCategory && (!query || haystack.includes(query));
    });

    return projects.sort((a, b) => {
      if (state.sort === "name") return a.name.localeCompare(b.name);
      if (state.sort === "stars") return b.stargazers_count - a.stargazers_count;
      if (state.sort === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
      return Number(b.featured) - Number(a.featured) || new Date(b.updated_at) - new Date(a.updated_at);
    });
  }

  function projectCard(project) {
    const card = elements.template.content.firstElementChild.cloneNode(true);
    card.classList.toggle("featured", project.featured);
    card.querySelector(".category-badge").textContent = project.categories[0];
    card.querySelector(".featured-badge").hidden = !project.featured;
    card.querySelector("h3").textContent = project.displayName;
    card.querySelector(".description").textContent = project.description;

    const seenTopics = new Set();
    const topics = [project.language, ...(project.topics || [])]
      .filter(Boolean)
      .filter((topic) => {
        const key = topic.toLowerCase();
        if (seenTopics.has(key)) return false;
        seenTopics.add(key);
        return true;
      })
      .slice(0, 3);
    card.querySelector(".topic-list").replaceChildren(
      ...topics.map((topic) => {
        const span = document.createElement("span");
        span.className = "topic";
        span.textContent = topic;
        return span;
      }),
    );

    const meta = card.querySelector(".repo-meta");
    if (project.language) {
      const language = document.createElement("span");
      language.className = "language";
      language.textContent = project.language;
      language.style.setProperty("--language-color", languageColors[project.language] || "#176b67");
      meta.append(language);
    }
    if (project.stargazers_count) {
      const stars = document.createElement("span");
      stars.textContent = `★ ${project.stargazers_count}`;
      meta.append(stars);
    }

    const demoLink = card.querySelector(".demo-link");
    if (project.demoUrl) {
      demoLink.href = project.demoUrl;
    } else {
      demoLink.remove();
    }
    card.querySelector(".repo-link").href = project.html_url;
    return card;
  }

  function renderProjects() {
    const projects = visibleProjects();
    elements.grid.replaceChildren(...projects.map(projectCard));
    elements.count.textContent = `${projects.length} of ${state.projects.length} projects`;
    elements.empty.hidden = projects.length > 0;
  }

  function showError(error) {
    console.error(error);
    elements.status.innerHTML =
      "<strong>Projects could not be loaded.</strong> Please refresh the page or visit GitHub directly.";
    elements.status.classList.add("error");
    elements.count.textContent = "GitHub data unavailable";
  }

  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProjects();
  });

  elements.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProjects();
  });

  loadProjects()
    .then(() => {
      elements.status.hidden = true;
      renderFilters();
      renderProjects();
    })
    .catch(showError);
})();
