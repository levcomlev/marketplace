/**
 * Каталог на главной: загрузка товаров, фильтры по категории и инструментам, рендер карточек.
 */

(function () {
  const FILTERS = [
    { value: '', label: 'Каталог' },
    { value: 'inst:guitar', label: 'Гитара' },
    { value: 'inst:piano', label: 'Фортепиано' },
    { value: 'inst:bass', label: 'Бас-гитара' },
    { value: 'inst:ukulele', label: 'Укулеле' },
    { value: 'inst:drum', label: 'Барабаны' },
    { value: 'inst:circle', label: 'Кварто-квинтовый круг' },
    { value: 'Йога', label: 'Йога' },
    { value: 'Дети', label: 'Для детей' },
    { value: 'Планинг', label: 'Дисциплина' }
  ];

  const INSTRUMENT_IDS = {
    guitar: ['guitar', 'guitar_card'],
    piano: ['piano', 'piano_card', 'progression_accord'],
    bass: ['bass', 'bass_card'],
    ukulele: ['ukulele', 'ukulele_card'],
    drum: ['drum', 'drum_cards'],
    circle: ['krug']
  };

  let products = [];
  let activeFilter = '';
  let filtersOpen = false;

  function renderFilters(container) {
    const first = FILTERS[0];
    const rest = FILTERS.slice(1);
    const triggerActive = !activeFilter || activeFilter === 'all' ? ' is-active' : '';
    container.innerHTML =
      '<button type="button" class="catalog__filter catalog__filter--trigger' + triggerActive + '" data-filter="' + (first.value || 'all') + '" aria-expanded="false">' + escapeHtml(first.label) + '</button>' +
      '<div class="catalog__filters-list" id="catalog-filters-list" hidden>' +
      rest.map(function (f) {
        const val = f.value || 'all';
        const isActive = val === activeFilter ? ' is-active' : '';
        return '<button type="button" class="catalog__filter" data-filter="' + (f.value || 'all') + '">' + escapeHtml(f.label) + '</button>';
      }).join('') +
      '</div>';

    const triggerBtn = container.querySelector('.catalog__filter--trigger');
    const listEl = document.getElementById('catalog-filters-list');

    triggerBtn.addEventListener('click', function () {
      if (!filtersOpen) {
        filtersOpen = true;
        listEl.hidden = false;
        triggerBtn.setAttribute('aria-expanded', 'true');
      }
      activeFilter = '';
      triggerBtn.classList.add('is-active');
      container.querySelectorAll('.catalog__filter:not(.catalog__filter--trigger)').forEach(function (b) { b.classList.remove('is-active'); });
      renderGrid(document.getElementById('catalog-grid'), products);
    });

    container.querySelectorAll('.catalog__filter:not(.catalog__filter--trigger)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeFilter = this.getAttribute('data-filter') === 'all' ? '' : this.getAttribute('data-filter');
        container.querySelectorAll('.catalog__filter').forEach(function (b) { b.classList.remove('is-active'); });
        this.classList.add('is-active');
        renderGrid(document.getElementById('catalog-grid'), products);
      });
    });
  }

  function reviewsLabel(n) {
    if (n % 10 === 1 && n % 100 !== 11) return n + ' отзыв';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return n + ' отзыва';
    return n + ' отзывов';
  }

  function renderCard(p) {
    const title = escapeHtml(p.title);
    const imgSrc = p.image_thumb || '';
    const imgAlt = title;

    let actions = '';
    if (p.has_digital && p.digital_price) {
      actions += '<span class="product-card__btn product-card__btn--secondary">Цифра ' + p.digital_price + ' ₽</span>';
    }

    const priceHtml = (p.price != null)
      ? '<p class="product-card__price">' +
        (p.price_old != null ? '<span class="product-card__price-old">' + p.price_old + ' ₽</span> ' : '') +
        '<span class="product-card__price-current">' + p.price + ' ₽</span></p>'
      : '';

    const ratingHtml = (p.rating != null && p.reviews_count != null)
      ? '<p class="product-card__rating"><span class="product-card__rating-star">★</span> ' + escapeHtml(String(p.rating)) + ' • ' + reviewsLabel(p.reviews_count) + '</p>'
      : '';

    const titleLink = 'product.html?id=' + encodeURIComponent(p.id);
    return (
      '<article class="product-card">' +
        '<div class="product-card__image-wrap">' +
          '<a href="' + escapeHtml(titleLink) + '"><img class="product-card__image" src="' + escapeHtml(imgSrc) + '" alt="' + imgAlt + '" loading="lazy"></a>' +
        '</div>' +
        '<div class="product-card__body">' +
          '<h3 class="product-card__title"><a href="' + escapeHtml(titleLink) + '">' + title + '</a></h3>' +
          (priceHtml ? priceHtml : '') +
          (ratingHtml ? ratingHtml : '') +
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

    if (window.matchMedia('(min-width: 768px)').matches) {
      const listEl = document.getElementById('catalog-filters-list');
      if (listEl) {
        listEl.hidden = false;
        filtersOpen = true;
      }
    }

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
