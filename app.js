/**
 * M3U Splitter Pro — Core Application Logic
 * 100% Client-Side IPTV M3U/M3U8 Parser, Classifier & Zip Packager
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    fileName: '',
    totalItems: 0,
    categories: new Map(), // key -> { id, name, cleanName, type: 'canais'|'filmes'|'series', selected: true, count: 0, items: [] }
    selectedTypeFilter: 'all',
    searchTerm: '',
    isProcessing: false
  };

  // --- DOM ELEMENTS ---
  const dom = {
    // Header & Source Switchers
    btnHeaderChangeSource: document.getElementById('btn-header-change-source'),
    btnSourceChangeBanner: document.getElementById('btn-source-change-banner'),
    activeSourceName: document.getElementById('active-source-name'),

    // Source Modes & Upload
    uploadSection: document.getElementById('upload-section'),
    sourceModeNav: document.querySelector('.source-mode-nav'),
    tabModeFile: document.getElementById('tab-mode-file'),
    tabModeUrl: document.getElementById('tab-mode-url'),
    dropZone: document.getElementById('drop-zone'),
    urlZone: document.getElementById('url-zone'),
    fileInput: document.getElementById('file-input'),
    btnSelectFile: document.getElementById('btn-select-file'),
    urlForm: document.getElementById('url-form'),
    m3uUrlInput: document.getElementById('m3u-url-input'),
    btnFetchUrl: document.getElementById('btn-fetch-url'),
    btnSampleGithub: document.getElementById('btn-sample-github'),

    // Processing Indicator
    processingIndicator: document.getElementById('processing-indicator'),
    processingTitle: document.getElementById('processing-status-title'),
    processingDesc: document.getElementById('processing-status-desc'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    progressPercent: document.getElementById('progress-percent'),

    // Manager & Results
    managerSection: document.getElementById('manager-section'),
    statTotalItems: document.getElementById('stat-total-items'),
    statTotalCats: document.getElementById('stat-total-cats'),
    statLiveItems: document.getElementById('stat-live-items'),
    statLiveCats: document.getElementById('stat-live-cats'),
    statMovieItems: document.getElementById('stat-movie-items'),
    statMovieCats: document.getElementById('stat-movie-cats'),
    statSeriesItems: document.getElementById('stat-series-items'),
    statSeriesCats: document.getElementById('stat-series-cats'),

    // Search & Tabs
    categorySearch: document.getElementById('category-search'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    btnClearFilter: document.getElementById('btn-clear-filter'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    tabCountAll: document.getElementById('tab-count-all'),
    tabCountCanais: document.getElementById('tab-count-canais'),
    tabCountFilmes: document.getElementById('tab-count-filmes'),
    tabCountSeries: document.getElementById('tab-count-series'),

    // Actions
    btnSelectAll: document.getElementById('btn-select-all'),
    btnDeselectAll: document.getElementById('btn-deselect-all'),
    btnResetFile: document.getElementById('btn-reset-file'),
    btnToggleCanais: document.getElementById('btn-toggle-all-canais'),
    btnToggleFilmes: document.getElementById('btn-toggle-all-filmes'),
    btnToggleSeries: document.getElementById('btn-toggle-all-series'),

    // Sections & Grids
    sectionCanais: document.getElementById('section-canais'),
    sectionFilmes: document.getElementById('section-filmes'),
    sectionSeries: document.getElementById('section-series'),
    gridCanais: document.getElementById('grid-canais'),
    gridFilmes: document.getElementById('grid-filmes'),
    gridSeries: document.getElementById('grid-series'),
    canaisSummary: document.getElementById('canais-section-summary'),
    filmesSummary: document.getElementById('filmes-section-summary'),
    seriesSummary: document.getElementById('series-section-summary'),

    // Export Bar
    selectedCatsBadge: document.getElementById('selected-cats-badge'),
    selectedItemsBadge: document.getElementById('selected-items-badge'),
    optFolderStructure: document.getElementById('opt-folder-structure'),
    optMacroMasterFiles: document.getElementById('opt-macro-master-files'),
    btnGenerateZip: document.getElementById('btn-generate-zip'),
    btnExportLabel: document.getElementById('btn-export-label'),
    exportSubOptions: document.getElementById('export-sub-options'),

    // Modal
    zipModal: document.getElementById('zip-modal'),
    zipModalTitle: document.getElementById('zip-modal-title'),
    zipModalDesc: document.getElementById('zip-modal-desc'),
    zipProgressBar: document.getElementById('zip-progress-bar'),
    zipProgressText: document.getElementById('zip-progress-text'),
    zipProgressPercent: document.getElementById('zip-progress-percent')
  };

  // --- INITIALIZATION ---
  function init() {
    setupEventListeners();
  }

  function setupEventListeners() {
    // Mode Switcher
    if (dom.tabModeFile && dom.tabModeUrl) {
      dom.tabModeFile.addEventListener('click', () => setSourceMode('file'));
      dom.tabModeUrl.addEventListener('click', () => setSourceMode('url'));
    }

    // Drop zone interactions
    dom.btnSelectFile.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.fileInput.click();
    });

    dom.dropZone.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', handleFileSelect);

    dom.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dom.dropZone.classList.add('dragover');
    });

    dom.dropZone.addEventListener('dragleave', () => {
      dom.dropZone.classList.remove('dragover');
    });

    dom.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dom.dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    });

    // URL Form interactions
    if (dom.urlForm) {
      dom.urlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = dom.m3uUrlInput.value.trim();
        if (url) processUrl(url);
      });
    }

    if (dom.btnSampleGithub) {
      dom.btnSampleGithub.addEventListener('click', () => {
        dom.m3uUrlInput.value = 'https://github.com/Ramys/Iptv-Brasil-2026/blob/master/CanaisBR04.m3u8';
        processUrl(dom.m3uUrlInput.value);
      });
    }

    // Trocar Arquivo / Link (All Prominent Change Source Buttons)
    dom.btnResetFile.addEventListener('click', resetApplication);
    if (dom.btnHeaderChangeSource) {
      dom.btnHeaderChangeSource.addEventListener('click', resetApplication);
    }
    if (dom.btnSourceChangeBanner) {
      dom.btnSourceChangeBanner.addEventListener('click', resetApplication);
    }

    // Master Controls
    dom.btnSelectAll.addEventListener('click', () => toggleAllCategories(true));
    dom.btnDeselectAll.addEventListener('click', () => toggleAllCategories(false));

    // Section Controls
    dom.btnToggleCanais.addEventListener('click', () => toggleSectionCategories('canais', dom.btnToggleCanais));
    dom.btnToggleFilmes.addEventListener('click', () => toggleSectionCategories('filmes', dom.btnToggleFilmes));
    dom.btnToggleSeries.addEventListener('click', () => toggleSectionCategories('series', dom.btnToggleSeries));

    // Search & Filter Clear
    dom.categorySearch.addEventListener('input', handleSearch);
    dom.btnClearSearch.addEventListener('click', () => {
      dom.categorySearch.value = '';
      state.searchTerm = '';
      dom.btnClearSearch.classList.add('hidden');
      filterRenderedCards();
      updateFilterVisibility();
    });

    if (dom.btnClearFilter) {
      dom.btnClearFilter.addEventListener('click', clearAllFilters);
    }

    // Filter Tabs
    dom.filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        dom.filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        state.selectedTypeFilter = tab.getAttribute('data-type');
        applyTypeFilter();
        updateFilterVisibility();
      });
    });

    // Export Format Mode Selection
    const formatPills = document.querySelectorAll('.format-pill');
    formatPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        formatPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const radio = pill.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          updateExportButtonLabel(radio.value);
        }
      });
    });

    // Export Trigger
    dom.btnGenerateZip.addEventListener('click', handleExportZip);
  }

  // --- SOURCE MODES & URL HANDLING ---
  function setSourceMode(mode) {
    if (mode === 'file') {
      dom.tabModeFile.classList.add('active');
      dom.tabModeUrl.classList.remove('active');
      dom.dropZone.classList.remove('hidden');
      dom.urlZone.classList.add('hidden');
    } else {
      dom.tabModeFile.classList.remove('active');
      dom.tabModeUrl.classList.add('active');
      dom.dropZone.classList.add('hidden');
      dom.urlZone.classList.remove('hidden');
      if (dom.m3uUrlInput) dom.m3uUrlInput.focus();
    }
  }

  function convertToRawUrl(inputUrl) {
    let url = inputUrl.trim();

    // GitHub: github.com/user/repo/blob/branch/path -> raw.githubusercontent.com/user/repo/branch/path
    const githubBlobMatch = url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/i);
    if (githubBlobMatch) {
      const [, user, repo, branch, path] = githubBlobMatch;
      return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    }

    // GitHub: github.com/user/repo/raw/branch/path -> raw.githubusercontent.com/user/repo/branch/path
    const githubRawMatch = url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/raw\/([^\/]+)\/(.+)$/i);
    if (githubRawMatch) {
      const [, user, repo, branch, path] = githubRawMatch;
      return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    }

    return url;
  }

  function extractFilenameFromUrl(url) {
    try {
      const cleanUrl = url.split('?')[0].split('#')[0];
      const parts = cleanUrl.split('/');
      let name = parts[parts.length - 1] || 'lista';
      return name.replace(/\.[^/.]+$/, '');
    } catch {
      return 'lista_web';
    }
  }

  async function processUrl(inputUrl) {
    const rawUrl = convertToRawUrl(inputUrl);
    state.fileName = extractFilenameFromUrl(rawUrl);
    state.isProcessing = true;
    state.categories.clear();
    state.totalItems = 0;

    // Show processing indicator
    dom.dropZone.classList.add('hidden');
    dom.urlZone.classList.add('hidden');
    if (dom.sourceModeNav) dom.sourceModeNav.classList.add('hidden');
    dom.processingIndicator.classList.remove('hidden');
    updateProgress(0, 'Conectando ao GitHub / Servidor...');

    try {
      let response;
      try {
        response = await fetch(rawUrl);
      } catch (networkErr) {
        console.warn('Direct fetch failed, trying CORS fallback...', networkErr);
        updateProgress(5, 'Tentando via proxy seguro...');
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        throw new Error(`Servidor respondeu com status HTTP ${response.status} (${response.statusText})`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      let receivedBytes = 0;
      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedBytes += value.length;

        if (totalBytes > 0) {
          const percent = Math.floor((receivedBytes / totalBytes) * 40);
          const mb = (receivedBytes / (1024 * 1024)).toFixed(1);
          const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
          updateProgress(percent, `Baixando lista: ${mb} MB de ${totalMb} MB (${Math.round((receivedBytes / totalBytes) * 100)}%)...`);
        } else {
          const mb = (receivedBytes / (1024 * 1024)).toFixed(1);
          updateProgress(20, `Baixando lista: ${mb} MB recebidos...`);
        }
      }

      updateProgress(45, 'Decodificando conteúdo...');
      const merged = new Uint8Array(receivedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(merged);

      updateProgress(50, 'Indexando linhas e canais...');
      await parseM3UContent(text);

      updateProgress(100, 'Categorização concluída!');
      setTimeout(() => {
        dom.processingIndicator.classList.add('hidden');
        renderDashboard();
      }, 300);
    } catch (err) {
      console.error(err);
      alert(`Erro ao carregar o link: ${err.message}`);
      resetApplication();
    }
  }

  // --- FILE HANDLING & PARSER ---
  function handleFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }

  async function processFile(file) {
    if (!file) return;

    state.fileName = file.name.replace(/\.[^/.]+$/, '');
    state.isProcessing = true;
    state.categories.clear();
    state.totalItems = 0;

    // Show processing indicator
    dom.dropZone.classList.add('hidden');
    dom.urlZone.classList.add('hidden');
    if (dom.sourceModeNav) dom.sourceModeNav.classList.add('hidden');
    dom.processingIndicator.classList.remove('hidden');
    updateProgress(0, 'Carregando arquivo na memória...');

    try {
      // Read file in stream or text
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      updateProgress(10, `Lendo arquivo (${fileSizeMB} MB)...`);

      const text = await file.text();
      updateProgress(30, 'Indexando linhas e canais...');

      await parseM3UContent(text);

      updateProgress(100, 'Categorização concluída!');
      setTimeout(() => {
        dom.processingIndicator.classList.add('hidden');
        renderDashboard();
      }, 300);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o arquivo M3U. Verifique se o formato está correto.');
      resetApplication();
    }
  }

  function parseM3UContent(content) {
    return new Promise((resolve) => {
      const lines = content.split(/\r?\n/);
      const totalLines = lines.length;
      let currentInf = null;
      let currentExtGrp = null;

      const groupRegex = /group-title="([^"]*)"/i;
      const step = Math.max(10000, Math.floor(totalLines / 20));

      let i = 0;
      function processBatch() {
        const end = Math.min(i + step, totalLines);
        for (; i < end; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (line.startsWith('#EXTINF')) {
            currentInf = line;
          } else if (line.startsWith('#EXTGRP')) {
            currentExtGrp = line.replace('#EXTGRP:', '').trim();
          } else if (!line.startsWith('#')) {
            // URL line
            if (currentInf) {
              const url = line;
              state.totalItems++;

              // Extract group-title
              let groupName = 'Outros';
              const match = currentInf.match(groupRegex);
              if (match && match[1] && match[1].trim()) {
                groupName = match[1].trim();
              } else if (currentExtGrp) {
                groupName = currentExtGrp;
              }

              // Determine Category Type (Xtream Codes / M3U Heuristics)
              const type = classifyItem(url, groupName);

              // Unique Key per group + type
              const catKey = `${type}___${groupName}`;

              if (!state.categories.has(catKey)) {
                state.categories.set(catKey, {
                  id: `cat-${state.categories.size + 1}`,
                  key: catKey,
                  name: groupName,
                  cleanName: sanitizeFilename(groupName),
                  type: type,
                  selected: true,
                  count: 0,
                  items: []
                });
              }

              const category = state.categories.get(catKey);
              category.count++;
              category.items.push({ inf: currentInf, url: url });

              currentInf = null;
              currentExtGrp = null;
            }
          }
        }

        const percent = Math.min(95, Math.floor(30 + (i / totalLines) * 65));
        updateProgress(percent, `Classificando itens: ${state.totalItems.toLocaleString()} encontrados...`);

        if (i < totalLines) {
          setTimeout(processBatch, 0); // Allow browser rendering
        } else {
          resolve();
        }
      }

      processBatch();
    });
  }

  /**
   * Deterministic Classifier:
   * 1. Check Xtream Codes URL route (/movie/ or /series/)
   * 2. Check group-title prefix
   * 3. Fallback to video extensions
   */
  function classifyItem(url, groupName) {
    const lowerUrl = url.toLowerCase();
    const lowerGrp = groupName.toLowerCase();

    // 1. Direct Xtream route check
    if (lowerUrl.includes('/movie/')) {
      return 'filmes';
    }
    if (lowerUrl.includes('/series/')) {
      return 'series';
    }

    // 2. Group name hints
    if (
      lowerGrp.startsWith('canais') ||
      lowerGrp.startsWith('canal') ||
      lowerGrp.includes('24h') ||
      lowerGrp.includes('24 horas') ||
      lowerGrp.includes('ao vivo')
    ) {
      return 'canais';
    }

    if (lowerGrp.startsWith('séries') || lowerGrp.startsWith('series') || lowerGrp.includes('novela') || lowerGrp.includes('dorama')) {
      return 'series';
    }

    if (lowerGrp.startsWith('filmes') || lowerGrp.startsWith('filme') || lowerGrp.includes('cinema') || lowerGrp.includes('shows')) {
      return 'filmes';
    }

    // 3. Fallback based on video file extensions
    const hasVideoExt = lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.mkv') || lowerUrl.endsWith('.avi');
    if (!hasVideoExt) {
      return 'canais'; // Live streams usually don't have static video extensions in Xtream
    }

    return 'filmes';
  }

  function updateProgress(percent, text) {
    dom.progressBar.style.width = `${percent}%`;
    dom.progressPercent.textContent = `${percent}%`;
    dom.progressText.textContent = text;
  }

  // --- DASHBOARD & RENDERING ---
  function renderDashboard() {
    dom.managerSection.classList.remove('hidden');

    // Stats calculations
    let canaisCount = 0;
    let filmesCount = 0;
    let seriesCount = 0;

    let canaisCats = 0;
    let filmesCats = 0;
    let seriesCats = 0;

    state.categories.forEach((cat) => {
      if (cat.type === 'canais') {
        canaisCount += cat.count;
        canaisCats++;
      } else if (cat.type === 'filmes') {
        filmesCount += cat.count;
        filmesCats++;
      } else if (cat.type === 'series') {
        seriesCount += cat.count;
        seriesCats++;
      }
    });

    // Populate Stats Grid
    dom.statTotalItems.textContent = state.totalItems.toLocaleString();
    dom.statTotalCats.textContent = `${state.categories.size} categorias identificadas`;

    dom.statLiveItems.textContent = canaisCount.toLocaleString();
    dom.statLiveCats.textContent = `${canaisCats} categorias`;

    dom.statMovieItems.textContent = filmesCount.toLocaleString();
    dom.statMovieCats.textContent = `${filmesCats} categorias`;

    dom.statSeriesItems.textContent = seriesCount.toLocaleString();
    dom.statSeriesCats.textContent = `${seriesCats} categorias`;

    // Tab counters
    dom.tabCountAll.textContent = state.categories.size;
    dom.tabCountCanais.textContent = canaisCats;
    dom.tabCountFilmes.textContent = filmesCats;
    dom.tabCountSeries.textContent = seriesCats;

    // Update active source indicators & header buttons
    if (dom.activeSourceName) {
      dom.activeSourceName.textContent = state.fileName || 'Lista M3U';
    }
    if (dom.btnHeaderChangeSource) {
      dom.btnHeaderChangeSource.classList.remove('hidden');
    }

    // Render Category Cards
    renderCategoryGrids();
    updateExportSummary();
  }

  function renderCategoryGrids() {
    dom.gridCanais.innerHTML = '';
    dom.gridFilmes.innerHTML = '';
    dom.gridSeries.innerHTML = '';

    // Sort categories by item count descending
    const sorted = Array.from(state.categories.values()).sort((a, b) => b.count - a.count);

    sorted.forEach((cat) => {
      const card = createCategoryCard(cat);
      if (cat.type === 'canais') {
        dom.gridCanais.appendChild(card);
      } else if (cat.type === 'filmes') {
        dom.gridFilmes.appendChild(card);
      } else if (cat.type === 'series') {
        dom.gridSeries.appendChild(card);
      }
    });

    updateSectionHeaders();
  }

  function createCategoryCard(cat) {
    const card = document.createElement('div');
    card.className = `category-card cat-type-${cat.type} ${cat.selected ? 'selected' : ''}`;
    card.id = `card-${cat.id}`;
    card.setAttribute('data-name', cat.name.toLowerCase());
    card.setAttribute('data-type', cat.type);

    card.innerHTML = `
      <div class="cat-info">
        <div class="cat-title" title="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</div>
        <div class="cat-meta">
          <span class="cat-count">${cat.count.toLocaleString()} itens</span>
        </div>
      </div>
      <label class="toggle-switch" title="Ativar/Desativar categoria">
        <input type="checkbox" id="toggle-${cat.id}" ${cat.selected ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    `;

    const checkbox = card.querySelector(`#toggle-${cat.id}`);

    // Card click toggles checkbox
    card.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      cat.selected = checkbox.checked;
      card.classList.toggle('selected', cat.selected);
      updateExportSummary();
      updateSectionHeaders();
    });

    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      cat.selected = checkbox.checked;
      card.classList.toggle('selected', cat.selected);
      updateExportSummary();
      updateSectionHeaders();
    });

    return card;
  }

  function updateSectionHeaders() {
    const counts = {
      canais: { total: 0, selected: 0 },
      filmes: { total: 0, selected: 0 },
      series: { total: 0, selected: 0 }
    };

    state.categories.forEach((cat) => {
      counts[cat.type].total++;
      if (cat.selected) counts[cat.type].selected++;
    });

    dom.canaisSummary.textContent = `${counts.canais.selected} de ${counts.canais.total} selecionadas`;
    dom.filmesSummary.textContent = `${counts.filmes.selected} de ${counts.filmes.total} selecionadas`;
    dom.seriesSummary.textContent = `${counts.series.selected} de ${counts.series.total} selecionadas`;

    updateSectionToggleButton(dom.btnToggleCanais, counts.canais);
    updateSectionToggleButton(dom.btnToggleFilmes, counts.filmes);
    updateSectionToggleButton(dom.btnToggleSeries, counts.series);
  }

  function updateSectionToggleButton(btn, countObj) {
    if (countObj.selected === 0) {
      btn.textContent = 'Marcar Todas';
      btn.setAttribute('data-checked', 'false');
    } else {
      btn.textContent = 'Desmarcar Todas';
      btn.setAttribute('data-checked', 'true');
    }
  }

  // --- SELECTION LOGIC ---
  function toggleAllCategories(selectState) {
    state.categories.forEach((cat) => {
      cat.selected = selectState;
      const checkbox = document.getElementById(`toggle-${cat.id}`);
      const card = document.getElementById(`card-${cat.id}`);
      if (checkbox) checkbox.checked = selectState;
      if (card) card.classList.toggle('selected', selectState);
    });

    updateExportSummary();
    updateSectionHeaders();
  }

  function toggleSectionCategories(type, btn) {
    const isChecked = btn.getAttribute('data-checked') === 'true';
    const targetState = !isChecked;

    state.categories.forEach((cat) => {
      if (cat.type === type) {
        cat.selected = targetState;
        const checkbox = document.getElementById(`toggle-${cat.id}`);
        const card = document.getElementById(`card-${cat.id}`);
        if (checkbox) checkbox.checked = targetState;
        if (card) card.classList.toggle('selected', targetState);
      }
    });

    updateExportSummary();
    updateSectionHeaders();
  }

  function updateExportSummary() {
    let selectedCats = 0;
    let selectedItems = 0;

    state.categories.forEach((cat) => {
      if (cat.selected) {
        selectedCats++;
        selectedItems += cat.count;
      }
    });

    dom.selectedCatsBadge.textContent = selectedCats.toLocaleString();
    dom.selectedItemsBadge.textContent = `${selectedItems.toLocaleString()} itens`;

    dom.btnGenerateZip.disabled = selectedCats === 0;
  }

  // --- FILTER & SEARCH ---
  function handleSearch(e) {
    state.searchTerm = e.target.value.trim().toLowerCase();
    dom.btnClearSearch.classList.toggle('hidden', state.searchTerm === '');
    filterRenderedCards();
    updateFilterVisibility();
  }

  function filterRenderedCards() {
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card) => {
      const name = card.getAttribute('data-name');
      const matchesSearch = state.searchTerm === '' || name.includes(state.searchTerm);
      card.style.display = matchesSearch ? 'flex' : 'none';
    });
  }

  function applyTypeFilter() {
    const type = state.selectedTypeFilter;
    if (type === 'all') {
      dom.sectionCanais.style.display = 'flex';
      dom.sectionFilmes.style.display = 'flex';
      dom.sectionSeries.style.display = 'flex';
    } else {
      dom.sectionCanais.style.display = type === 'canais' ? 'flex' : 'none';
      dom.sectionFilmes.style.display = type === 'filmes' ? 'flex' : 'none';
      dom.sectionSeries.style.display = type === 'series' ? 'flex' : 'none';
    }
  }

  function updateFilterVisibility() {
    const isFiltered = (state.searchTerm && state.searchTerm !== '') || state.selectedTypeFilter !== 'all';
    if (dom.btnClearFilter) {
      dom.btnClearFilter.classList.toggle('hidden', !isFiltered);
    }
  }

  function clearAllFilters() {
    dom.categorySearch.value = '';
    state.searchTerm = '';
    dom.btnClearSearch.classList.add('hidden');

    // Reset filter tabs to 'all'
    state.selectedTypeFilter = 'all';
    dom.filterTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-type') === 'all');
    });

    applyTypeFilter();
    filterRenderedCards();
    updateFilterVisibility();
  }

  function updateExportButtonLabel(mode) {
    if (!dom.btnExportLabel) return;
    if (dom.exportSubOptions) {
      dom.exportSubOptions.classList.toggle('hidden', mode !== 'individual');
    }
    if (mode === 'single') {
      dom.btnExportLabel.textContent = 'Baixar Arquivo Único (.m3u8)';
    } else if (mode === 'macro') {
      dom.btnExportLabel.textContent = 'Baixar Categorias Mestres (.zip)';
    } else if (mode === 'individual') {
      dom.btnExportLabel.textContent = 'Baixar Categorias Filhas (.zip)';
    }
  }

  function downloadBlob(blob, filename) {
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  }

  // --- EXPORT LOGIC ---
  async function handleExportZip() {
    const selected = Array.from(state.categories.values()).filter((c) => c.selected);
    if (selected.length === 0) {
      alert('Selecione ao menos uma categoria para exportar.');
      return;
    }

    const modeRadio = document.querySelector('input[name="export-mode"]:checked');
    const mode = modeRadio ? modeRadio.value : 'single';
    const dateStr = new Date().toISOString().slice(0, 10);
    const baseName = state.fileName || 'm3u';

    // ========================================================
    // 1. ARQUIVO ÚNICO (Download direto sem zip com tudo que foi selecionado)
    // ========================================================
    if (mode === 'single') {
      let singleContent = '#EXTM3U\n';
      let hasCanais = false;
      let hasFilmes = false;
      let hasSeries = false;

      for (const cat of selected) {
        if (cat.type === 'canais') hasCanais = true;
        if (cat.type === 'filmes') hasFilmes = true;
        if (cat.type === 'series') hasSeries = true;

        for (let j = 0; j < cat.items.length; j++) {
          const item = cat.items[j];
          singleContent += `${item.inf}\n${item.url}\n`;
        }
      }

      // Nome inteligente de acordo com o que foi selecionado
      let singleFileName = `${baseName}_selecionado_${dateStr}.m3u8`;
      if (hasCanais && !hasFilmes && !hasSeries) {
        singleFileName = `${baseName}_todos_canais_${dateStr}.m3u8`;
      } else if (hasFilmes && !hasCanais && !hasSeries) {
        singleFileName = `${baseName}_todos_filmes_${dateStr}.m3u8`;
      } else if (hasSeries && !hasCanais && !hasFilmes) {
        singleFileName = `${baseName}_todas_series_${dateStr}.m3u8`;
      }

      // Download nativo direto do arquivo .m3u8
      const blob = new Blob([singleContent], { type: 'audio/x-mpegurl;charset=utf-8' });
      downloadBlob(blob, singleFileName);
      return;
    }

    // ========================================================
    // MODOS MULTI-ARQUIVOS (ZIP)
    // ========================================================
    if (typeof JSZip === 'undefined') {
      alert('Biblioteca JSZip não carregada. Verifique a conexão.');
      return;
    }

    dom.zipModal.classList.remove('hidden');
    updateZipProgress(5, 'Iniciando preparação dos arquivos...');

    const zip = new JSZip();

    // ========================================================
    // 2. SEPARADO POR CANAIS/FILMES/SÉRIES
    // 1 Arquivo para cada categoria mestre contendo todos os links
    // ========================================================
    if (mode === 'macro') {
      const masters = {
        canais: [],
        filmes: [],
        series: []
      };

      for (const cat of selected) {
        for (let j = 0; j < cat.items.length; j++) {
          const item = cat.items[j];
          masters[cat.type].push(`${item.inf}\n${item.url}\n`);
        }
      }

      let masterCount = 0;
      if (masters.canais.length > 0) {
        zip.file('01_TODOS_CANAIS.m3u8', '#EXTM3U\n' + masters.canais.join(''));
        masterCount++;
      }
      if (masters.filmes.length > 0) {
        zip.file('02_TODOS_FILMES.m3u8', '#EXTM3U\n' + masters.filmes.join(''));
        masterCount++;
      }
      if (masters.series.length > 0) {
        zip.file('03_TODAS_SERIES.m3u8', '#EXTM3U\n' + masters.series.join(''));
        masterCount++;
      }

      updateZipProgress(65, `Gerados ${masterCount} arquivo(s) mestre(s)...`);
    }

    // ========================================================
    // 3. SEPARADO POR CATEGORIAS FILHAS
    // Cada categoria filha tem seu arquivo separado em uma pasta com o nome da mestre
    // ========================================================
    else if (mode === 'individual') {
      const useFolders = dom.optFolderStructure ? dom.optFolderStructure.checked : true;
      const includeMasters = dom.optMacroMasterFiles ? dom.optMacroMasterFiles.checked : false;

      const typeFolders = { canais: 'Canais', filmes: 'Filmes', series: 'Series' };
      const masters = { canais: [], filmes: [], series: [] };

      for (let i = 0; i < selected.length; i++) {
        const cat = selected[i];
        let content = '#EXTM3U\n';
        for (let j = 0; j < cat.items.length; j++) {
          const item = cat.items[j];
          const entry = `${item.inf}\n${item.url}\n`;
          content += entry;
          if (includeMasters) {
            masters[cat.type].push(entry);
          }
        }

        const fileName = `${cat.cleanName}.m3u8`;
        if (useFolders) {
          const folder = typeFolders[cat.type] || 'Outros';
          zip.folder(folder).file(fileName, content);
        } else {
          zip.file(`${typeFolders[cat.type]}_${fileName}`, content);
        }

        const progress = Math.min(65, Math.floor(5 + ((i + 1) / selected.length) * 60));
        updateZipProgress(progress, `Processando ${cat.name} (${i + 1}/${selected.length})...`);
      }

      // Se a opção "Gerar arquivos mestres unificados" estiver marcada:
      if (includeMasters) {
        updateZipProgress(70, 'Incluindo arquivos mestres unificados no pacote...');
        if (masters.canais.length > 0) zip.file('00_TODOS_CANAIS.m3u8', '#EXTM3U\n' + masters.canais.join(''));
        if (masters.filmes.length > 0) zip.file('00_TODOS_FILMES.m3u8', '#EXTM3U\n' + masters.filmes.join(''));
        if (masters.series.length > 0) zip.file('00_TODAS_SERIES.m3u8', '#EXTM3U\n' + masters.series.join(''));
      }
    }

    // Comprimir e baixar ZIP
    updateZipProgress(75, 'Comprimindo pacote ZIP...');

    try {
      const blob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        },
        (metadata) => {
          const zipPercent = Math.min(99, Math.floor(75 + metadata.percent * 0.24));
          updateZipProgress(zipPercent, `Comprimindo: ${metadata.percent.toFixed(0)}%`);
        }
      );

      updateZipProgress(100, 'Download pronto!');

      const zipName = `${baseName}_${mode}_${dateStr}.zip`;
      downloadBlob(blob, zipName);

      setTimeout(() => {
        dom.zipModal.classList.add('hidden');
      }, 700);
    } catch (err) {
      console.error(err);
      alert('Erro ao comprimir o arquivo ZIP.');
      dom.zipModal.classList.add('hidden');
    }
  }

  function updateZipProgress(percent, text) {
    dom.zipProgressBar.style.width = `${percent}%`;
    dom.zipProgressPercent.textContent = `${percent}%`;
    dom.zipProgressText.textContent = text;
  }

  // --- RESET ---
  function resetApplication() {
    state.fileName = '';
    state.totalItems = 0;
    state.categories.clear();
    state.isProcessing = false;

    clearAllFilters();

    dom.fileInput.value = '';
    if (dom.m3uUrlInput) dom.m3uUrlInput.value = '';

    dom.managerSection.classList.add('hidden');
    dom.processingIndicator.classList.add('hidden');

    if (dom.btnHeaderChangeSource) {
      dom.btnHeaderChangeSource.classList.add('hidden');
    }
    if (dom.sourceModeNav) {
      dom.sourceModeNav.classList.remove('hidden');
    }

    setSourceMode('file');
  }

  // --- HELPERS ---
  function sanitizeFilename(name) {
    return name
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .trim() || 'categoria';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
