const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const internalAnchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');
const contactForm = document.querySelector('.contact-form');
const orderForm = document.querySelector('.order-form');
const revealElements = document.querySelectorAll('.reveal');
const heroLogo = document.querySelector('.hero-logo');
const sportImages = document.querySelectorAll(
  '.hero-media img, .photo-card img, .team-card img, .gallery-item img, .news-card img, .article-media img'
);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phoneRegex = /^[0-9+().\s-]{8,20}$/;
const matches = [
  {
    id: 1,
    date: '2026-09-12',
    heure: '20h30',
    equipe: 'RVB Adultes Compétition',
    adversaire: 'Vannes Volley 2',
    lieu: 'Surzur',
    type: 'Domicile',
    competition: 'Championnat Départemental'
  },
  {
    id: 2,
    date: '2026-09-19',
    heure: '18h00',
    equipe: 'RVB Jeunes',
    adversaire: 'Ploërmel VB',
    lieu: 'Sarzeau',
    type: 'Domicile',
    competition: 'Challenge Jeunes'
  },
  {
    id: 3,
    date: '2026-09-26',
    heure: '20h30',
    equipe: 'RVB Adultes Compétition',
    adversaire: 'Auray Volley',
    lieu: 'Auray',
    type: 'Extérieur',
    competition: 'Championnat Départemental'
  },
  {
    id: 4,
    date: '2026-10-03',
    heure: '19h00',
    equipe: 'RVB Loisir Mixte',
    adversaire: 'Muzillac VB',
    lieu: 'Sarzeau',
    type: 'Domicile',
    competition: 'Rencontre Amicale'
  },
  {
    id: 5,
    date: '2026-10-10',
    heure: '20h30',
    equipe: 'RVB Adultes Compétition',
    adversaire: 'Lorient Volley 3',
    lieu: 'Lorient',
    type: 'Extérieur',
    competition: 'Championnat Départemental'
  },
  {
    id: 6,
    date: '2026-10-17',
    heure: '17h30',
    equipe: 'RVB École de Volley',
    adversaire: 'Plateau Interclubs',
    lieu: 'Sarzeau',
    type: 'Domicile',
    competition: 'Plateau M11'
  },
  {
    id: 7,
    date: '2026-10-24',
    heure: '18h30',
    equipe: 'RVB Jeunes',
    adversaire: 'Pontivy VB',
    lieu: 'Pontivy',
    type: 'Extérieur',
    competition: 'Challenge Jeunes'
  },
  {
    id: 8,
    date: '2026-11-07',
    heure: '20h30',
    equipe: 'RVB Adultes Compétition',
    adversaire: 'Quiberon Volley',
    lieu: 'Surzur',
    type: 'Domicile',
    competition: 'Championnat Départemental'
  },
  {
    id: 9,
    date: '2026-11-14',
    heure: '19h15',
    equipe: 'RVB Loisir Mixte',
    adversaire: 'Rhuys Friends Team',
    lieu: 'Surzur',
    type: 'Domicile',
    competition: 'Rencontre Amicale'
  },
  {
    id: 10,
    date: '2026-11-21',
    heure: '18h00',
    equipe: 'RVB Jeunes',
    adversaire: 'Guidel VB',
    lieu: 'Sarzeau',
    type: 'Domicile',
    competition: 'Challenge Jeunes'
  },
  {
    id: 11,
    date: '2026-12-05',
    heure: '20h30',
    equipe: 'RVB Adultes Compétition',
    adversaire: 'Plescop Volley',
    lieu: 'Plescop',
    type: 'Extérieur',
    competition: 'Championnat Départemental'
  },
  {
    id: 12,
    date: '2026-12-12',
    heure: '17h00',
    equipe: 'RVB École de Volley',
    adversaire: 'Plateau de Noël',
    lieu: 'Vannes',
    type: 'Extérieur',
    competition: 'Plateau M11'
  }
];

const categoriesOrder = ['Tous', 'Matchs', 'Club', 'Événements', 'Jeunes', 'Annonces'];
const imageFallbackSvg =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>" +
      "<defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>" +
        "<stop offset='0%' stop-color='#0b2a52'/>" +
        "<stop offset='100%' stop-color='#1f5a96'/>" +
      "</linearGradient></defs>" +
      "<rect width='100%' height='100%' fill='url(#g)'/>" +
      "<circle cx='600' cy='320' r='110' fill='#f8c836' opacity='0.92'/>" +
      "<text x='600' y='560' text-anchor='middle' fill='white' font-size='52' font-family='Arial, sans-serif'>Photo Volley</text>" +
    "</svg>"
  );
const articles = [
  {
    id: 1,
    titre: "Victoire à domicile pour l'équipe compétition",
    date: '2026-09-12',
    categorie: 'Matchs',
    image: 'https://images.pexels.com/photos/6203586/pexels-photo-6203586.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: "Un match engagé à Surzur conclu par une belle victoire collective du RVB.",
    contenu:
      "Le groupe Adultes Compétition du RHUYS VOLLEY BALL a signé une victoire solide à Surzur face à Vannes Volley 2. Après un premier set serré, l'équipe a su imposer davantage de rythme au service et mieux exploiter les transitions attaque-défense. Le staff salue l'engagement de tout le collectif et la qualité de l'état d'esprit affiché tout au long de la rencontre.",
    auteur: 'Damien Medigue'
  },
  {
    id: 2,
    titre: 'Rentrée sportive : reprise de toutes les sections',
    date: '2026-09-05',
    categorie: 'Club',
    image: 'https://images.pexels.com/photos/6203578/pexels-photo-6203578.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: 'Le club relance ses créneaux à Sarzeau et Surzur avec un encadrement renforcé.',
    contenu:
      "La saison 2026-2027 démarre officiellement avec la reprise de l'ensemble des entraînements. Les créneaux jeunes et adultes sont maintenus sur les deux communes, avec une organisation pensée pour faciliter la progression et l'accueil des nouveaux licenciés. Les bénévoles restent mobilisés pour accompagner les familles tout au long de la saison.",
    auteur: 'Emmanuelle Tillon'
  },
  {
    id: 3,
    titre: 'Tournoi de rentrée du club le 26 septembre',
    date: '2026-09-18',
    categorie: 'Événements',
    image: 'https://images.pexels.com/photos/6203569/pexels-photo-6203569.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: "Un tournoi convivial ouvert aux licenciés et aux nouveaux joueurs en découverte.",
    contenu:
      "Le RHUYS VOLLEY BALL organise un tournoi interne de rentrée afin de lancer la dynamique de saison. L'événement est ouvert à toutes les sections du club et propose des matchs courts, des ateliers techniques et un temps d'échange avec les encadrants. Les participants sont invités à s'inscrire à l'avance pour faciliter la composition des équipes.",
    auteur: 'Benjamin Boissier'
  },
  {
    id: 4,
    titre: 'Belle progression du groupe Jeunes',
    date: '2026-10-04',
    categorie: 'Jeunes',
    image: 'https://images.pexels.com/photos/6203648/pexels-photo-6203648.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: 'Les 12-17 ans montrent de vrais progrès techniques en début de cycle.',
    contenu:
      "Depuis la reprise, le groupe Volley Jeunes affiche une progression régulière sur les fondamentaux : réception, passe et déplacement défensif. L'équipe encadrante souligne la qualité de l'implication des joueurs et la bonne dynamique collective. Plusieurs rencontres amicales sont déjà programmées pour consolider ces acquis.",
    auteur: 'Damien Medigue'
  },
  {
    id: 5,
    titre: "Séances d'essai ouvertes tout le mois d'octobre",
    date: '2026-10-01',
    categorie: 'Annonces',
    image: 'https://images.pexels.com/photos/6203635/pexels-photo-6203635.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: 'Le club propose des essais gratuits pour découvrir la pratique et les équipes.',
    contenu:
      "Le RHUYS VOLLEY BALL ouvre des séances d'essai sur l'ensemble de ses créneaux pendant le mois d'octobre. Cette formule permet aux futurs licenciés de découvrir le fonctionnement du club, d'échanger avec les encadrants et de trouver la section la plus adaptée à leur profil. Les demandes se font via le formulaire de contact.",
    auteur: 'Emmanuelle Tillon'
  },
  {
    id: 6,
    titre: 'Un nouveau partenaire rejoint le club',
    date: '2026-11-15',
    categorie: 'Club',
    image: 'https://images.pexels.com/photos/6203604/pexels-photo-6203604.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: "Le RVB accueille un partenaire local pour soutenir ses actions sportives.",
    contenu:
      "Le bureau du RHUYS VOLLEY BALL remercie son nouveau partenaire local pour sa confiance. Ce soutien permettra de renforcer les actions menées auprès des jeunes, d'améliorer l'équipement des sections et de développer les événements de club. La recherche de partenaires reste ouverte pour accompagner la croissance de l'association.",
    auteur: 'Benjamin Boissier'
  },
  {
    id: 7,
    titre: 'Calendrier jeunes : premières rencontres confirmées',
    date: '2026-11-03',
    categorie: 'Matchs',
    image: 'https://images.pexels.com/photos/6203642/pexels-photo-6203642.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: 'Le planning des rencontres jeunes se précise pour novembre et décembre.',
    contenu:
      "Les premières dates officielles du calendrier jeunes sont désormais validées. Le groupe participera à plusieurs rencontres sur la zone départementale, avec des objectifs clairs de progression et d'expérience collective. Les horaires détaillés sont consultables dans la section calendrier du site.",
    auteur: 'Damien Medigue'
  },
  {
    id: 8,
    titre: "Stage vacances d'hiver : inscriptions lancées",
    date: '2026-12-01',
    categorie: 'Événements',
    image: 'https://images.pexels.com/photos/6203571/pexels-photo-6203571.jpeg?auto=compress&cs=tinysrgb&w=1200',
    extrait: 'Un stage technique et ludique est proposé aux jeunes pendant les vacances.',
    contenu:
      "Pendant les vacances d'hiver, le RHUYS VOLLEY BALL propose un stage dédié aux 10-17 ans. Les séances seront orientées autour de la technique individuelle, des situations de jeu et de la cohésion d'équipe. Les places étant limitées, les familles sont invitées à confirmer leur participation le plus tôt possible.",
    auteur: 'Emmanuelle Tillon'
  }
];

const products = [
  {
    id: 'sweat-rvb',
    name: 'Sweat RHUYS VOLLEY BALL',
    price: '45 €',
    priceId: 'price_1TSKcP3OCDghhlsbO4GhVpHA',
    image: 'assets/boutique/sweat-rvb.svg',
    shortDescription: 'Sweat confortable aux couleurs du club pour les entraînements et les déplacements.',
    detailedDescription:
      'Un sweat chaud et polyvalent pensé pour accompagner les joueurs, parents et supporters du RHUYS VOLLEY BALL. Sa coupe confortable convient aux temps d’échauffement, aux trajets d’équipe et aux moments de vie du club.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Bleu marine', 'Jaune club'],
    availability: 'Disponible en précommande',
    stock: 'Stock test Stripe',
    stripeTestLink: 'https://buy.stripe.com/test_8x28wIgn3deD0Ex6mm7ok08'
  },
  {
    id: 'tshirt-club',
    name: 'T-shirt du club',
    price: '22 €',
    priceId: 'price_1TVIJN3OCDghhlsbNVFVJ3rN',
    image: 'assets/boutique/tshirt-club.svg',
    shortDescription: 'T-shirt respirant pour représenter le RVB pendant les séances et événements.',
    detailedDescription:
      'Le t-shirt officiel du club est léger, facile à porter et adapté à une utilisation régulière. Il permet aux licenciés et supporters d’afficher les couleurs du RHUYS VOLLEY BALL au quotidien.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blanc', 'Bleu marine'],
    availability: 'Disponible en précommande',
    stock: 'Stock test Stripe',
    stripeTestLink: 'https://buy.stripe.com/test_cNidR27Qx7Ujevn4ee7ok09'
  },
  {
    id: 'maillot-entrainement',
    name: 'Maillot d’entraînement',
    price: '35 €',
    priceId: 'price_1TVIJO3OCDghhlsbkjbbj2vd',
    image: 'assets/boutique/maillot-entrainement.svg',
    shortDescription: 'Maillot technique léger pour les séances indoor et les matchs amicaux.',
    detailedDescription:
      'Ce maillot d’entraînement accompagne les séances intensives avec une matière légère et une coupe sportive. Il est idéal pour les joueurs qui souhaitent une tenue dédiée à la pratique régulière du volley.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Bleu', 'Blanc'],
    availability: 'Disponible en précommande',
    stock: 'Stock test Stripe',
    stripeTestLink: 'https://buy.stripe.com/test_aFabIUdaRcazaf7h107ok0a'
  },
  {
    id: 'gourde-club',
    name: 'Gourde club',
    price: '12 €',
    priceId: 'price_1TVIJQ3OCDghhlsbt6IFwq4f',
    image: 'assets/boutique/gourde-club.svg',
    shortDescription: 'Gourde pratique pour rester hydraté pendant les entraînements.',
    detailedDescription:
      'La gourde club est pensée pour les séances hebdomadaires, les plateaux jeunes et les déplacements. Format pratique, prise en main simple et identité RHUYS VOLLEY BALL.',
    sizes: ['Unique - 750 ml'],
    colors: ['Bleu', 'Blanc'],
    availability: 'Disponible en test',
    stock: 'Stock test Stripe',
    stripeTestLink: 'https://buy.stripe.com/test_cNiaEQb2J7Uj1IB8uu7ok0b'
  },
  {
    id: 'sac-sport',
    name: 'Sac de sport',
    price: '30 €',
    priceId: 'price_1TVIJS3OCDghhlsbEhYNVgAB',
    image: 'assets/boutique/sac-sport.svg',
    shortDescription: 'Sac robuste pour transporter tenue, chaussures et accessoires.',
    detailedDescription:
      'Un sac de sport pratique pour les entraînements, les matchs et les déplacements. Il offre un format adapté au matériel de volley tout en gardant une identité sobre et sportive.',
    sizes: ['Unique'],
    colors: ['Bleu marine'],
    availability: 'Disponible en précommande',
    stock: 'Stock test Stripe',
    stripeTestLink: 'https://buy.stripe.com/test_28EfZa6Mt7UjgDvbGG7ok0c'
  }
];


const fallbackPartners = [
  {
    nom: 'Armor Littoral',
    logo: '',
    categorie: 'Partenaire principal',
    description: "Accompagne la section compétition et soutient les déplacements de l'équipe seniors.",
    lien: 'https://example.com'
  },
  {
    nom: 'Breizh Conseil',
    logo: '',
    categorie: 'Partenaire local',
    description: 'Participe au financement des actions jeunesse et des événements internes du club.',
    lien: 'https://example.com'
  },
  {
    nom: 'Mairie de Rhuys',
    logo: '',
    categorie: 'Institutionnel',
    description: "Soutient les infrastructures, les créneaux d'entraînement et la vie associative locale.",
    lien: 'https://example.com'
  },
  {
    nom: 'Volley Store',
    logo: '',
    categorie: 'Équipementier',
    description: 'Fournit du matériel technique et accompagne le club sur les équipements collectifs.',
    lien: 'https://example.com'
  },
  {
    nom: 'Océan Print',
    logo: '',
    categorie: 'Partenaire local',
    description: 'Réalise les supports de communication du club pour les matchs et tournois.',
    lien: 'https://example.com'
  },
  {
    nom: 'Sport Nature',
    logo: '',
    categorie: 'Partenaire principal',
    description: 'Contribue au développement des sections jeunes et au rayonnement du RVB.',
    lien: 'https://example.com'
  }
];

const fallbackGalleryItems = [
  {
    title: 'Entraînement jeunes à Sarzeau',
    image: 'https://images.pexels.com/photos/6203578/pexels-photo-6203578.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Séance collective autour de la technique et du plaisir de jouer.'
  },
  {
    title: 'Match en salle',
    image: 'https://images.pexels.com/photos/6203571/pexels-photo-6203571.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Ambiance de match pour les équipes du RHUYS VOLLEY BALL.'
  },
  {
    title: 'Cohésion adultes',
    image: 'https://images.pexels.com/photos/6203648/pexels-photo-6203648.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: "Un groupe loisir et compétition engagé toute l'année."
  }
];

const cmsArticlesEndpoint = '/content/articles/articles.json';
const liveArticlesEndpoint = '/api/articles';
const githubArticlesEndpoint =
  'https://raw.githubusercontent.com/shtungfutures-lgtm/rhuys-volley-ball/main/content/articles/articles.json';
const githubMediaBaseUrl = 'https://raw.githubusercontent.com/shtungfutures-lgtm/rhuys-volley-ball/main';
const githubContentBaseUrl = 'https://raw.githubusercontent.com/shtungfutures-lgtm/rhuys-volley-ball/main';
const galleryContentPath = ['/content/gallery/gallery.json', '/content/galerie/galerie.json'];
const productsContentPath = ['/content/products/products.json', '/content/produits/produits.json'];
const partnersContentPath = ['/content/partners/partners.json', '/content/partenaires/partenaires.json'];
const pagesContentPath = '/content/pages/pages.json';
const pageContentFiles = {
  index: '/content/pages/accueil.json',
  club: '/content/pages/club.json',
  contact: '/content/pages/contact.json'
};
let resolvedArticlesCache = null;

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});
const articleDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const isMobileMenuMode = () => window.matchMedia('(max-width: 980px)').matches;

const getNavOffset = () => {
  if (!nav) {
    return 0;
  }
  return nav.getBoundingClientRect().height + 10;
};

function setActiveNavLink() {
  if (!navItems.length) {
    return;
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const navPage = currentPage === 'article.html' ? 'actualites.html' : currentPage;

  navItems.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) {
      return;
    }

    const isCurrent = href === navPage;
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function closeMenu(shouldFocusToggle = false) {
  if (!menuToggle || !navLinks) {
    return;
  }

  navLinks.classList.remove('open');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Ouvrir le menu');

  if (shouldFocusToggle) {
    menuToggle.focus();
  }
}

function smoothScrollToHash(hash) {
  const targetId = hash.replace('#', '');
  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  const targetTop = window.scrollY + target.getBoundingClientRect().top - getNavOffset();
  const safeTop = Math.max(0, targetTop);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: safeTop, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  if (window.location.hash !== hash) {
    history.pushState(null, '', hash);
  }
}

function alignHashWithNavbarOffset() {
  if (!window.location.hash) {
    return;
  }

  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) {
    return;
  }

  window.requestAnimationFrame(() => {
    smoothScrollToHash(window.location.hash);
  });
}

function toMinutes(time) {
  const [hours, minutes] = time.split('h');
  return Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes || '0', 10);
}

function capitalizeFirstLetter(value) {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatArticleDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return capitalizeFirstLetter(articleDateFormatter.format(date));
}

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

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function toArticleSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isLocalPreview() {
  return ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
}

function getCmsArticleEndpoints() {
  return isLocalPreview() ? [cmsArticlesEndpoint] : [githubArticlesEndpoint, liveArticlesEndpoint, cmsArticlesEndpoint];
}

function getStaticContentEndpoints(pathOrPaths) {
  const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];

  if (isLocalPreview()) {
    return paths;
  }

  return paths.flatMap((path) => [`${githubContentBaseUrl}${path}`, path]);
}

async function fetchFirstJson(endpoints) {
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // On passe à la source suivante pour garder un fallback robuste.
    }
  }

  return null;
}

function resolveCmsMediaUrl(value) {
  if (!value) {
    return imageFallbackSvg;
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  if (isLocalPreview()) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `${githubMediaBaseUrl}${normalizedPath}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInlineMarkdown(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function markdownToHtml(value) {
  const blocks = String(value || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return '';
  }

  return blocks
    .map((block) => {
      if (/^#{2,3}\s+/.test(block)) {
        const level = block.startsWith('###') ? 'h4' : 'h3';
        const text = block.replace(/^#{2,3}\s+/, '');
        return `<${level}>${renderInlineMarkdown(escapeHtml(text))}</${level}>`;
      }

      if (/^[-*]\s+/m.test(block)) {
        const items = block
          .split('\n')
          .map((line) => line.replace(/^[-*]\s+/, '').trim())
          .filter(Boolean)
          .map((line) => `<li>${renderInlineMarkdown(escapeHtml(line))}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }

      return `<p>${renderInlineMarkdown(escapeHtml(block)).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

function markdownToPlainText(value) {
  return String(value || '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeArticleRecord(rawArticle, index) {
  const title = rawArticle.title || rawArticle.titre || 'Article';
  const category = rawArticle.category || rawArticle.categorie || 'Club';
  const date = rawArticle.date || new Date().toISOString().slice(0, 10);
  const image = resolveCmsMediaUrl(rawArticle.featured_image || rawArticle.image || '');
  const excerpt = rawArticle.excerpt || rawArticle.extrait || '';
  const body = rawArticle.body || rawArticle.contenu || '';
  const author = rawArticle.author || rawArticle.auteur || 'RHUYS VOLLEY BALL';
  const fallbackSlug = `${date}-${toArticleSlug(title) || `article-${index + 1}`}`;
  const slug = rawArticle.slug ? toArticleSlug(rawArticle.slug) : fallbackSlug;

  return {
    id: String(rawArticle.id || index + 1),
    slug,
    title,
    date,
    category,
    image,
    excerpt,
    body,
    author
  };
}

function normalizeArticlesList(rawList) {
  if (!Array.isArray(rawList)) {
    return [];
  }
  return sortArticlesByNewest(rawList.map(normalizeArticleRecord).filter((article) => article.title && article.date));
}

async function getResolvedArticles() {
  if (resolvedArticlesCache) {
    return resolvedArticlesCache;
  }

  const fallbackArticles = normalizeArticlesList(articles);

  for (const endpoint of getCmsArticleEndpoints()) {
    try {
      const response = await fetch(`${endpoint}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const cmsRawArticles = Array.isArray(payload) ? payload : payload && Array.isArray(payload.articles) ? payload.articles : [];
      const cmsArticles = normalizeArticlesList(cmsRawArticles);

      if (cmsArticles.length > 0) {
        resolvedArticlesCache = cmsArticles;
        return resolvedArticlesCache;
      }
    } catch (error) {
      // On essaie la source suivante, puis les articles intégrés si tout échoue.
    }
  }

  resolvedArticlesCache = fallbackArticles;
  return resolvedArticlesCache;
}

function bindImageFallback(images) {
  images.forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied === 'true') {
        return;
      }
      img.dataset.fallbackApplied = 'true';
      img.src = imageFallbackSvg;
      img.alt = 'Photo de volley indisponible';
    });
  });
}

async function initActualitesPage() {
  const filtersRoot = document.getElementById('news-filters');
  const searchInput = document.getElementById('news-search');
  const resultsRoot = document.getElementById('news-results');
  const emptyMessage = document.getElementById('news-empty');
  const countElement = document.getElementById('news-count');

  if (!filtersRoot || !searchInput || !resultsRoot || !emptyMessage || !countElement) {
    return;
  }

  let activeCategory = 'Tous';

  const sortedArticles = await getResolvedArticles();

  const renderCategoryButtons = () => {
    filtersRoot.innerHTML = '';

    categoriesOrder.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `news-filter ${activeCategory === category ? 'active' : ''}`;
      button.textContent = category;
      button.setAttribute('aria-pressed', String(activeCategory === category));
      button.addEventListener('click', () => {
        activeCategory = category;
        renderCategoryButtons();
        renderArticles();
      });
      filtersRoot.appendChild(button);
    });
  };

  const renderArticles = () => {
    const query = normalizeText(searchInput.value.trim());

    const filteredArticles = sortedArticles.filter((article) => {
      const categoryMatch = activeCategory === 'Tous' || article.category === activeCategory;
      if (!categoryMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = normalizeText(`${article.title} ${article.excerpt} ${article.body} ${article.author} ${article.category}`);
      return searchable.includes(query);
    });

    countElement.textContent = `${filteredArticles.length} article${filteredArticles.length > 1 ? 's' : ''} affiché${filteredArticles.length > 1 ? 's' : ''}`;
    emptyMessage.textContent = '';
    resultsRoot.innerHTML = '';

    if (filteredArticles.length === 0) {
      emptyMessage.textContent = 'Aucun article ne correspond à votre recherche.';
      return;
    }

    filteredArticles.forEach((article) => {
      const card = document.createElement('article');
      card.className = 'news-card card reveal';

      card.innerHTML = `
        <img
          src="${article.image}"
          alt="${escapeHtml(article.title)}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          class="news-card-image"
        />
        <div class="news-meta">
          <p class="news-date">${formatArticleDate(article.date)}</p>
          <span class="news-category-badge">${escapeHtml(article.category)}</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.excerpt)}</p>
        <a href="article.html?slug=${encodeURIComponent(article.slug)}" class="btn btn-primary">Lire l’article</a>
      `;

      resultsRoot.appendChild(card);
    });

    bindImageFallback(resultsRoot.querySelectorAll('.news-card-image'));
    initRevealAnimations(resultsRoot.querySelectorAll('.reveal'));
  };

  searchInput.addEventListener('input', renderArticles);
  renderCategoryButtons();
  renderArticles();
}

async function initHomeNewsPreview() {
  const previewRoot = document.getElementById('home-news-preview');
  if (!previewRoot) {
    return;
  }

  const latestArticles = (await getResolvedArticles()).slice(0, 3);
  if (latestArticles.length === 0) {
    return;
  }

  previewRoot.innerHTML = '';

  latestArticles.forEach((article) => {
    const card = document.createElement('article');
    card.className = 'news-card card reveal';
    card.innerHTML = `
      <p class="news-date">${formatArticleDate(article.date)}</p>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.excerpt)}</p>
      <a href="article.html?slug=${encodeURIComponent(article.slug)}" class="btn btn-primary">Lire plus</a>
    `;
    previewRoot.appendChild(card);
  });

  initRevealAnimations(previewRoot.querySelectorAll('.reveal'));
}

async function initGallery() {
  const galleryRoot = document.getElementById('gallery-grid');
  if (!galleryRoot) {
    return;
  }

  const payload = await fetchFirstJson(getStaticContentEndpoints(galleryContentPath));
  const resolvedGallery = payload && (payload.gallery || payload.galerie);
  const galleryItems =
    Array.isArray(resolvedGallery) && resolvedGallery.length > 0 ? resolvedGallery : fallbackGalleryItems;

  galleryRoot.innerHTML = '';

  galleryItems.forEach((item) => {
    const image = resolveCmsMediaUrl(item.image || '');
    const card = document.createElement('article');
    card.className = 'gallery-item reveal';
    card.innerHTML = `
      <img
        src="${image}"
        alt="${escapeHtml(item.title || item.description || 'Photo du club')}"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
      />
    `;
    galleryRoot.appendChild(card);
  });

  bindImageFallback(galleryRoot.querySelectorAll('img'));
  initRevealAnimations(galleryRoot.querySelectorAll('.reveal'));
}

async function initArticlePage() {
  const articleRoot = document.getElementById('article-detail');
  const notFoundRoot = document.getElementById('article-not-found');
  if (!articleRoot || !notFoundRoot) {
    return;
  }

  const sourceArticles = await getResolvedArticles();
  const params = new URLSearchParams(window.location.search);
  const slugParam = toArticleSlug(params.get('slug') || '');
  const idParam = params.get('id') || '';
  const article = sourceArticles.find((item) => item.slug === slugParam) || sourceArticles.find((item) => item.id === idParam);

  if (!article) {
    notFoundRoot.hidden = false;
    initRevealAnimations([notFoundRoot]);
    return;
  }

  document.title = `RHUYS VOLLEY BALL | ${article.title}`;

  articleRoot.innerHTML = `
    <article class="article-layout card reveal">
      <div class="article-media">
        <img
          src="${article.image}"
          alt="${escapeHtml(article.title)}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
        />
      </div>
      <div class="article-content">
        <p class="news-date">${formatArticleDate(article.date)}</p>
        <div class="article-header-meta">
          <span class="news-category-badge">${escapeHtml(article.category)}</span>
          <span class="article-author">Par ${escapeHtml(article.author)}</span>
        </div>
        <h2>${escapeHtml(article.title)}</h2>
        <div class="article-body">${markdownToHtml(article.body)}</div>
        <a href="actualites.html" class="btn btn-outline article-back">Retour aux actualités</a>
      </div>
    </article>
  `;

  bindImageFallback(articleRoot.querySelectorAll('.article-media img'));
  initRevealAnimations(articleRoot.querySelectorAll('.reveal'));
}

function normalizeProduct(rawProduct) {
  const sizes = rawProduct.sizes || rawProduct.tailles || [];
  const colors = rawProduct.colors || rawProduct.couleurs || [];
  const stripeTestLink = rawProduct.stripeTestLink || rawProduct.stripeLink || rawProduct.stripe_link || rawProduct.lienStripe || '';

  return {
    id: rawProduct.id || toArticleSlug(rawProduct.name || rawProduct.nom || 'produit'),
    name: rawProduct.name || rawProduct.nom || 'Produit du club',
    price: rawProduct.price || rawProduct.prix || '',
    priceId: rawProduct.priceId || rawProduct.price_id || '',
    image: resolveCmsMediaUrl(rawProduct.image || ''),
    shortDescription: rawProduct.shortDescription || rawProduct.descriptionCourte || rawProduct.description || '',
    detailedDescription:
      rawProduct.detailedDescription || rawProduct.descriptionDetaillee || rawProduct.description || '',
    sizes: Array.isArray(sizes)
      ? sizes
      : String(sizes || 'Selon stock')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
    colors: Array.isArray(colors)
      ? colors
      : String(colors || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
    availability:
      rawProduct.availability ||
      rawProduct.disponibilite ||
      rawProduct.stock ||
      rawProduct.status ||
      rawProduct.statut ||
      'Disponibilité à confirmer',
    stock: rawProduct.stock || rawProduct.availability || rawProduct.disponibilite || '',
    stripeTestLink,
    stripeLink: stripeTestLink
  };
}

async function getResolvedProducts() {
  const payload = await fetchFirstJson(getStaticContentEndpoints(productsContentPath));
  const resolvedProducts = payload && (payload.products || payload.produits);
  const rawProducts = Array.isArray(resolvedProducts) && resolvedProducts.length > 0 ? resolvedProducts : products;
  return rawProducts.map(normalizeProduct);
}

function renderProductTags(items) {
  if (!items || items.length === 0) {
    return '<span class="product-tag">Non renseigné</span>';
  }

  return items.map((item) => `<span class="product-tag">${escapeHtml(item)}</span>`).join('');
}

function renderProductOptions(id, label, options, inputName) {
  if (!options || options.length === 0) {
    return '';
  }

  const safeId = `product-${id}-${inputName}`;
  const optionsHtml = options
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join('');

  return `
    <label class="product-option" for="${safeId}">
      ${label}
      <select id="${safeId}" name="${inputName}" required>
        ${optionsHtml}
      </select>
    </label>
  `;
}

async function initBoutiquePage() {
  const shopRoot = document.getElementById('shop-products');
  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');
  const checkoutMessage = document.getElementById('shop-checkout-message');

  if (!shopRoot) {
    return;
  }

  shopRoot.innerHTML = '';
  const checkoutStatus = new URLSearchParams(window.location.search).get('checkout');

  if (checkoutMessage && checkoutStatus) {
    checkoutMessage.hidden = false;
    checkoutMessage.classList.toggle('is-success', checkoutStatus === 'success');
    checkoutMessage.classList.toggle('is-error', checkoutStatus === 'cancel');
    checkoutMessage.textContent =
      checkoutStatus === 'success'
        ? 'Paiement test confirmé. Le club reçoit la commande via Stripe.'
        : 'Paiement annulé. Vous pouvez reprendre votre commande quand vous le souhaitez.';
  }

  const resolvedProducts = await getResolvedProducts();
  let lastFocusedElement = null;

  const closeProductModal = () => {
    if (!modal || !modalContent || modal.hidden) {
      return;
    }

    modal.classList.remove('open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalContent.innerHTML = '';

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  const openProductModal = (product) => {
    if (!modal || !modalContent) {
      return;
    }

    const canBuy = Boolean(product.priceId);
    const buyAction = canBuy
      ? `<button type="submit" class="btn btn-primary btn-xl">Payer avec Stripe</button>`
      : `<button type="button" class="btn btn-primary btn-xl disabled" disabled aria-disabled="true">Paiement test bientôt disponible</button>`;

    lastFocusedElement = document.activeElement;
    modalContent.innerHTML = `
      <div class="product-modal-layout">
        <div class="product-modal-media">
          <img
            src="${product.image}"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
        </div>
        <div class="product-modal-info">
          <p class="hero-tag">Boutique test Stripe</p>
          <h2 id="product-modal-title">${escapeHtml(product.name)}</h2>
          <p class="product-modal-price">${escapeHtml(product.price)}</p>
          <p>${escapeHtml(product.detailedDescription)}</p>
          <div class="product-detail-block">
            <h3>Tailles disponibles</h3>
            <div class="product-tags">${renderProductTags(product.sizes)}</div>
          </div>
          <div class="product-detail-block">
            <h3>Couleurs</h3>
            <div class="product-tags">${renderProductTags(product.colors)}</div>
          </div>
          <div class="product-availability">
            <strong>${escapeHtml(product.availability)}</strong>
            <span>${escapeHtml(product.stock || 'Paiement en mode test Stripe')}</span>
          </div>
          <form class="product-checkout-form" data-product-id="${escapeHtml(product.id)}">
            <div class="product-options-grid">
              ${renderProductOptions(product.id, 'Taille', product.sizes, 'size')}
              ${renderProductOptions(product.id, 'Couleur', product.colors, 'color')}
              <label class="product-option" for="product-${escapeHtml(product.id)}-quantity">
                Quantité
                <input id="product-${escapeHtml(product.id)}-quantity" type="number" name="quantity" min="1" max="10" value="1" required />
              </label>
            </div>
            <div class="payment-method-note">
              <strong>Moyen de paiement</strong>
              <span>Carte bancaire et moyens disponibles seront proposés directement sur Stripe Checkout.</span>
            </div>
            <div class="product-modal-actions">
              ${buyAction}
              <button type="button" class="btn btn-outline" data-close-product-modal>Continuer mes achats</button>
            </div>
            <p class="form-status product-checkout-status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    `;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => modal.classList.add('open'));

    const closeButton = modal.querySelector('.product-modal-close');
    if (closeButton) {
      closeButton.focus();
    }

    bindImageFallback(modalContent.querySelectorAll('img'));

    const checkoutForm = modalContent.querySelector('.product-checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        const status = checkoutForm.querySelector('.product-checkout-status');
        const formData = new FormData(checkoutForm);
        const quantity = Math.max(1, Math.min(10, Number(formData.get('quantity') || 1)));
        const payload = {
          productId: product.id,
          productName: product.name,
          priceId: product.priceId,
          quantity,
          size: String(formData.get('size') || ''),
          color: String(formData.get('color') || '')
        };

        if (!product.priceId) {
          if (status) {
            status.className = 'form-status is-error product-checkout-status';
            status.textContent = 'Prix Stripe manquant pour ce produit.';
          }
          return;
        }

        if (window.location.protocol === 'file:') {
          if (status) {
            status.className = 'form-status is-error product-checkout-status';
            status.textContent =
              'Le paiement Stripe nécessite Netlify Dev ou le site Netlify déployé. Le mode fichier ne peut pas appeler /api/create-checkout-session.';
          }
          return;
        }

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Ouverture de Stripe...';
        }

        if (status) {
          status.className = 'form-status product-checkout-status';
          status.textContent = 'Création du paiement test Stripe...';
        }

        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok || !result.url) {
            throw new Error(result.message || 'Impossible de créer le paiement Stripe.');
          }

          const checkoutLink = document.createElement('a');
          checkoutLink.href = result.url;
          checkoutLink.target = '_blank';
          checkoutLink.rel = 'noopener noreferrer';
          document.body.appendChild(checkoutLink);
          checkoutLink.click();
          checkoutLink.remove();

          if (status) {
            status.className = 'form-status is-success product-checkout-status';
            status.textContent = 'Stripe Checkout est ouvert dans un nouvel onglet.';
          }
        } catch (error) {
          if (status) {
            status.className = 'form-status is-error product-checkout-status';
            status.textContent =
              error.message ||
              'Paiement test indisponible. Lancez le site avec Netlify Dev et vérifiez STRIPE_SECRET_KEY.';
          }
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Payer avec Stripe';
          }
        }
      });
    }
  };

  resolvedProducts.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card card reveal';

    card.innerHTML = `
      <img
        class="product-image"
        src="${product.image}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
      />
      <div class="product-card-content">
        <p class="product-status">${escapeHtml(product.availability)}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="product-price">${escapeHtml(product.price)}</p>
        <p>${escapeHtml(product.shortDescription)}</p>
      </div>
      <button type="button" class="btn btn-primary product-view-button" aria-label="Voir le produit ${escapeHtml(product.name)}">Voir le produit</button>
    `;

    card.addEventListener('click', () => openProductModal(product));
    const viewButton = card.querySelector('.product-view-button');
    if (viewButton) {
      viewButton.addEventListener('click', (event) => {
        event.stopPropagation();
        openProductModal(product);
      });
    }

    shopRoot.appendChild(card);
  });

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.hasAttribute('data-close-product-modal')) {
        closeProductModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) {
        closeProductModal();
      }
    });
  }

  bindImageFallback(shopRoot.querySelectorAll('.product-image'));
  initRevealAnimations(shopRoot.querySelectorAll('.reveal'));
}


function getPartnerInitials(name) {
  return String(name || 'RVB')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

async function initPartnersPage() {
  const partnersRoot = document.getElementById('partners-list');
  if (!partnersRoot) {
    return;
  }

  const payload = await fetchFirstJson(getStaticContentEndpoints(partnersContentPath));
  const resolvedPartners = payload && (payload.partners || payload.partenaires);
  const partners =
    Array.isArray(resolvedPartners) && resolvedPartners.length > 0
      ? resolvedPartners
      : fallbackPartners;

  partnersRoot.innerHTML = '';

  partners.forEach((partner) => {
    const name = partner.nom || partner.name || 'Partenaire';
    const logo = resolveCmsMediaUrl(partner.logo || '');
    const category = partner.categorie || partner.category || 'Partenaire local';
    const description = partner.description || '';
    const link = partner.website || partner.lien || partner.url || partner.site || '';
    const brand = partner.logo
      ? `<img src="${logo}" alt="Logo ${escapeHtml(name)}" class="partner-logo" loading="lazy" decoding="async" />`
      : `<div class="partner-brand">${escapeHtml(getPartnerInitials(name))}</div>`;
    const linkHtml = link
      ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Voir le site</a>`
      : '';
    const card = document.createElement('article');
    card.className = 'partner-card card reveal';
    card.innerHTML = `
      ${brand}
      <h3>${escapeHtml(name)}</h3>
      <p class="partner-category">${escapeHtml(category)}</p>
      <p>${escapeHtml(description)}</p>
      ${linkHtml}
    `;
    partnersRoot.appendChild(card);
  });

  bindImageFallback(partnersRoot.querySelectorAll('.partner-logo'));
  initRevealAnimations(partnersRoot.querySelectorAll('.reveal'));
}

function getCurrentPageSlug() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  return filename.replace(/\.html$/, '') || 'index';
}

function normalizePageContent(payload, slug) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.title || payload.content || payload.image) {
    return {
      slug,
      title: payload.title || '',
      content: payload.content || '',
      image: payload.image || ''
    };
  }

  return null;
}

async function initSimplePageContent() {
  const slug = getCurrentPageSlug();
  const pageFile = pageContentFiles[slug];
  const directPayload = pageFile ? await fetchFirstJson(getStaticContentEndpoints(pageFile)) : null;
  let page = normalizePageContent(directPayload, slug);

  if (!page) {
    const payload = await fetchFirstJson(getStaticContentEndpoints(pagesContentPath));
    const pages = payload && Array.isArray(payload.pages) ? payload.pages : [];
    page = pages.find((item) => item.slug === slug);
  }

  if (!page) {
    return;
  }

  const title = page.title || '';
  const content = page.content || '';
  const image = page.image ? resolveCmsMediaUrl(page.image) : '';

  const heroTitle = document.querySelector('.page-hero h1') || document.querySelector('.hero-content h1');
  const heroText =
    document.querySelector('.page-hero p:not(.hero-tag)') || document.querySelector('.hero-content .hero-tag + h1 + p');
  const heroImage = document.querySelector('.hero-media img');

  if (title && heroTitle) {
    heroTitle.textContent = title;
  }

  if (content && heroText) {
    heroText.textContent = markdownToPlainText(content);
  }

  if (image && heroImage) {
    heroImage.src = image;
  }
}

function initMatchesCalendar() {
  const filtersRoot = document.getElementById('calendar-filters');
  const checkAllButton = document.getElementById('calendar-check-all');
  const uncheckAllButton = document.getElementById('calendar-uncheck-all');
  const countElement = document.getElementById('calendar-count');
  const emptyElement = document.getElementById('calendar-empty');
  const resultsRoot = document.getElementById('calendar-results');

  if (!filtersRoot || !checkAllButton || !uncheckAllButton || !countElement || !emptyElement || !resultsRoot) {
    return;
  }

  const teams = [...new Set(matches.map((match) => match.equipe))].sort((a, b) => a.localeCompare(b, 'fr'));

  teams.forEach((team, index) => {
    const item = document.createElement('div');
    item.className = 'calendar-filter-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = true;
    input.value = team;
    input.id = `calendar-team-${index + 1}`;

    const label = document.createElement('label');
    label.htmlFor = input.id;
    label.textContent = team;

    item.append(input, label);
    filtersRoot.appendChild(item);
  });

  const getSelectedTeams = () =>
    new Set(
      [...filtersRoot.querySelectorAll('input[type="checkbox"]:checked')].map((checkbox) => checkbox.value)
    );

  const sortMatches = (a, b) => {
    const dateDiff = a.date.localeCompare(b.date);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return toMinutes(a.heure) - toMinutes(b.heure);
  };

  const renderMatches = () => {
    const selectedTeams = getSelectedTeams();
    const filteredMatches = matches
      .filter((match) => selectedTeams.has(match.equipe))
      .sort(sortMatches);

    const total = filteredMatches.length;
    countElement.textContent = `${total} match${total > 1 ? 's' : ''} affiché${total > 1 ? 's' : ''}`;
    emptyElement.textContent = '';
    resultsRoot.innerHTML = '';

    if (selectedTeams.size === 0) {
      emptyElement.textContent = 'Sélectionnez au moins une équipe pour afficher les matchs.';
      return;
    }

    if (filteredMatches.length === 0) {
      emptyElement.textContent = 'Aucun match à afficher avec les filtres actuels.';
      return;
    }

    const monthGroups = new Map();

    filteredMatches.forEach((match) => {
      const dateObject = new Date(`${match.date}T00:00:00`);
      const monthKey = `${dateObject.getFullYear()}-${String(dateObject.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = capitalizeFirstLetter(monthFormatter.format(dateObject));

      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, { label: monthLabel, items: [] });
      }

      monthGroups.get(monthKey).items.push(match);
    });

    monthGroups.forEach((group) => {
      const monthSection = document.createElement('section');
      monthSection.className = 'calendar-month';

      const monthTitle = document.createElement('h3');
      monthTitle.className = 'calendar-month-title';
      monthTitle.textContent = group.label;

      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'calendar-matches-grid';

      group.items.forEach((match) => {
        const card = document.createElement('article');
        card.className = 'calendar-match-card';

        const dateObject = new Date(`${match.date}T00:00:00`);
        const readableDate = capitalizeFirstLetter(dateFormatter.format(dateObject));
        const typeClass = match.type === 'Domicile' ? 'home' : 'away';

        card.innerHTML = `
          <div class="calendar-match-meta">
            <span class="calendar-date">${readableDate}</span>
            <span class="type-badge ${typeClass}">${match.type}</span>
          </div>
          <p class="calendar-match-main">${match.equipe} vs ${match.adversaire}</p>
          <p class="calendar-match-info"><strong>Heure :</strong> ${match.heure}</p>
          <p class="calendar-match-info"><strong>Lieu :</strong> ${match.lieu}</p>
          <p class="calendar-match-info"><strong>Compétition :</strong> ${match.competition}</p>
        `;

        cardsGrid.appendChild(card);
      });

      monthSection.append(monthTitle, cardsGrid);
      resultsRoot.appendChild(monthSection);
    });
  };

  filtersRoot.addEventListener('change', renderMatches);

  checkAllButton.addEventListener('click', () => {
    filtersRoot.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = true;
    });
    renderMatches();
  });

  uncheckAllButton.addEventListener('click', () => {
    filtersRoot.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
    renderMatches();
  });

  renderMatches();
}

function initScorecoModules() {
  const modules = document.querySelectorAll('.scoreco-module');
  if (!modules.length) {
    return;
  }

  modules.forEach((module) => {
    const allTeamsCheckbox = module.querySelector('input[data-role="all-teams"]');
    const teamCheckboxes = [...module.querySelectorAll('input[data-role="team"]')];
    const widgets = [...module.querySelectorAll('.widget[data-team]')];
    const countElement = module.querySelector('.scoreco-count');
    const emptyElement = module.querySelector('.scoreco-empty');
    const checkAllButton = module.querySelector('.scoreco-check-all');
    const uncheckAllButton = module.querySelector('.scoreco-uncheck-all');

    if (!allTeamsCheckbox || !teamCheckboxes.length || !widgets.length || !countElement || !emptyElement) {
      return;
    }

    const getSelectedTeams = () =>
      new Set(teamCheckboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value));

    const updateView = () => {
      const selectedTeams = getSelectedTeams();

      widgets.forEach((widget) => {
        const teamKey = widget.dataset.team;
        const shouldShow = selectedTeams.has(teamKey);
        widget.hidden = !shouldShow;
      });

      const visibleCount = selectedTeams.size;
      countElement.textContent = `${visibleCount} équipe${visibleCount > 1 ? 's' : ''} affichée${visibleCount > 1 ? 's' : ''}`;

      if (visibleCount === 0) {
        emptyElement.textContent = 'Sélectionnez au moins une équipe';
      } else {
        emptyElement.textContent = '';
      }

      allTeamsCheckbox.checked = visibleCount === teamCheckboxes.length;
      allTeamsCheckbox.setAttribute('aria-checked', String(allTeamsCheckbox.checked));
    };

    const setAllTeams = (isChecked) => {
      teamCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      allTeamsCheckbox.checked = isChecked;
      updateView();
    };

    allTeamsCheckbox.addEventListener('change', () => {
      setAllTeams(allTeamsCheckbox.checked);
    });

    teamCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', updateView);
    });

    if (checkAllButton) {
      checkAllButton.addEventListener('click', () => {
        setAllTeams(true);
      });
    }

    if (uncheckAllButton) {
      uncheckAllButton.addEventListener('click', () => {
        setAllTeams(false);
      });
    }

    updateView();
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');

    if (isOpen && isMobileMenuMode()) {
      const firstMenuLink = navLinks.querySelector('a[href]');
      if (firstMenuLink) {
        firstMenuLink.focus();
      }
    }
  });

  navItems.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('open')) {
      return;
    }

    const clickedInsideNav = navLinks.contains(event.target) || menuToggle.contains(event.target);
    if (!clickedInsideNav) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!navLinks.classList.contains('open') || !isMobileMenuMode()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = [menuToggle, ...navLinks.querySelectorAll('a[href]')].filter(Boolean);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!focusable.includes(active)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

if (internalAnchors.length) {
  // Scroll fluide avec offset dynamique pour éviter le recouvrement par la navbar fixe.
  internalAnchors.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || href.length < 2) {
        return;
      }

      const target = document.getElementById(href.slice(1));
      if (!target) {
        return;
      }

      event.preventDefault();
      smoothScrollToHash(href);
    });
  });
}

if (nav) {
  // Renforce l'effet sticky en changeant le style après un léger scroll.
  const toggleNavScrolled = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };

  toggleNavScrolled();
  window.addEventListener('scroll', toggleNavScrolled, { passive: true });
}

let revealObserver = null;

function initRevealAnimations(elements) {
  if (!elements || elements.length === 0) {
    return;
  }

  const revealList = [...elements];

  revealList.forEach((element, index) => {
    if (element.classList.contains('visible')) {
      return;
    }
    const delay = Math.min(index * 0.04, 0.24);
    element.style.transitionDelay = `${delay}s`;
  });

  if (!('IntersectionObserver' in window)) {
    revealList.forEach((element) => {
      element.classList.add('visible');
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px'
      }
    );
  }

  revealList.forEach((element) => {
    if (!element.classList.contains('visible')) {
      revealObserver.observe(element);
    }
  });
}

function initFormValidation(form, options) {
  if (!form) {
    return;
  }

  const statusMessage = document.createElement('p');
  statusMessage.className = 'form-status';
  statusMessage.setAttribute('aria-live', 'polite');
  form.appendChild(statusMessage);

  const setFieldInvalid = (field, isInvalid) => {
    if (!field) {
      return;
    }
    field.classList.toggle('field-invalid', isInvalid);
    field.setAttribute('aria-invalid', String(isInvalid));
  };

  form.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
      return;
    }

    target.classList.remove('field-invalid');
    target.setAttribute('aria-invalid', 'false');
    if (statusMessage.classList.contains('is-error')) {
      statusMessage.className = 'form-status';
      statusMessage.textContent = '';
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = form.querySelector(options.nameSelector);
    const emailInput = form.querySelector(options.emailSelector);
    const phoneInput = options.phoneSelector ? form.querySelector(options.phoneSelector) : null;
    const messageInput = form.querySelector(options.messageSelector);

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    const errors = [];

    if (name.length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères.');
      setFieldInvalid(nameInput, true);
    } else {
      setFieldInvalid(nameInput, false);
    }

    if (!emailRegex.test(email)) {
      errors.push('Veuillez entrer une adresse e-mail valide.');
      setFieldInvalid(emailInput, true);
    } else {
      setFieldInvalid(emailInput, false);
    }

    if (phoneInput) {
      if (phone && !phoneRegex.test(phone)) {
        errors.push('Le numéro de téléphone semble invalide.');
        setFieldInvalid(phoneInput, true);
      } else {
        setFieldInvalid(phoneInput, false);
      }
    }

    if (options.requireMessage) {
      if (message.length < options.minMessageLength) {
        errors.push(`Le message doit contenir au moins ${options.minMessageLength} caractères.`);
        setFieldInvalid(messageInput, true);
      } else {
        setFieldInvalid(messageInput, false);
      }
    } else if (message.length > 0 && message.length < options.minMessageLength) {
      errors.push(`Si renseigné, le message doit contenir au moins ${options.minMessageLength} caractères.`);
      setFieldInvalid(messageInput, true);
    } else {
      setFieldInvalid(messageInput, false);
    }

    if (errors.length > 0) {
      statusMessage.className = 'form-status is-error';
      statusMessage.textContent = errors.join(' ');
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    console.log(options.consoleLabel, payload);

    statusMessage.className = 'form-status is-success';
    statusMessage.textContent = options.successMessage;
    form.reset();
  });
}

if (sportImages.length) {
  bindImageFallback(sportImages);
}

if (heroLogo) {
  heroLogo.addEventListener('error', () => {
    heroLogo.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'>" +
          "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
            "<stop offset='0%' stop-color='#0b2a52'/>" +
            "<stop offset='100%' stop-color='#1f5a96'/>" +
          "</linearGradient></defs>" +
          "<circle cx='210' cy='210' r='198' fill='url(#g)' stroke='#f8c836' stroke-width='12'/>" +
          "<text x='210' y='220' text-anchor='middle' fill='#fff' font-size='44' font-family='Arial, sans-serif' font-weight='700'>RVB</text>" +
        "</svg>"
      );
    heroLogo.alt = 'Logo RHUYS VOLLEY BALL (fallback)';
  });
}

setActiveNavLink();
alignHashWithNavbarOffset();
initRevealAnimations(revealElements);
initSimplePageContent();
initHomeNewsPreview();
initGallery();
initActualitesPage();
initArticlePage();
initBoutiquePage();
initPartnersPage();
initScorecoModules();
initFormValidation(contactForm, {
  nameSelector: '#name',
  emailSelector: '#email',
  phoneSelector: '#phone',
  messageSelector: '#message',
  minMessageLength: 10,
  requireMessage: true,
  successMessage: 'Merci ! Votre message a bien été envoyé.',
  consoleLabel: 'Simulation envoi formulaire contact RVB:'
});
initFormValidation(orderForm, {
  nameSelector: '#order-name',
  emailSelector: '#order-email',
  messageSelector: '#order-message',
  minMessageLength: 4,
  requireMessage: false,
  successMessage: 'Merci ! Votre demande de commande a bien été envoyée.',
  consoleLabel: 'Simulation envoi formulaire boutique RVB:'
});
initMatchesCalendar();
