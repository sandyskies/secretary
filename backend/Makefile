.PHONY: build run clean test

BINARY_NAME=server
BUILD_DIR=bin
CMD_DIR=cmd/server

build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./$(CMD_DIR)

run: build
	@echo "Running server..."
	./$(BUILD_DIR)/$(BINARY_NAME)

run-dev:
	@echo "Running server in development mode..."
	go run ./$(CMD_DIR)

test:
	@echo "Running tests..."
	go test -v ./...

clean:
	@echo "Cleaning..."
	rm -rf $(BUILD_DIR)
	rm -f events.json

fmt:
	@echo "Formatting code..."
	go fmt ./...

tidy:
	@echo "Tidying dependencies..."
	go mod tidy
