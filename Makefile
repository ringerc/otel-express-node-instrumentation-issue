default: run

deps:
	cd server && npm install

build: deps
	cd server && npm run build

run: build
	cd server && npm run start

.PHONY: deps build run
