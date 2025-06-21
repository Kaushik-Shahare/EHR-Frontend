#!/bin/bash

echo "Clearing Next.js cache..."
rm -rf .next/cache

echo "Restarting Next.js development server..."
npm run dev
