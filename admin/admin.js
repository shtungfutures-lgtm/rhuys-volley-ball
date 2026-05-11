const tokenKey = 'rvb-admin-token';
const state = {
  articles: [],
  products: [],
  teams: [],
  training: [],
  partners: [],
  gallery: [],
  pages: [],
  currentImages: {
    article: '',
    product: '',
    team: '',
    partner: '',
    photo: '',
    page: '',
  },
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];
const getValue = (selector) => qs(selector)?.value.trim() || '';
const setValue = (selector, value) => {
  const field = qs(selector);
  if (field) field.value = value || '';
};

const loginPanel = qs('#login-panel');
const editorPanel = qs('#editor-panel');
const loginForm = qs('#login-form');
const logoutButton = qs('#logout-button');
const dashboardMessage = qs('#dashboard-message');
const loginMessage = qs('#login-message');
const adminToast = qs('#admin-toast');
let toastTimer = null;

function getToken() {
  return localStorage.getItem(tokenKey) || '';
}

function setMessage(element, text, type = '') {
  if (!element) return;
  element.textContent = text;
  element.className = `admin-message ${type}`.trim();
}

function showToast(text, type = 'success') {
  if (!adminToast) return;
  window.clearTimeout(toastTimer);
  adminToast.hidden = false;
  adminToast.textContent = text;
  adminToast.className = `admin-toast ${type} show`.trim();
  toastTimer = window.setTimeout(() => {
    adminToast.classList.remove('show');
    adminToast.hidden = true;
  }, 2900);
}

function flashSaved(element) {
  if (!element) return;
  element.classList.remove('admin-saved-pulse');
  // Force a reflow so repeated saves replay the confirmation animation.
  void element.offsetWidth;
  element.classList.add('admin-saved-pulse');
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Enregistrement...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function markButtonSaved(button) {
  if (!button) return;
  const originalText = button.dataset.originalText || button.textContent;
  button.disabled = false;
  button.textContent = 'Enregistré ✓';
  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1300);
}

function showSaveFeedback(messageElement, text, savedElement, button) {
  setMessage(messageElement, text, 'success');
  showToast(`✓ ${text}`, 'success');
  flashSaved(savedElement);
  markButtonSaved(button);
}

function showErrorFeedback(messageElement, error) {
  const text = error?.message || 'Une erreur est survenue.';
  setMessage(messageElement, text, 'error');
  showToast(text, 'error');
}

function showEditor() {
  loginPanel.hidden = true;
  editorPanel.hidden = false;
}

function showLogin() {
  localStorage.removeItem(tokenKey);
  loginPanel.hidden = false;
  editorPanel.hidden = true;
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.join(', ') : String(value || '');
}

function setPreview(selector, src, alt = '') {
  const preview = qs(selector);
  if (!preview) return;

  if (src) {
    preview.src = src;
    preview.alt = alt;
    preview.hidden = false;
  } else {
    preview.hidden = true;
    preview.removeAttribute('src');
  }
}

function readImageFile(inputSelector, onRead) {
  const input = qs(inputSelector);
  const file = input?.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener('load', () => onRead(String(reader.result || '')));
  reader.readAsDataURL(file);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Une erreur est survenue.');
  }

  return payload;
}

async function saveContent(type, payload) {
  return apiRequest(`/api/admin/${type}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

function getArticleDateKey(value) {
  const match = String(value || '').match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    return match[0];
  }

  const timestamp = Date.parse(value || '');
  if (Number.isNaN(timestamp)) {
    return '';
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function getArticleTime(article) {
  const dateKey = getArticleDateKey(article.date);
  return dateKey ? Date.parse(`${dateKey}T12:00:00`) : 0;
}

function getArticleAddedTime(article) {
  const createdAt = Date.parse(article.created_at || article.createdAt || '');
  if (!Number.isNaN(createdAt)) {
    return createdAt;
  }

  const numericId = Number(article.id);
  if (Number.isFinite(numericId) && numericId > 0) {
    return numericId;
  }

  return getArticleTime(article);
}

function sortArticlesByNewest(list) {
  return [...list].sort((a, b) => {
    const addedDiff = getArticleAddedTime(b) - getArticleAddedTime(a);
    if (addedDiff !== 0) {
      return addedDiff;
    }

    return getArticleTime(b) - getArticleTime(a);
  });
}

function createListButton({ title, meta, active, onClick }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `article-list-button ${active ? 'active' : ''}`.trim();
  button.innerHTML = `<strong>${title || 'Sans titre'}</strong><span>${meta || ''}</span>`;
  button.addEventListener('click', onClick);
  return button;
}

function renderGenericList(rootSelector, items, activeId, getTitle, getMeta, onClick) {
  const root = qs(rootSelector);
  if (!root) return;
  root.innerHTML = '';

  if (!items.length) {
    root.innerHTML = '<p>Aucun élément pour le moment.</p>';
    return;
  }

  items.forEach((item) => {
    root.appendChild(
      createListButton({
        title: getTitle(item),
        meta: getMeta(item),
        active: (item.id || item.slug) === activeId,
        onClick: () => onClick(item),
      })
    );
  });
}

function emptyArticle() {
  const now = new Date().toISOString();

  return {
    id: String(Date.now()),
    title: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Club',
    featured_image: '',
    excerpt: '',
    body: '',
    author: 'RHUYS VOLLEY BALL',
    created_at: now,
    updated_at: now,
  };
}

function fillArticle(article) {
  setValue('#article-id', article.id);
  setValue('#article-title', article.title);
  setValue('#article-date', article.date);
  setValue('#article-category', article.category);
  setValue('#article-author', article.author || 'RHUYS VOLLEY BALL');
  setValue('#article-excerpt', article.excerpt);
  setValue('#article-body', article.body);
  state.currentImages.article = article.featured_image || article.image || '';
  const imageInput = qs('#article-image');
  if (imageInput) imageInput.value = '';
  setPreview('#article-preview', state.currentImages.article, article.title);
  renderArticles(article.id);
}

function readArticle() {
  const id = getValue('#article-id') || String(Date.now());
  const existingArticle = state.articles.find((article) => article.id === id);
  const now = new Date().toISOString();

  return {
    id,
    title: getValue('#article-title'),
    date: getArticleDateKey(getValue('#article-date')) || new Date().toISOString().slice(0, 10),
    category: getValue('#article-category'),
    featured_image: state.currentImages.article,
    excerpt: getValue('#article-excerpt'),
    body: getValue('#article-body'),
    author: getValue('#article-author') || 'RHUYS VOLLEY BALL',
    created_at: existingArticle?.created_at || existingArticle?.createdAt || now,
    updated_at: now,
  };
}

function renderArticles(activeId = '') {
  state.articles = sortArticlesByNewest(state.articles);
  renderGenericList(
    '#articles-list',
    state.articles,
    activeId,
    (article) => article.title,
    (article) => `${article.date || 'Sans date'} - ${article.category || 'Club'}`,
    fillArticle
  );
}

async function saveArticles() {
  state.articles = sortArticlesByNewest(state.articles);
  await apiRequest('/api/admin/articles', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: state.articles }),
  });
}

function emptyProduct() {
  return {
    id: String(Date.now()),
    name: '',
    image: '',
    price: '',
    sizes: [],
    colors: [],
    shortDescription: '',
    detailedDescription: '',
    stripeLink: '',
    priceId: '',
    status: 'indisponible',
  };
}

function fillProduct(product) {
  setValue('#product-id', product.id);
  setValue('#product-name', product.name);
  setValue('#product-price', product.price);
  setValue('#product-status', product.status || product.statut || 'indisponible');
  setValue('#product-image', product.image);
  setValue('#product-sizes', joinList(product.sizes));
  setValue('#product-colors', joinList(product.colors));
  setValue('#product-short', product.shortDescription);
  setValue('#product-detail', product.detailedDescription);
  setValue('#product-stripe-link', product.stripeLink || product.stripeTestLink || '');
  setValue('#product-price-id', product.priceId);
  state.currentImages.product = product.image || '';
  const input = qs('#product-image-file');
  if (input) input.value = '';
  setPreview('#product-preview', state.currentImages.product, product.name);
  renderProducts(product.id);
}

function readProduct() {
  const name = getValue('#product-name');
  return {
    id: getValue('#product-id') || toSlug(name) || String(Date.now()),
    name,
    image: getValue('#product-image') || state.currentImages.product,
    price: getValue('#product-price'),
    sizes: splitList(getValue('#product-sizes')),
    colors: splitList(getValue('#product-colors')),
    shortDescription: getValue('#product-short'),
    detailedDescription: getValue('#product-detail'),
    stripeLink: getValue('#product-stripe-link'),
    priceId: getValue('#product-price-id'),
    status: getValue('#product-status') || 'indisponible',
  };
}

function renderProducts(activeId = '') {
  renderGenericList(
    '#products-list',
    state.products,
    activeId,
    (product) => product.name,
    (product) => `${product.price || 'Prix non renseigné'} - ${product.status || 'indisponible'}`,
    fillProduct
  );
}

function emptyTeam() {
  return {
    id: String(Date.now()),
    name: '',
    age: '',
    schedule: '',
    location: '',
    image: '',
    description: '',
    highlights: [],
  };
}

function fillTeam(team) {
  setValue('#team-id', team.id);
  setValue('#team-name', team.name);
  setValue('#team-age', team.age);
  setValue('#team-schedule', team.schedule);
  setValue('#team-location', team.location);
  setValue('#team-image', team.image);
  setValue('#team-description', team.description);
  setValue('#team-highlights', Array.isArray(team.highlights) ? team.highlights.join('\n') : joinList(team.highlights));
  state.currentImages.team = team.image || '';
  const input = qs('#team-image-file');
  if (input) input.value = '';
  setPreview('#team-preview', state.currentImages.team, team.name);
  renderTeams(team.id);
}

function readTeam() {
  const name = getValue('#team-name');
  return {
    id: getValue('#team-id') || toSlug(name) || String(Date.now()),
    name,
    age: getValue('#team-age'),
    schedule: getValue('#team-schedule'),
    location: getValue('#team-location'),
    image: getValue('#team-image') || state.currentImages.team,
    description: getValue('#team-description'),
    highlights: getValue('#team-highlights')
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function renderTeams(activeId = '') {
  renderGenericList(
    '#teams-list',
    state.teams,
    activeId,
    (team) => team.name,
    (team) => `${team.age || 'Âge non renseigné'} - ${team.location || 'Lieu non renseigné'}`,
    fillTeam
  );
}

function emptyTrainingSlot() {
  return {
    id: String(Date.now()),
    team: '',
    age: '',
    day: 'Mercredi',
    time: '',
    location: '',
    venue: '',
    description: '',
  };
}

function fillTrainingSlot(slot) {
  setValue('#training-id', slot.id);
  setValue('#training-team', slot.team);
  setValue('#training-age', slot.age);
  setValue('#training-day', slot.day || 'Mercredi');
  setValue('#training-time', slot.time);
  setValue('#training-location', slot.location);
  setValue('#training-venue', slot.venue);
  setValue('#training-description', slot.description);
  renderTraining(slot.id);
}

function readTrainingSlot() {
  const team = getValue('#training-team');
  return {
    id: getValue('#training-id') || toSlug(team) || String(Date.now()),
    team,
    age: getValue('#training-age'),
    day: getValue('#training-day'),
    time: getValue('#training-time'),
    location: getValue('#training-location'),
    venue: getValue('#training-venue'),
    description: getValue('#training-description'),
  };
}

function renderTraining(activeId = '') {
  renderGenericList(
    '#training-list',
    state.training,
    activeId,
    (slot) => slot.team,
    (slot) => `${slot.day || 'Jour non renseigné'} ${slot.time || ''} - ${slot.location || 'Lieu non renseigné'}`,
    fillTrainingSlot
  );
}

function emptyPartner() {
  return { id: String(Date.now()), name: '', logo: '', category: 'Partenaire local', description: '', website: '' };
}

function fillPartner(partner) {
  setValue('#partner-id', partner.id);
  setValue('#partner-name', partner.name);
  setValue('#partner-category', partner.category);
  setValue('#partner-logo', partner.logo);
  setValue('#partner-description', partner.description);
  setValue('#partner-website', partner.website);
  state.currentImages.partner = partner.logo || '';
  const input = qs('#partner-logo-file');
  if (input) input.value = '';
  setPreview('#partner-preview', state.currentImages.partner, partner.name);
  renderPartners(partner.id);
}

function readPartner() {
  const name = getValue('#partner-name');
  return {
    id: getValue('#partner-id') || toSlug(name) || String(Date.now()),
    name,
    category: getValue('#partner-category'),
    logo: getValue('#partner-logo') || state.currentImages.partner,
    description: getValue('#partner-description'),
    website: getValue('#partner-website'),
  };
}

function renderPartners(activeId = '') {
  renderGenericList(
    '#partners-list',
    state.partners,
    activeId,
    (partner) => partner.name,
    (partner) => partner.category,
    fillPartner
  );
}

function emptyPhoto() {
  return { id: String(Date.now()), title: '', image: '', description: '', category: 'Club' };
}

function fillPhoto(photo) {
  setValue('#photo-id', photo.id);
  setValue('#photo-title', photo.title);
  setValue('#photo-category', photo.category || 'Club');
  setValue('#photo-image', photo.image);
  setValue('#photo-description', photo.description);
  state.currentImages.photo = photo.image || '';
  const input = qs('#photo-image-file');
  if (input) input.value = '';
  setPreview('#photo-preview', state.currentImages.photo, photo.title);
  renderGallery(photo.id);
}

function readPhoto() {
  const title = getValue('#photo-title');
  return {
    id: getValue('#photo-id') || toSlug(title) || String(Date.now()),
    title,
    category: getValue('#photo-category'),
    image: getValue('#photo-image') || state.currentImages.photo,
    description: getValue('#photo-description'),
  };
}

function renderGallery(activeId = '') {
  renderGenericList(
    '#gallery-list',
    state.gallery,
    activeId,
    (photo) => photo.title,
    (photo) => `${photo.category || 'Club'} - ${photo.image ? 'image ajoutée' : 'image manquante'}`,
    fillPhoto
  );
}

function fillPage(page) {
  const pageNames = {
    index: 'Accueil',
    club: 'Le club',
    contact: 'Contact',
    equipes: 'Équipes',
    horaires: 'Horaires',
    calendrier: 'Calendrier',
    classements: 'Classements',
    actualites: 'Actualités',
    boutique: 'Boutique',
    partenaires: 'Partenaires',
  };
  const pageHelps = {
    index: 'Modifiez le message principal de la page d’accueil.',
    club: 'Modifiez le texte de présentation du club et son visuel.',
    contact: 'Modifiez le texte d’introduction de la page contact.',
    equipes: 'Modifiez l’introduction de la page des équipes.',
    horaires: 'Modifiez le titre et l’introduction de la page des horaires d’entraînement.',
    calendrier: 'Modifiez le texte de présentation du calendrier.',
    classements: 'Modifiez le texte de présentation des classements.',
    actualites: 'Modifiez le texte d’introduction des actualités.',
    boutique: 'Modifiez le texte d’introduction de la boutique.',
    partenaires: 'Modifiez le texte d’introduction des partenaires.',
  };
  const label = pageNames[page.slug] || page.slug;

  setValue('#page-slug', page.slug);
  setValue('#page-label', label);
  setValue('#page-title', page.title);
  setValue('#page-content', page.content);
  setValue('#page-image', page.image);
  const editorTitle = qs('#page-editor-title');
  const editorHelp = qs('#page-editor-help');
  if (editorTitle) editorTitle.textContent = `Modifier la page ${label}`;
  if (editorHelp) editorHelp.textContent = pageHelps[page.slug] || 'Modifiez les textes principaux de cette page.';
  state.currentImages.page = page.image || '';
  const input = qs('#page-image-file');
  if (input) input.value = '';
  setPreview('#page-preview', state.currentImages.page, page.title);
  renderPages(page.slug);
}

function readPage() {
  return {
    slug: getValue('#page-slug') || 'index',
    title: getValue('#page-title'),
    content: getValue('#page-content'),
    image: getValue('#page-image') || state.currentImages.page,
  };
}

function renderPages(activeSlug = '') {
  const pageNames = {
    index: 'Accueil',
    club: 'Le club',
    contact: 'Contact',
    equipes: 'Équipes',
    horaires: 'Horaires',
    calendrier: 'Calendrier',
    classements: 'Classements',
    actualites: 'Actualités',
    boutique: 'Boutique',
    partenaires: 'Partenaires',
  };

  renderGenericList(
    '#pages-list',
    state.pages,
    activeSlug,
    (page) => pageNames[page.slug] || page.slug.charAt(0).toUpperCase() + page.slug.slice(1),
    (page) => page.title || 'Titre à compléter',
    fillPage
  );
}

async function loadDashboard() {
  setMessage(dashboardMessage, 'Chargement des contenus...');
  const [articles, products, teams, training, partners, gallery, pages] = await Promise.all([
    apiRequest('/api/admin/articles'),
    apiRequest('/api/admin/products'),
    apiRequest('/api/admin/teams'),
    apiRequest('/api/admin/training'),
    apiRequest('/api/admin/partners'),
    apiRequest('/api/admin/gallery'),
    apiRequest('/api/admin/pages'),
  ]);

  state.articles = sortArticlesByNewest(articles.articles || []);
  state.products = products.products || [];
  state.teams = teams.teams || [];
  state.training = training.training || [];
  state.partners = partners.partners || [];
  state.gallery = gallery.gallery || [];
  state.pages = pages.pages && pages.pages.length ? pages.pages : [
    { slug: 'index', title: 'Accueil', content: '', image: '' },
    { slug: 'club', title: 'Le club', content: '', image: '' },
    { slug: 'horaires', title: 'Horaires', content: '', image: '' },
    { slug: 'contact', title: 'Contact', content: '', image: '' },
  ];
  showEditor();
  fillArticle(state.articles[0] || emptyArticle());
  fillProduct(state.products[0] || emptyProduct());
  fillTeam(state.teams[0] || emptyTeam());
  fillTrainingSlot(state.training[0] || emptyTrainingSlot());
  fillPartner(state.partners[0] || emptyPartner());
  fillPhoto(state.gallery[0] || emptyPhoto());
  fillPage(state.pages[0]);
  setMessage(dashboardMessage, 'Contenus chargés.', 'success');
}

function activateTab(tabName) {
  qsa('.admin-tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tabName));
  qsa('.admin-section').forEach((section) => section.classList.toggle('active', section.dataset.section === tabName));
}

function upsertItem(collection, item, idKey = 'id') {
  const index = collection.findIndex((entry) => entry[idKey] === item[idKey]);
  if (index >= 0) collection[index] = item;
  else collection.push(item);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(loginMessage, 'Connexion en cours...');

  try {
    const payload = await apiRequest('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: getValue('#admin-username'), password: getValue('#admin-password') }),
    });
    localStorage.setItem(tokenKey, payload.token);
    setMessage(loginMessage, '');
    await loadDashboard();
  } catch (error) {
    setMessage(loginMessage, error.message || 'Connexion impossible.', 'error');
  }
});

logoutButton.addEventListener('click', showLogin);
qsa('.admin-tab').forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.tab)));

qs('#new-article-button').addEventListener('click', () => fillArticle(emptyArticle()));
qs('#new-product-button').addEventListener('click', () => fillProduct(emptyProduct()));
qs('#new-team-button').addEventListener('click', () => fillTeam(emptyTeam()));
qs('#new-training-button').addEventListener('click', () => fillTrainingSlot(emptyTrainingSlot()));
qs('#new-partner-button').addEventListener('click', () => fillPartner(emptyPartner()));
qs('#new-photo-button').addEventListener('click', () => fillPhoto(emptyPhoto()));

qs('#article-image').addEventListener('change', () => readImageFile('#article-image', (src) => {
  state.currentImages.article = src;
  setPreview('#article-preview', src, getValue('#article-title'));
}));
qs('#product-image-file').addEventListener('change', () => readImageFile('#product-image-file', (src) => {
  state.currentImages.product = src;
  setValue('#product-image', src);
  setPreview('#product-preview', src, getValue('#product-name'));
}));
qs('#team-image-file').addEventListener('change', () => readImageFile('#team-image-file', (src) => {
  state.currentImages.team = src;
  setValue('#team-image', src);
  setPreview('#team-preview', src, getValue('#team-name'));
}));
qs('#partner-logo-file').addEventListener('change', () => readImageFile('#partner-logo-file', (src) => {
  state.currentImages.partner = src;
  setValue('#partner-logo', src);
  setPreview('#partner-preview', src, getValue('#partner-name'));
}));
qs('#photo-image-file').addEventListener('change', () => readImageFile('#photo-image-file', (src) => {
  state.currentImages.photo = src;
  setValue('#photo-image', src);
  setPreview('#photo-preview', src, getValue('#photo-title'));
}));
qs('#page-image-file').addEventListener('change', () => readImageFile('#page-image-file', (src) => {
  state.currentImages.page = src;
  setValue('#page-image', src);
  setPreview('#page-preview', src, getValue('#page-title'));
}));

qs('#article-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readArticle();
  upsertItem(state.articles, item);
  try {
    await saveArticles();
    fillArticle(item);
    showSaveFeedback(qs('#editor-message'), 'Article enregistré. Il est visible sur le site.', qs('#article-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#editor-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readProduct();
  upsertItem(state.products, item);
  try {
    await saveContent('products', { products: state.products });
    fillProduct(item);
    showSaveFeedback(qs('#product-message'), 'Produit enregistré. La boutique est mise à jour.', qs('#product-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#product-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#team-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readTeam();
  upsertItem(state.teams, item);
  try {
    await saveContent('teams', { teams: state.teams });
    fillTeam(item);
    showSaveFeedback(qs('#team-message'), 'Équipe enregistrée. La page Équipes est mise à jour.', qs('#team-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#team-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#training-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readTrainingSlot();
  upsertItem(state.training, item);
  try {
    await saveContent('training', { training: state.training });
    fillTrainingSlot(item);
    showSaveFeedback(qs('#training-message'), 'Créneau enregistré. La page Horaires est mise à jour.', qs('#training-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#training-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#partner-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readPartner();
  upsertItem(state.partners, item);
  try {
    await saveContent('partners', { partners: state.partners });
    fillPartner(item);
    showSaveFeedback(qs('#partner-message'), 'Partenaire enregistré.', qs('#partner-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#partner-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#gallery-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readPhoto();
  upsertItem(state.gallery, item);
  try {
    await saveContent('gallery', { gallery: state.gallery });
    fillPhoto(item);
    showSaveFeedback(qs('#gallery-message'), 'Photo enregistrée.', qs('#gallery-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#gallery-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#page-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  setButtonLoading(submitButton, true);
  const item = readPage();
  upsertItem(state.pages, item, 'slug');
  try {
    await saveContent('pages', { pages: state.pages });
    fillPage(item);
    showSaveFeedback(qs('#page-message'), 'Page enregistrée.', qs('#page-form'), submitButton);
  } catch (error) {
    showErrorFeedback(qs('#page-message'), error);
    setButtonLoading(submitButton, false);
  }
});

qs('#delete-article-button').addEventListener('click', async () => {
  const id = getValue('#article-id');
  const item = state.articles.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Supprimer l’article "${item.title}" ?`)) return;
  state.articles = state.articles.filter((entry) => entry.id !== id);
  await saveArticles();
  fillArticle(state.articles[0] || emptyArticle());
});

qs('#delete-product-button').addEventListener('click', async () => {
  const id = getValue('#product-id');
  const item = state.products.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Supprimer le produit "${item.name}" ?`)) return;
  state.products = state.products.filter((entry) => entry.id !== id);
  await saveContent('products', { products: state.products });
  fillProduct(state.products[0] || emptyProduct());
});

qs('#delete-team-button').addEventListener('click', async () => {
  const id = getValue('#team-id');
  const item = state.teams.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Supprimer l’équipe "${item.name}" ?`)) return;
  state.teams = state.teams.filter((entry) => entry.id !== id);
  await saveContent('teams', { teams: state.teams });
  fillTeam(state.teams[0] || emptyTeam());
});

qs('#delete-training-button').addEventListener('click', async () => {
  const id = getValue('#training-id');
  const item = state.training.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Supprimer le créneau "${item.team}" ?`)) return;
  state.training = state.training.filter((entry) => entry.id !== id);
  await saveContent('training', { training: state.training });
  fillTrainingSlot(state.training[0] || emptyTrainingSlot());
});

qs('#delete-partner-button').addEventListener('click', async () => {
  const id = getValue('#partner-id');
  const item = state.partners.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Supprimer le partenaire "${item.name}" ?`)) return;
  state.partners = state.partners.filter((entry) => entry.id !== id);
  await saveContent('partners', { partners: state.partners });
  fillPartner(state.partners[0] || emptyPartner());
});

qs('#delete-photo-button').addEventListener('click', async () => {
  const id = getValue('#photo-id');
  const item = state.gallery.find((entry) => entry.id === id);
  if (!item || !window.confirm(`Supprimer la photo "${item.title}" ?`)) return;
  state.gallery = state.gallery.filter((entry) => entry.id !== id);
  await saveContent('gallery', { gallery: state.gallery });
  fillPhoto(state.gallery[0] || emptyPhoto());
});

if (getToken()) {
  loadDashboard().catch(() => showLogin());
}
