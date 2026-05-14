(function () {
  const cms = window.CMS;
  const h = window.h || (window.React && window.React.createElement);

  if (!cms || !h) {
    return;
  }

  cms.registerPreviewStyle('/admin/preview.css');

  const get = (entry, key, fallback = '') => entry.getIn(['data', key]) || fallback;
  const toJs = (value) => (value && typeof value.toJS === 'function' ? value.toJS() : value);
  const list = (entry, key) => {
    const value = toJs(get(entry, key, []));
    return Array.isArray(value) ? value : [];
  };
  const imageUrl = (value) => value || '/assets/logo-rhuys-volley-ball.png';
  const text = (value, fallback = '') => String(value || fallback);

  function Layout(props) {
    return h('main', { className: 'rvb-preview' }, props.children);
  }

  function Header(props) {
    return h(
      'header',
      { className: 'rvb-preview-header' },
      h('p', { className: 'rvb-preview-kicker' }, props.kicker),
      h('h1', null, props.title),
      props.description ? h('p', null, props.description) : null
    );
  }

  function Empty(props) {
    return h('p', { className: 'rvb-empty' }, props.children || 'Ajoutez un premier contenu pour voir l’aperçu.');
  }

  function Card(props) {
    return h(
      'article',
      { className: 'rvb-card' },
      props.image ? h('img', { className: 'rvb-card-media', src: imageUrl(props.image), alt: '' }) : null,
      h('div', { className: 'rvb-card-body' }, props.children)
    );
  }

  function ArticlesPreview(props) {
    const articles = list(props.entry, 'articles');
    return h(
      Layout,
      null,
      h(Header, {
        kicker: 'Actualités',
        title: 'Aperçu des articles',
        description: 'Visualisation rapide de la grille qui apparaîtra sur la page Actualités.'
      }),
      articles.length
        ? h(
            'section',
            { className: 'rvb-preview-grid' },
            articles.map((article, index) =>
              h(
                Card,
                { key: index, image: article.image || article.featured_image },
                h('span', { className: 'rvb-badge' }, text(article.category, 'Club')),
                h('h3', null, text(article.title, 'Titre de l’article')),
                h('p', null, text(article.date, 'Date à renseigner')),
                h('p', null, text(article.excerpt, 'Extrait de l’article'))
              )
            )
          )
        : h(Empty, null)
    );
  }

  function GalleryPreview(props) {
    const photos = list(props.entry, 'gallery');
    return h(
      Layout,
      null,
      h(Header, {
        kicker: 'Galerie',
        title: 'Aperçu des photos',
        description: 'Chaque carte représente une photo visible dans la galerie du site.'
      }),
      photos.length
        ? h(
            'section',
            { className: 'rvb-preview-grid' },
            photos.map((photo, index) =>
              h(
                Card,
                { key: index, image: photo.image },
                h('span', { className: 'rvb-badge' }, text(photo.category, 'Club')),
                h('h3', null, text(photo.title, 'Titre de la photo')),
                h('p', null, text(photo.description, 'Description courte'))
              )
            )
          )
        : h(Empty, null)
    );
  }

  function ProductsPreview(props) {
    const products = list(props.entry, 'products');
    return h(
      Layout,
      null,
      h(Header, {
        kicker: 'Boutique',
        title: 'Aperçu du catalogue',
        description: 'Vérifiez rapidement l’image, le prix, le statut et le descriptif de chaque produit.'
      }),
      products.length
        ? h(
            'section',
            { className: 'rvb-preview-grid' },
            products.map((product, index) =>
              h(
                Card,
                { key: index, image: product.image },
                h('span', { className: 'rvb-badge' }, text(product.status, 'indisponible')),
                h('h3', null, text(product.name, 'Nom du produit')),
                h('p', { className: 'rvb-price' }, text(product.price, 'Prix')),
                h('p', null, text(product.shortDescription, 'Description courte'))
              )
            )
          )
        : h(Empty, null)
    );
  }

  function TeamsPreview(props) {
    const teams = list(props.entry, 'teams');
    return h(
      Layout,
      null,
      h(Header, {
        kicker: 'Équipes',
        title: 'Aperçu des équipes',
        description: 'Vérifiez les images, horaires, lieux et points clés affichés sur la page Équipes.'
      }),
      teams.length
        ? h(
            'section',
            { className: 'rvb-preview-grid' },
            teams.map((team, index) =>
              h(
                Card,
                { key: index, image: team.image },
                h('span', { className: 'rvb-badge' }, text(team.age, 'Catégorie')),
                h('h3', null, text(team.name, 'Nom de l’équipe')),
                h('p', { className: 'rvb-price' }, text(team.schedule, 'Horaire à renseigner')),
                h('p', null, text(team.location, 'Lieu à renseigner')),
                h('p', null, text(team.description, 'Description de l’équipe'))
              )
            )
          )
        : h(Empty, null)
    );
  }

  function PartnersPreview(props) {
    const partners = list(props.entry, 'partners');
    return h(
      Layout,
      null,
      h(Header, {
        kicker: 'Partenaires',
        title: 'Aperçu des partenaires',
        description: 'Contrôlez les logos, catégories et descriptions avant publication.'
      }),
      partners.length
        ? h(
            'section',
            { className: 'rvb-preview-grid' },
            partners.map((partner, index) =>
              h(
                Card,
                { key: index, image: partner.logo },
                h('span', { className: 'rvb-badge' }, text(partner.category, 'Partenaire local')),
                h('h3', null, text(partner.name, 'Nom du partenaire')),
                h('p', null, text(partner.description, 'Description du partenaire'))
              )
            )
          )
        : h(Empty, null)
    );
  }

  function TrainingPreview(props) {
    const slots = list(props.entry, 'training');
    return h(
      Layout,
      null,
      h(Header, {
        kicker: 'Horaires',
        title: 'Aperçu des entraînements',
        description: 'Vue claire des créneaux par équipe, jour, horaire et lieu.'
      }),
      slots.length
        ? h(
            'section',
            { className: 'rvb-schedule' },
            slots.map((slot, index) =>
              h(
                'article',
                { key: index, className: 'rvb-schedule-row' },
                h('strong', null, text(slot.team, 'Équipe')),
                h('span', null, text(slot.day, 'Jour')),
                h('span', null, text(slot.time, 'Horaire')),
                h('span', null, `${text(slot.location, 'Ville')} ${slot.venue ? `- ${slot.venue}` : ''}`)
              )
            )
          )
        : h(Empty, null)
    );
  }

  function PagePreview(props) {
    const title = text(get(props.entry, 'title'), 'Titre de la page');
    const content = text(get(props.entry, 'content'), 'Texte de présentation de la page.');
    const image = text(get(props.entry, 'image'));
    return h(
      Layout,
      null,
      h(
        'article',
        { className: 'rvb-page-preview' },
        h(
          'section',
          {
            className: `rvb-page-hero${image ? ' has-image' : ''}`,
            style: image
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(11, 35, 64, 0.16), rgba(11, 35, 64, 0.88)), url(${imageUrl(image)})`
                }
              : null
          },
          h('p', { className: 'rvb-preview-kicker' }, 'Page du site'),
          h('h1', null, title)
        ),
        h('div', { className: 'rvb-page-content' }, h('p', null, content))
      )
    );
  }

  cms.registerPreviewTemplate('articles', ArticlesPreview);
  cms.registerPreviewTemplate('gallery', GalleryPreview);
  cms.registerPreviewTemplate('teams', TeamsPreview);
  cms.registerPreviewTemplate('products', ProductsPreview);
  cms.registerPreviewTemplate('partners', PartnersPreview);
  cms.registerPreviewTemplate('training', TrainingPreview);
  cms.registerPreviewTemplate('pages', PagePreview);
})();
