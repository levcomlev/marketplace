/**
 * Страница товара: загрузка по id, галерея (клик по краям изображения, свайп), описание, кнопки.
 */
(function () {
  function getProductId() {
    var match = /[?&]id=([^&]+)/.exec(window.location.search);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderGallery(container, images, productTitle) {
    if (!images || images.length === 0) return '';
    var dots = images.length > 1
      ? '<div class="product-gallery__dots" id="product-gallery-dots">' +
        images.map(function (_, i) {
          return '<button type="button" class="product-gallery__dot' + (i === 0 ? ' is-active' : '') + '" data-index="' + i + '" aria-label="Фото ' + (i + 1) + '"></button>';
        }).join('') +
        '</div>'
      : '';
    return (
      '<div class="product-gallery">' +
        '<div class="product-gallery__stage">' +
          '<div class="product-gallery__stage-inner" id="product-gallery-inner">' +
            '<img class="product-gallery__image" id="product-gallery-img" src="' + escapeHtml(images[0]) + '" alt="' + escapeHtml(productTitle) + '">' +
            (images.length > 1
              ? '<div class="product-gallery__zone product-gallery__zone--prev" data-action="prev" aria-hidden="true">' +
                '<span class="product-gallery__arrow product-gallery__arrow--prev" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></span></div>' +
                '<div class="product-gallery__zone product-gallery__zone--next" data-action="next" aria-hidden="true">' +
                '<span class="product-gallery__arrow product-gallery__arrow--next" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></span></div>'
              : '') +
          '</div>' +
        '</div>' +
        dots +
      '</div>'
    );
  }

  function bindGallery(images) {
    if (!images || images.length < 2) return;
    var current = 0;
    var imgEl = document.getElementById('product-gallery-img');
    var innerEl = document.getElementById('product-gallery-inner');
    var dotsEl = document.getElementById('product-gallery-dots');
    if (!imgEl || !innerEl) return;

    function show(index) {
      current = (index + images.length) % images.length;
      imgEl.src = images[current];
      if (dotsEl) {
        dotsEl.querySelectorAll('.product-gallery__dot').forEach(function (d, i) {
          d.classList.toggle('is-active', i === current);
        });
      }
    }

    function go(delta) {
      show(current + delta);
    }

    innerEl.addEventListener('click', function (e) {
      var zone = e.target.closest('[data-action]');
      if (!zone) return;
      if (zone.getAttribute('data-action') === 'prev') go(-1);
      else go(1);
    });

    if (dotsEl) {
      dotsEl.addEventListener('click', function (e) {
        var dot = e.target.closest('.product-gallery__dot[data-index]');
        if (dot) show(parseInt(dot.getAttribute('data-index'), 10));
      });
    }

    var touchStartX = 0;
    innerEl.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
    }, { passive: true });
    innerEl.addEventListener('touchend', function (e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      var touchEndX = e.changedTouches[0].clientX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) go(1);
        else go(-1);
      }
    }, { passive: true });
  }

  function renderProduct(data) {
    var images = data.images && data.images.length ? data.images : [data.image_main];
    var title = escapeHtml(data.title);
    var shortDesc = data.description_short ? escapeHtml(data.description_short) : '';
    var actions = '';
    if (data.link_ozon) {
      actions += '<a class="product__btn product__btn--ozon" href="' + escapeHtml(data.link_ozon) + '" target="_blank" rel="noopener noreferrer">Купить на Ozon</a>';
    }
    if (data.link_wb) {
      actions += '<a class="product__btn product__btn--wb" href="' + escapeHtml(data.link_wb) + '" target="_blank" rel="noopener noreferrer">Купить на Wildberries</a>';
    }
    if (data.has_digital && data.digital_price) {
      actions += '<span class="product__btn product__btn--digital product__btn--secondary">Цифровая версия — ' + data.digital_price + ' ₽</span>';
    }

    var specs = [];
    if (data.type) specs.push({ label: 'Тип', value: data.type });
    if (data.subject) specs.push({ label: 'Предмет', value: data.subject });
    if (data.format) specs.push({ label: 'Формат', value: data.format });
    if (data.country) specs.push({ label: 'Страна', value: data.country });
    if (data.material) specs.push({ label: 'Материал', value: data.material });
    var specsHtml = specs.length
      ? '<dl class="product__specs">' + specs.map(function (s) {
          return '<dt class="product__specs-dt">' + escapeHtml(s.label) + '</dt><dd class="product__specs-dd">' + escapeHtml(s.value) + '</dd>';
        }).join('') + '</dl>'
      : '';

    function reviewsLabel(n) {
      if (n % 10 === 1 && n % 100 !== 11) return n + ' отзыв';
      if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return n + ' отзыва';
      return n + ' отзывов';
    }
    var hasReviewsBlock = !!(data.reviews && data.reviews.length > 0);
    var reviewsCount = hasReviewsBlock ? data.reviews.length : (data.reviews_count != null ? data.reviews_count : 0);
    var ratingHtml = '';
    if (data.rating != null && data.reviews_count != null) {
      var ratingText = '<span class="product__rating-star">★</span> ' + escapeHtml(String(data.rating)) + ' • ' + reviewsLabel(data.reviews_count);
      ratingHtml = hasReviewsBlock
        ? '<a href="#product-reviews" class="product__rating product__rating-link">' + ratingText + '</a>'
        : '<p class="product__rating">' + ratingText + '</p>';
    } else if (hasReviewsBlock && reviewsCount > 0) {
      ratingHtml = '<a href="#product-reviews" class="product__rating product__rating-link"><span class="product__rating-star">★</span> ' + reviewsLabel(reviewsCount) + '</a>';
    }

    var priceHtml = '';
    if (data.price != null) {
      var priceStr = data.price + ' ₽';
      var oldStr = data.price_old != null ? '<span class="product__price-old">' + escapeHtml(String(data.price_old)) + ' ₽</span> ' : '';
      priceHtml = '<p class="product__price">' + oldStr + '<span class="product__price-current">' + escapeHtml(String(data.price)) + ' ₽</span></p>';
    }

    var ratingRowHtml = (ratingHtml || priceHtml || actions)
      ? '<div class="product__rating-row">' + (ratingHtml || '') + (priceHtml || '') + (actions ? '<div class="product__actions">' + actions + '</div>' : '') + '</div>'
      : '';

    var reviewsHtml = '';
    if (data.reviews && data.reviews.length > 0) {
      reviewsHtml =
        '<section id="product-reviews" class="product-reviews" aria-label="Отзывы">' +
        '<h2 class="product-reviews__title">Отзывы</h2>' +
        data.reviews.map(function (r) {
          var author = escapeHtml(r.author);
          var text = escapeHtml(r.text || '').replace(/\n/g, '<br>');
          return (
            '<div class="product-review">' +
            '<p class="product-review__head">' +
            '<span class="product-review__author">' + author + '</span> ' +
            '<span class="product-review__stars" aria-hidden="true">★★★★★</span>' +
            '</p>' +
            '<div class="product-review__text">' + text + '</div>' +
            '</div>'
          );
        }).join('') +
        '</section>';
    }

    var html =
      '<div class="product__top">' +
        '<div class="product__col-image">' +
          renderGallery(null, images, data.title) +
        '</div>' +
        '<div class="product__col-info">' +
          '<h1 class="product__title">' + title + '</h1>' +
          ratingRowHtml +
          (shortDesc ? '<div class="product__short-desc">' + shortDesc + '</div>' : '') +
          specsHtml +
        '</div>' +
      '</div>' +
      reviewsHtml;

    document.getElementById('product-root').innerHTML = html;
    bindGallery(images);

    var hasOzon = !!data.link_ozon;
    var hasWb = !!data.link_wb;
    var hasDigital = !!(data.has_digital && data.digital_price);
    if (hasOzon || hasWb || hasDigital) {
      var existingBar = document.getElementById('product-sticky-bar');
      if (existingBar) existingBar.remove();
      var bar = document.createElement('div');
      bar.id = 'product-sticky-bar';
      bar.className = 'product-sticky-bar';
      var menuParts = [];
      if (data.link_ozon) menuParts.push('<a class="product-sticky-bar__btn product-sticky-bar__btn--ozon" href="' + escapeHtml(data.link_ozon) + '" target="_blank" rel="noopener noreferrer">Ozon</a>');
      if (data.link_wb) menuParts.push('<a class="product-sticky-bar__btn product-sticky-bar__btn--wb" href="' + escapeHtml(data.link_wb) + '" target="_blank" rel="noopener noreferrer">Wildberries</a>');
      if (hasDigital) menuParts.push('<span class="product-sticky-bar__btn product-sticky-bar__btn--digital">Цифровая версия — ' + data.digital_price + ' ₽</span>');
      bar.innerHTML =
        '<a href="index.html" class="product-sticky-bar__brand">komlew.posters</a>' +
        '<button type="button" class="product-sticky-bar__toggle" id="product-sticky-bar-toggle" aria-expanded="false">Купить</button>' +
        '<div class="product-sticky-bar__menu" id="product-sticky-bar-menu">' + menuParts.join('') + '</div>';
      document.body.appendChild(bar);
      document.body.classList.add('has-product-sticky-bar');
      var toggleBtn = document.getElementById('product-sticky-bar-toggle');
      var menuEl = document.getElementById('product-sticky-bar-menu');
      if (toggleBtn && menuEl) {
        toggleBtn.addEventListener('click', function () {
          var open = bar.classList.toggle('is-open');
          toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
    }

    fetch('data/products.json')
      .then(function (r) { return r.json(); })
      .then(function (allProducts) {
        var currentId = data.id;
        var currentCategory = data.category;
        var sameCategory = allProducts.filter(function (p) {
          return p.id !== currentId && p.category === currentCategory;
        });
        var krug = allProducts.filter(function (p) { return p.id === 'krug'; })[0];
        var list = sameCategory.slice();
        if (krug && krug.id !== currentId && list.every(function (p) { return p.id !== 'krug'; })) {
          list.push(krug);
        }
        list = list.slice(0, 6);
        if (list.length === 0) return;
        var recommendEl = document.getElementById('product-recommend');
        if (!recommendEl) return;
        recommendEl.hidden = false;
        recommendEl.innerHTML =
          '<h2 class="product-recommend__title">Рекомендуем также</h2>' +
          '<div class="product-recommend__grid">' +
          list.map(function (p) {
            var t = escapeHtml(p.title);
            var link = 'product.html?id=' + encodeURIComponent(p.id);
            var img = escapeHtml(p.image_thumb || p.image_main || '');
            return '<a class="product-recommend__card" href="' + link + '">' +
              '<span class="product-recommend__card-image-wrap">' +
              '<img class="product-recommend__card-image" src="' + img + '" alt="" loading="lazy">' +
              '</span>' +
              '<span class="product-recommend__card-title">' + t + '</span>' +
              '</a>';
          }).join('') +
          '</div>';
      })
      .catch(function () {});
  }

  function init() {
    var id = getProductId();
    var root = document.getElementById('product-root');
    var err = document.getElementById('product-error');

    if (!id) {
      root.innerHTML = '';
      err.hidden = false;
      return;
    }

    fetch('data/products/' + encodeURIComponent(id) + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(function (data) {
        err.hidden = true;
        document.title = data.title + ' — Komlew.posters';
        renderProduct(data);
      })
      .catch(function () {
        root.innerHTML = '';
        err.hidden = false;
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
