#!/bin/bash

echo "Тестирование авторизации..."

# Регистрация
echo "1. Тест регистрации"
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Логин
echo "2. Тест логина"
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "Тесты завершены"


