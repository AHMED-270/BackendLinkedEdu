FROM php:8.3-cli-alpine

# System dependencies and PHP extensions required by Laravel + SQLite
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    netcat-openbsd \
    sqlite-dev \
    composer \
    && docker-php-ext-install pdo_sqlite mbstring bcmath intl zip

WORKDIR /var/www/html

# Copy application source
COPY . .

# Install PHP dependencies
RUN composer --version \
    && composer install --no-interaction --no-dev --prefer-dist --optimize-autoloader \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

ENV APP_ENV=production \
    APP_DEBUG=false \
    PORT=8080 \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/database/database.sqlite \
    RUN_MIGRATIONS=true

EXPOSE 8080

# Railway starts this container using the injected PORT value.
CMD ["start.sh"]
