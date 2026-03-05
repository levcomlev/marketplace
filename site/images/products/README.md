# Картинки товаров: одна папка на товар

Правило: **один товар = одна папка**. Имя папки = ID товара (как в `content/products/<id>/`).

Примеры:
- `site/images/products/poster-1/` — только картинки товара с id `poster-1`
- `site/images/products/azbuka/` — только картинки товара `azbuka`

Внутри папки — файлы этого товара, например:
- `main.jpg` — основное фото
- `thumb.jpg` — превью для каталога (опционально)

В `content/products/<id>/product.json` указываете пути вида: `images/products/poster-1/main.jpg`. Так картинки разных товаров не пересекаются.
