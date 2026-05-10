const tokenKey = 'rvb-admin-token';
const loginPanel = document.getElementById('login-panel');
const editorPanel = document.getElementById('editor-panel');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const editorMessage = document.getElementById('editor-message');
const articlesList = document.getElementById('articles-list');
const articleForm = document.getElementById('article-form');
const logoutButton = document.getElementById('logout-button');
const newArticleButton = document.getElementById('new-article-button');
const deleteArticleButton = document.getElementById('delete-article-button');
const imageInput = document.getElementById('article-image');
const imagePreview = document.getElementById('article-preview');
const refreshOrdersButton = document.getElementById('refresh-orders-button');
const ordersMessage = document.getElementById('orders-message');
const ordersList = document.getElementById('orders-list');

let articles = [];
let currentImage = '';
let orders = [];

function getArticleTime(article) {
  const time = Date.parse(`${article.date || ''}T12:00:00`);
  return Number.isNaN(time) ? 0 : time;
}

function sortArticlesByNewest(list) {
  return [...list].sort((a, b) => {
    const dateDiff = getArticleTime(b) - getArticleTime(a);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return String(b.id || '').localeCompare(String(a.id || ''));
  });
}

function getToken() {
  return localStorage.getItem(tokenKey) || '';
}

function setMessage(element, text, type = '') {
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

function fillForm(article) {
  document.getElementById('article-id').value = article.id;
  document.getElementById('article-title').value = article.title;
  document.getElementById('article-date').value = article.date;
  document.getElementById('article-category').value = article.category;
  document.getElementById('article-author').value = article.author || 'RHUYS VOLLEY BALL';
  document.getElementById('article-excerpt').value = article.excerpt;
  document.getElementById('article-body').value = article.body;
  currentImage = article.featured_image || article.image || '';
  imageInput.value = '';

  if (currentImage) {
    imagePreview.src = currentImage;
    imagePreview.alt = article.title || 'Image de l’article';
    imagePreview.hidden = false;
  } else {
    imagePreview.hidden = true;
  }

  renderList(article.id);
}

function readForm() {
  return {
    id: document.getElementById('article-id').value || String(Date.now()),
    title: document.getElementById('article-title').value.trim(),
    date: document.getElementById('article-date').value,
    category: document.getElementById('article-category').value,
    featured_image: currentImage,
    excerpt: document.getElementById('article-excerpt').value.trim(),
    body: document.getElementById('article-body').value.trim(),
    author: document.getElementById('article-author').value.trim() || 'RHUYS VOLLEY BALL',
  };
}

function renderList(activeId = '') {
  articlesList.innerHTML = '';

  if (articles.length === 0) {
    articlesList.innerHTML = '<p>Aucun article pour le moment.</p>';
    return;
  }

  sortArticlesByNewest(articles)
    .forEach((article) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `article-list-button ${article.id === activeId ? 'active' : ''}`.trim();
      button.innerHTML = `<strong>${article.title || 'Sans titre'}</strong><span>${article.date} - ${article.category}</span>`;
      button.addEventListener('click', () => fillForm(article));
      articlesList.appendChild(button);
    });
}

function formatOrderDate(isoDate) {
  const timestamp = Date.parse(isoDate || '');
  if (Number.isNaN(timestamp)) {
    return 'Date inconnue';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function formatOrderAmount(amountTotal = 0, currency = 'eur') {
  const normalizedCurrency = String(currency || 'eur').toUpperCase();
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: normalizedCurrency,
  }).format(Number(amountTotal || 0) / 100);
}

function renderOrders() {
  ordersList.innerHTML = '';

  if (!Array.isArray(orders) || orders.length === 0) {
    ordersList.innerHTML = '<p>Aucune commande pour le moment.</p>';
    return;
  }

  orders.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'order-item';

    const lineItems = Array.isArray(order.lineItems)
      ? order.lineItems
          .map((item) => `${item.description || 'Produit'} x${item.quantity || 1}`)
          .join(' • ')
      : 'Détail produit indisponible';
    const selectedOptions = order.selectedOptions || {};
    const optionItems = [
      selectedOptions.size ? `Taille: ${selectedOptions.size}` : '',
      selectedOptions.color ? `Couleur: ${selectedOptions.color}` : '',
      selectedOptions.quantity ? `Quantité: ${selectedOptions.quantity}` : '',
    ].filter(Boolean);

    card.innerHTML = `
      <div>
        <strong>${formatOrderAmount(order.amountTotal, order.currency)}</strong>
        <p>${lineItems}</p>
        <p>${optionItems.length ? optionItems.join(' • ') : 'Options non renseignées'}</p>
      </div>
      <div>
        <p>${order.customerName || 'Client non renseigné'}</p>
        <p>${order.customerEmail || 'Email non renseigné'}</p>
        <p>${formatOrderDate(order.purchasedAt || order.createdAt)}</p>
      </div>
    `;

    ordersList.appendChild(card);
  });
}

async function fetchArticles() {
  const response = await fetch('/api/admin/articles', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les articles.');
  }

  const payload = await response.json();
  articles = sortArticlesByNewest(Array.isArray(payload.articles) ? payload.articles : []);
}

async function fetchOrders() {
  const response = await fetch('/api/admin/orders', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error('Impossible de charger les commandes.');
  }

  const payload = await response.json();
  orders = Array.isArray(payload.orders) ? payload.orders : [];
}

async function saveArticles() {
  articles = sortArticlesByNewest(articles);

  const response = await fetch('/api/admin/articles', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ articles }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Impossible de publier les articles.');
  }
}

async function bootEditor() {
  try {
    await Promise.all([fetchArticles(), fetchOrders()]);
    showEditor();
    fillForm(sortArticlesByNewest(articles)[0] || emptyArticle());
    renderOrders();
  } catch (error) {
    showLogin();
    setMessage(loginMessage, 'Connectez-vous pour accéder aux articles.', '');
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(loginMessage, 'Connexion en cours...');

  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('admin-username').value,
      password: document.getElementById('admin-password').value,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    setMessage(loginMessage, payload.message || 'Connexion impossible.', 'error');
    return;
  }

  localStorage.setItem(tokenKey, payload.token);
  setMessage(loginMessage, '');
  await bootEditor();
});

articleForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage(editorMessage, 'Publication en cours...');

  const article = readForm();
  const index = articles.findIndex((item) => item.id === article.id);

  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.push(article);
  }
  articles = sortArticlesByNewest(articles);

  try {
    await saveArticles();
    renderList(article.id);
    setMessage(editorMessage, 'Article publié avec succès.', 'success');
  } catch (error) {
    setMessage(editorMessage, error.message, 'error');
  }
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files && imageInput.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    currentImage = String(reader.result || '');
    imagePreview.src = currentImage;
    imagePreview.alt = 'Image sélectionnée';
    imagePreview.hidden = false;
  });
  reader.readAsDataURL(file);
});

newArticleButton.addEventListener('click', () => {
  fillForm(emptyArticle());
  setMessage(editorMessage, '');
});

deleteArticleButton.addEventListener('click', async () => {
  const id = document.getElementById('article-id').value;
  const article = articles.find((item) => item.id === id);

  if (!article || !window.confirm(`Supprimer l’article "${article.title}" ?`)) {
    return;
  }

  articles = articles.filter((item) => item.id !== id);

  try {
    await saveArticles();
    fillForm(sortArticlesByNewest(articles)[0] || emptyArticle());
    setMessage(editorMessage, 'Article supprimé.', 'success');
  } catch (error) {
    setMessage(editorMessage, error.message, 'error');
  }
});

refreshOrdersButton.addEventListener('click', async () => {
  setMessage(ordersMessage, 'Chargement des commandes...');

  try {
    await fetchOrders();
    renderOrders();
    setMessage(ordersMessage, `Dernier chargement: ${new Date().toLocaleTimeString('fr-FR')}`, 'success');
  } catch (error) {
    setMessage(ordersMessage, error.message || 'Erreur de chargement des commandes.', 'error');
  }
});

logoutButton.addEventListener('click', showLogin);

if (getToken()) {
  bootEditor();
}
