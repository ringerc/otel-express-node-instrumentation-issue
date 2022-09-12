default: run-combined

deps:
	cd server && npm install

build: deps
	cd server && npm run build

run-combined: build
	cd server && npm run start:combined

run-separate: build
	cd server && npm run start:separate

.PHONY: deps build run-separate run-combined
