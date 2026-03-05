#!/usr/bin/env node
/**
 * Собирает content/products/ в site/data/products.json.
 * Запуск из корня проекта: node scripts/build-products-json.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'content/products/index.json');
const OUT_DIR = path.join(ROOT, 'site/data');
const OUT_PATH = path.join(OUT_DIR, 'products.json');

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
const products = index.map(function (id) {
  const p = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/products', id, 'product.json'), 'utf8'));
  return {
    id: p.id,
    title: p.title,
    image_thumb: p.image_thumb,
    category: p.category,
    link_ozon: p.link_ozon || null,
    link_wb: p.link_wb || null,
    has_digital: p.has_digital || false,
    digital_price: p.digital_price
  };
});

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log('Written', OUT_PATH, '(' + products.length + ' products)');
