#!/bin/sh

echo "Esperando a la base de datos en $DB_HOST..."

while ! nc -z "$DB_HOST" 5432; do
  sleep 1
done

echo "Base de datos lista."

# Ejecutar migraciones y seeders
echo "Ejecutando migraciones..."
npx sequelize-cli db:migrate

echo "Ejecutando seeders..."
npx sequelize-cli db:seed:all

# Inicio de la app
exec "$@"
