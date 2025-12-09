#!/bin/bash

# Test script for Vercel API endpoint
# Replace with your actual Vercel URL
VERCEL_URL="https://ai-engineering-challenge-neqzar9lq-johns-projects-415474d0.vercel.app"

echo "Testing GET endpoint..."
curl -s "$VERCEL_URL/api/chat"
echo -e "\n\n"

echo "Testing POST endpoint..."
curl -X POST "$VERCEL_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' \
  -w "\n\nHTTP Status: %{http_code}\n"



