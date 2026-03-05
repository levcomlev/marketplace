#!/usr/bin/env node
/**
 * Собирает content/products/ в site/data/products.json (для каталога)
 * и site/data/products/<id>.json (полные данные для страницы товара, с галереей).
 * Запуск из корня проекта: node scripts/build-products-json.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'content/products/index.json');
const OUT_DIR = path.join(ROOT, 'site/data');
const OUT_PATH = path.join(OUT_DIR, 'products.json');
const OUT_PRODUCTS_DIR = path.join(OUT_DIR, 'products');
const IMAGES_DIR = path.join(ROOT, 'site/images/products');

const NUMERIC_IMAGE_RE = /^(\d+)\.(jpg|jpeg|png|webp)$/i;

function getNumberedImages(productId) {
  const dir = path.join(IMAGES_DIR, productId);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter(function (name) { return NUMERIC_IMAGE_RE.test(name); })
    .sort(function (a, b) {
      const nA = parseInt(NUMERIC_IMAGE_RE.exec(a)[1], 10);
      const nB = parseInt(NUMERIC_IMAGE_RE.exec(b)[1], 10);
      return nA - nB;
    });
  if (files.length === 0) return null;
  return files.map(function (name) { return 'images/products/' + productId + '/' + name; });
}

const INSTRUMENT_IDS = {
  guitar: ['guitar', 'guitar_card'],
  piano: ['piano', 'piano_card', 'progression_accord'],
  bass: ['bass', 'bass_card'],
  ukulele: ['ukulele', 'ukulele_card'],
  drum: ['drum', 'drum_cards'],
  circle: ['krug']
};

const RATING_BY_GROUP = {
  guitar: { rating: 4.9, reviews_count: 1337 },
  piano: { rating: 4.9, reviews_count: 878 },
  bass: { rating: 4.9, reviews_count: 456 },
  ukulele: { rating: 4.9, reviews_count: 94 },
  drum: { rating: 4.9, reviews_count: 203 },
  circle: { rating: 4.8, reviews_count: 263 },
  'Йога': { rating: 4.9, reviews_count: 245 },
  'Дети': { rating: 5.0, reviews_count: 18 },
  'Планинг': { rating: 5.0, reviews_count: 6 },
  'Программирование': { rating: 5.0, reviews_count: 8 }
};

function getRatingForProduct(id, category) {
  for (const [inst, ids] of Object.entries(INSTRUMENT_IDS)) {
    if (ids.indexOf(id) !== -1 && RATING_BY_GROUP[inst]) return RATING_BY_GROUP[inst];
  }
  if (category && RATING_BY_GROUP[category]) return RATING_BY_GROUP[category];
  return null;
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));

const products = index.map(function (id) {
  const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/products', id, 'product.json'), 'utf8'));
  const numbered = getNumberedImages(id);
  const image_thumb = numbered ? numbered[0] : p.image_thumb;
  const ratingData = getRatingForProduct(id, p.category);
  const out = {
    id: p.id,
    title: p.title,
    image_thumb: image_thumb,
    category: p.category,
    link_ozon: p.link_ozon || null,
    link_wb: p.link_wb || null,
    has_digital: p.has_digital || false,
    digital_price: p.digital_price
  };
  if (ratingData) {
    out.rating = ratingData.rating;
    out.reviews_count = ratingData.reviews_count;
  }
  return out;
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log('Written', OUT_PATH, '(' + products.length + ' products)');

if (!fs.existsSync(OUT_PRODUCTS_DIR)) fs.mkdirSync(OUT_PRODUCTS_DIR, { recursive: true });
index.forEach(function (id) {
  const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/products', id, 'product.json'), 'utf8'));
  const numbered = getNumberedImages(id);
  const images = numbered || (Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image_main]);
  const image_main = images[0];
  const image_thumb = images[0];
  const ratingData = getRatingForProduct(id, p.category);
  const full = {
    id: p.id,
    title: p.title,
    description_short: p.description_short || '',
    description_full: p.description_full || '',
    image_main: image_main,
    image_thumb: image_thumb,
    images: images,
    category: p.category,
    type: p.type,
    subject: p.subject,
    format: p.format,
    country: p.country,
    material: p.material,
    link_ozon: p.link_ozon || null,
    link_wb: p.link_wb || null,
    has_digital: p.has_digital || false,
    digital_price: p.digital_price,
    digital_format: p.digital_format || null
  };
  if (ratingData) {
    full.rating = ratingData.rating;
    full.reviews_count = ratingData.reviews_count;
  }
  fs.writeFileSync(path.join(OUT_PRODUCTS_DIR, id + '.json'), JSON.stringify(full, null, 2), 'utf8');
});
console.log('Written', OUT_PRODUCTS_DIR, '(' + index.length + ' product files)');
