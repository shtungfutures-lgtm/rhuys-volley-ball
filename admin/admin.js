const tokenKey = 'rvb-admin-token';
const state = {
  articles: [],
  products: [],
  partners: [],
  gallery: [],
  pages: [],
  orders: [],
  currentImages: {
    article: '',
    product: '',
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

function getToken() {
  return localStorage.getItem(tokenKey) || '';
}

function setMessage(element, text, type = '') {
  if (!element) return;
  element.textContent = text;
  element.className = `admin-message ${type}`.trim();
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

function getArticleTime(article) {
  const time = Date.parse(`${article.date || ''}T12:00:00`);
  return Number.isNaN(time) ? 0 : time;
}

function sortArticlesByNewest(list) {
  return [...list].sort((a, b) => getArticleTime(b) - getArticleTime(a));
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
  return {
    id: String(Date.now()),
    title: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Club',
    featured_image: '',
    excerpt: '',
    body: '',
    author: 'RHUYS VOLLEY BALL',
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
  return {
    id: getValue('#article-id') || String(Date.now()),
    title: getValue('#article-title'),
    date: getValue('#article-date'),
    category: getValue('#article-category'),
    featured_image: state.currentImages.article,
    excerpt: getValue('#article-excerpt'),
    body: getValue('#article-body'),
    author: getValue('#article-author') || 'RHUYS VOLLEY BALL',
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

function formatOrderDate(isoDate) {
  const timestamp = Date.parse(isoDate || '');
  return Number.isNaN(timestamp)
    ? 'Date inconnue'
    : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
}

function formatOrderAmount(amountTotal = 0, currency = 'eur') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: String(currency || 'eur').toUpperCase() }).format(
    Number(amountTotal || 0) / 100
  );
}

function renderOrders() {
  const root = qs('#orders-list');
  if (!root) return;
  root.innerHTML = '';

  if (!state.orders.length) {
    root.innerHTML = '<p>Aucune commande pour le moment.</p>';
    return;
  }

  state.orders.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'order-item';
    const lineItems = Array.isArray(order.lineItems)
      ? order.lineItems.map((item) => `${item.description || 'Produit'} x${item.quantity || 1}`).join(' • ')
      : 'Détail produit indisponible';
    const selected = order.selectedOptions || {};
    const options = [selected.size && `Taille: ${selected.size}`, selected.color && `Couleur: ${selected.color}`, selected.quantity && `Quantité: ${selected.quantity}`]
      .filter(Boolean)
      .join(' • ');

    card.innerHTML = `
      <div>
        <strong>${formatOrderAmount(order.amountTotal, order.currency)}</strong>
        <p>${lineItems}</p>
        <p>${options || 'Options non renseignées'}</p>
      </div>
      <div>
        <p>${order.customerName || 'Client non renseigné'}</p>
        <p>${order.customerEmail || 'Email non renseigné'}</p>
        <p>${formatOrderDate(order.purchasedAt || order.createdAt)}</p>
      </div>
    `;
    root.appendChild(card);
  });
}

async function loadDashboard() {
  setMessage(dashboardMessage, 'Chargement des contenus...');
  const [articles, products, partners, gallery, pages, orders] = await Promise.all([
    apiRequest('/api/admin/articles'),
    apiRequest('/api/admin/products'),
    apiRequest('/api/admin/partners'),
    apiRequest('/api/admin/gallery'),
    apiRequest('/api/admin/pages'),
    apiRequest('/api/admin/orders').catch(() => ({ orders: [] })),
  ]);

  state.articles = sortArticlesByNewest(articles.articles || []);
  state.products = products.products || [];
  state.partners = partners.partners || [];
  state.gallery = gallery.gallery || [];
  state.pages = pages.pages && pages.pages.length ? pages.pages : [
    { slug: 'index', title: 'Accueil', content: '', image: '' },
    { slug: 'club', title: 'Le club', content: '', image: '' },
    { slug: 'contact', title: 'Contact', content: '', image: '' },
  ];
  state.orders = orders.orders || [];

  showEditor();
  fillArticle(state.articles[0] || emptyArticle());
  fillProduct(state.products[0] || emptyProduct());
  fillPartner(state.partners[0] || emptyPartner());
  fillPhoto(state.gallery[0] || emptyPhoto());
  fillPage(state.pages[0]);
  renderOrders();
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
  const item = readArticle();
  upsertItem(state.articles, item);
  try {
    await saveArticles();
    fillArticle(item);
    setMessage(qs('#editor-message'), 'Article enregistré. Il est visible sur le site.', 'success');
  } catch (error) {
    setMessage(qs('#editor-message'), error.message, 'error');
  }
});

qs('#product-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const item = readProduct();
  upsertItem(state.products, item);
  try {
    await saveContent('products', { products: state.products });
    fillProduct(item);
    setMessage(qs('#product-message'), 'Produit enregistré. La boutique est mise à jour.', 'success');
  } catch (error) {
    setMessage(qs('#product-message'), error.message, 'error');
  }
});

qs('#partner-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const item = readPartner();
  upsertItem(state.partners, item);
  try {
    await saveContent('partners', { partners: state.partners });
    fillPartner(item);
    setMessage(qs('#partner-message'), 'Partenaire enregistré.', 'success');
  } catch (error) {
    setMessage(qs('#partner-message'), error.message, 'error');
  }
});

qs('#gallery-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const item = readPhoto();
  upsertItem(state.gallery, item);
  try {
    await saveContent('gallery', { gallery: state.gallery });
    fillPhoto(item);
    setMessage(qs('#gallery-message'), 'Photo enregistrée.', 'success');
  } catch (error) {
    setMessage(qs('#gallery-message'), error.message, 'error');
  }
});

qs('#page-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const item = readPage();
  upsertItem(state.pages, item, 'slug');
  try {
    await saveContent('pages', { pages: state.pages });
    fillPage(item);
    setMessage(qs('#page-message'), 'Page enregistrée.', 'success');
  } catch (error) {
    setMessage(qs('#page-message'), error.message, 'error');
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

qs('#refresh-orders-button').addEventListener('click', async () => {
  setMessage(qs('#orders-message'), 'Chargement des commandes...');
  try {
    const payload = await apiRequest('/api/admin/orders');
    state.orders = payload.orders || [];
    renderOrders();
    setMessage(qs('#orders-message'), `Dernier chargement: ${new Date().toLocaleTimeString('fr-FR')}`, 'success');
  } catch (error) {
    setMessage(qs('#orders-message'), error.message, 'error');
  }
});

if (getToken()) {
  loadDashboard().catch(() => showLogin());
}
