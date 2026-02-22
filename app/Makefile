.PHONY: help dev up down logs clean db-push db-studio install

# Default target
help:
	@echo "Reqflow Development Commands"
	@echo "=============================="
	@echo "make install    - Install dependencies"
	@echo "make up         - Start PostgreSQL + Redis"
	@echo "make down       - Stop all containers"
	@echo "make logs       - View container logs"
	@echo "make clean      - Stop containers and remove volumes"
	@echo "make db-push    - Push database schema"
	@echo "make db-studio  - Open Drizzle Studio"
	@echo "make dev        - Start development server"

install:
	npm install

up:
	docker compose up -d postgres redis

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v

db-push:
	npm run db:push

db-studio:
	npm run db:studio

dev:
	npm run dev
