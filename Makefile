# Common commands. Run `make` to see them.
VENV := backend/.venv

.PHONY: help setup run run-lan app lint

help:
	@echo "make setup   create the Python environment and install dependencies"
	@echo "make run     start the game and API on http://localhost:8000"
	@echo "make run-lan same, but reachable from a phone or simulator (for the app)"
	@echo "make app     start the mobile app's dev server (run 'make run-lan' alongside)"
	@echo "make lint    check and format the Python code"

setup:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r backend/requirements.txt

run:
	$(VENV)/bin/uvicorn app.main:app --app-dir backend --reload

run-lan:
	$(VENV)/bin/uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0

app:
	cd app && npm install && npx expo start

lint:
	$(VENV)/bin/pip install -q ruff
	$(VENV)/bin/ruff check backend
	$(VENV)/bin/ruff format backend
