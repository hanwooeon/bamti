#!/bin/bash
set -e

echo "=== PostgreSQL 설정 시작 ==="

# 1. PostgreSQL 서비스 시작
echo "1️⃣ PostgreSQL 서비스 시작..."
sudo service postgresql start 2>/dev/null || echo "이미 실행 중"

# 2. 데이터베이스 생성
echo "2️⃣ 데이터베이스 생성..."
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS baewobollang;" 2>/dev/null

# 3. 사용자 생성 및 권한 설정
echo "3️⃣ 사용자 권한 설정..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'admin';" 2>/dev/null
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE baewobollang TO postgres;" 2>/dev/null

# 4. 테이블 생성
echo "4️⃣ 테이블 생성..."
sudo -u postgres psql -d baewobollang -f server/db/init.sql 2>/dev/null

# 5. 관리자 계정 생성
echo "5️⃣ 초기 관리자 계정 생성..."
node server/db/setup.js 2>/dev/null

echo "✅ PostgreSQL 설정 완료!"
