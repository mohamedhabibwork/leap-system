#!/bin/bash

# Health check script for all infrastructure services
# Usage: ./health-check.sh

echo "🔍 Checking infrastructure services..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# PostgreSQL
echo -n "PostgreSQL... "
if docker exec leap-lms-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Redis
echo -n "Redis... "
if docker exec leap-lms-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# RabbitMQ
echo -n "RabbitMQ... "
if docker exec leap-lms-rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Zookeeper
echo -n "Zookeeper... "
if docker exec leap-lms-zookeeper zkServer.sh status > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Check manually${NC}"
fi

# Kafka
echo -n "Kafka... "
if docker exec leap-lms-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# MinIO
echo -n "MinIO... "
if curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Keycloak
echo -n "Keycloak... "
if curl -s https://keycloak.habib.cloud/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

echo "========================================"
echo "✨ Health check complete!"
