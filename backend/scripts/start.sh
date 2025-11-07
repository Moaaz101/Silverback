#!/bin/sh
# Production startup script
# Runs migrations then starts the server

echo "Starting Silverback Backend..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if migrations succeeded
if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# Generate Prisma Client (in case it's missing)
echo "Generating Prisma Client..."
npx prisma generate

# Start the server
echo "Starting Express server..."
node index.js