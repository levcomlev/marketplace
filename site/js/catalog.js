/**
 * Каталог на главной: загрузка товаров, фильтры по категории и инструментам, рендер карточек.
 */

(function () {
  const FILTERS = [
    { value: '', label: 'Все товары' },
    { value: 'inst:guitar', label: 'Гитара' },
    { value: 'inst:piano', label: 'Фортепиано' },
    { value: 'inst:bass', label: 'Бас-гитара' },
    { value: 'inst:ukulele', label: 'Укулеле' },
    { value: 'inst:drum', label: 'Барабаны' },
    { value: 'Йога', label: 'Йога' },
    { value: 'Дети', label: 'Для детей' },
    { value: 'Планинг', label: 'Дисциплина' }
  ];

  const INSTRUMENT_IDS = {
    guitar: ['guitar', 'guitar_card'],
    piano: ['piano', 'piano_card', 'progression_accord'],
    bass: ['bass', 'bass_card'],
    ukulele: ['ukulele', 'ukulele_card'],
    drum: ['drum', 'drum_cards']
  };

  let products = [];
  let activeFilter = '';

  function renderFilters(container) {
    container.innerHTML = FILTERS.map(function (f) {
      const val = f.value || 'all';
      const isActive = val === (activeFilter || 'all') ? ' is-active' : '';
      return '<button type="button" class="catalog__filter' + isActive + '" data-filter="' + (f.value || 'all') + '">' + escapeHtml(f.label) + '</button>';
    }).join('');

    container.querySelectorAll('.catalog__filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = this.getAttribute('data-filter') === 'all' ? '' : this.getAttribute('data-filter');
        container.querySelectorAll('.catalog__filter').forEach(function (b) { b.classList.remove('is-active'); });
        this.classList.add('is-active');
        renderGrid(document.getElementById('catalog-grid'), products);
      });
    });
  }

  function renderCard(p) {
    const title = escapeHtml(p.title);
    const imgSrc = p.image_thumb || '';
    const imgAlt = title;

    let actions = '';
    if (p.has_digital && p.digital_price) {
      actions += '<span class="product-card__btn product-card__btn--secondary">Цифра ' + p.digital_price + ' ₽</span>';
    }

    const titleLink = 'product.html?id=' + encodeURIComponent(p.id);
    return (
      '<article class="product-card">' +
        '<div class="product-card__image-wrap">' +
          '<a href="' + escapeHtml(titleLink) + '"><img class="product-card__image" src="' + escapeHtml(imgSrc) + '" alt="' + imgAlt + '" loading="lazy"></a>' +
        '</div>' +
        '<div class="product-card__body">' +
          '<h3 class="product-card__title"><a href="' + escapeHtml(titleLink) + '">' + title + '</a></h3>' +
          (actions ? '<div class="product-card__actions">' + actions + '</div>' : '') +
        '</div>' +
      '</article>'
    );
  }

  function filterProducts(list) {
    if (!activeFilter || activeFilter === 'all') return list;
    if (activeFilter.indexOf('inst:') === 0) {
      const instrument = activeFilter.slice(5);
      const ids = INSTRUMENT_IDS[instrument];
      return ids ? list.filter(function (p) { return ids.indexOf(p.id) !== -1; }) : list;
    }
    return list.filter(function (p) { return p.category === activeFilter; });
  }

  function renderGrid(gridEl, list) {
    const filtered = filterProducts(list);
    gridEl.innerHTML = filtered.map(function (p) { return renderCard(p); }).join('');
  }

  function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function init() {
    const filtersEl = document.getElementById('catalog-filters');
    const gridEl = document.getElementById('catalog-grid');
    if (!filtersEl || !gridEl) return;

    renderFilters(filtersEl);

    fetch('data/products.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        products = data;
        renderGrid(gridEl, products);
      })
      .catch(function () {
        gridEl.innerHTML = '<p>Не удалось загрузить каталог.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
