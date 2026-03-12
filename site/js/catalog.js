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

  function getProductImages(p) {
    if (p.images && p.images.length) return p.images;
    const thumb = p.image_thumb || '';
    const count = (p.image_count != null && p.image_count > 1) ? Math.max(1, p.image_count) : 1;
    if (count <= 1) return [thumb];
    const lastSlash = thumb.lastIndexOf('/');
    const base = lastSlash >= 0 ? thumb.slice(0, lastSlash + 1) : '';
    const out = [];
    for (let i = 1; i <= count; i++) out.push(base + i + '.png');
    return out;
  }

  function renderCard(p) {
    const title = escapeHtml(p.title);
    const images = getProductImages(p);
    const imgSrc = images[0] || '';
    const imgAlt = title;
    const hasGallery = images.length > 1;

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
    const wrapClass = 'product-card__image-wrap' + (hasGallery ? ' product-card__image-wrap--has-gallery' : '');
    let imageBlock = '<a class="product-card__image-link product-card__image-link--single" href="' + escapeHtml(titleLink) + '"><img class="product-card__image" src="' + escapeHtml(imgSrc) + '" alt="' + imgAlt + '" loading="lazy"></a>';
    if (hasGallery) {
      const stripSlides = images.map(function (src, i) {
        return '<div class="product-card__gallery-slide"><img class="product-card__image" src="' + escapeHtml(src) + '" alt="' + imgAlt + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '"></div>';
      }).join('');
      const dotsHtml = '<div class="product-card__gallery-dots" aria-hidden="true">' +
        images.map(function (_, i) {
          return '<span class="product-card__gallery-dot' + (i === 0 ? ' is-active' : '') + '"></span>';
        }).join('') +
        '</div>';
      imageBlock +=
        '<a class="product-card__image-link product-card__image-link--gallery" href="' + escapeHtml(titleLink) + '" data-product-images="' + escapeHtml(JSON.stringify(images)) + '">' +
          '<div class="product-card__gallery-viewport">' +
            '<div class="product-card__gallery-strip" style="--card-gallery-n: ' + images.length + '">' + stripSlides + '</div>' +
          '</div>' +
        '</a>' +
        dotsHtml;
    }
    return (
      '<article class="product-card">' +
        '<div class="' + wrapClass + '">' + imageBlock + '</div>' +
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
    bindCardGalleries(gridEl);
  }

  function bindCardGalleries(container) {
    if (!container) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;
    const galleryLinks = container.querySelectorAll('.product-card__image-link--gallery');
    galleryLinks.forEach(function (link) {
      const wrap = link.closest('.product-card__image-wrap');
      const viewport = link.querySelector('.product-card__gallery-viewport');
      const strip = link.querySelector('.product-card__gallery-strip');
      const dotsEl = wrap ? wrap.querySelector('.product-card__gallery-dots') : null;
      if (!viewport || !strip) return;
      let current = 0;
      const n = parseInt(strip.style.getPropertyValue('--card-gallery-n'), 10) || 1;
      if (n <= 1) return;

      function getWidth() { return viewport.offsetWidth || 0; }
      function setTransform(px) { strip.style.transform = 'translateX(' + px + 'px)'; }
      function setDotsActive(index) {
        if (!dotsEl) return;
        const dots = dotsEl.querySelectorAll('.product-card__gallery-dot');
        dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === index); });
      }

      let touchStartX = 0;
      let didSwipe = false;

      link.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          didSwipe = false;
        }
      }, { passive: true });

      link.addEventListener('touchmove', function (e) {
        if (!e.touches || !e.touches[0] || n <= 1) return;
        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX;
        if (Math.abs(diffX) > 10) {
          didSwipe = true;
          e.preventDefault();
          const w = getWidth();
          if (!w) return;
          const maxDrag = w * 0.3;
          let clamped = diffX;
          if (current <= 0 && diffX > 0) clamped = Math.min(diffX, maxDrag);
          if (current >= n - 1 && diffX < 0) clamped = Math.max(diffX, -maxDrag);
          strip.style.transition = 'none';
          setTransform(-current * w + clamped);
        }
      }, { passive: false });

      link.addEventListener('touchend', function (e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          const next = diff > 0 ? Math.min(current + 1, n - 1) : Math.max(current - 1, 0);
          if (next !== current) {
            current = next;
            setDotsActive(current);
            const w = getWidth();
            if (w) {
              strip.style.transition = 'transform 0.25s ease-out';
              setTransform(-current * w);
            }
          } else {
            const w = getWidth();
            if (w) {
              strip.style.transition = 'transform 0.25s ease-out';
              setTransform(-current * w);
            }
          }
        } else {
          const w = getWidth();
          if (w) {
            strip.style.transition = 'transform 0.25s ease-out';
            setTransform(-current * w);
          }
        }
      }, { passive: true });

      link.addEventListener('click', function (e) {
        if (didSwipe) {
          e.preventDefault();
        }
      }, false);

      const w = getWidth();
      if (w) {
        strip.style.transition = 'none';
        setTransform(-current * w);
      }
    });
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
