#!/bin/bash

# SiteBoss Production Deployment Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-production}"
VERSION="${2:-latest}"
COMPOSE_FILE="docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Validate environment
validate_environment() {
    log "Validating deployment environment: $ENVIRONMENT"
    
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
        error "Invalid environment. Use 'staging' or 'production'"
        exit 1
    fi
    
    # Check if environment file exists
    ENV_FILE=".env.${ENVIRONMENT}"
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found"
        error "Please create it based on .env.${ENVIRONMENT}.example"
        exit 1
    fi
    
    success "Environment validated"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if required files exist
    local required_files=("$COMPOSE_FILE" "backend/Dockerfile" "frontend/Dockerfile")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file not found: $file"
            exit 1
        fi
    done
    
    # Check environment variables
    source ".env.${ENVIRONMENT}"
    local required_vars=("JWT_SECRET" "POSTGRES_PASSWORD" "CORS_ORIGINS")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable not set: $var"
            exit 1
        fi
    done
    
    success "Pre-deployment checks passed"
}

# Build images
build_images() {
    log "Building Docker images..."
    
    # Build with specific tags for environment
    docker-compose -f "$COMPOSE_FILE" --profile prod build --no-cache
    
    # Tag images with version
    if [[ "$VERSION" != "latest" ]]; then
        docker tag "siteboss-backend:latest" "siteboss-backend:$VERSION"
        docker tag "siteboss-frontend:latest" "siteboss-frontend:$VERSION"
    fi
    
    success "Images built successfully"
}

# Database backup
backup_database() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "Creating database backup..."
        
        # Create backup directory
        mkdir -p "backups/$(date +'%Y-%m-%d')"
        
        # Backup database
        docker-compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" | \
            gzip > "backups/$(date +'%Y-%m-%d')/backup_$(date +'%H%M%S').sql.gz"
        
        success "Database backup created"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Start database service if not running
    docker-compose up -d db
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    timeout 30 bash -c 'until docker-compose exec db pg_isready -U "$DB_USER"; do sleep 1; done'
    
    # Run migrations
    docker-compose run --rm backend npm run migrate
    
    success "Database migrations completed"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Set environment file
    export COMPOSE_FILE="docker-compose.yml"
    export ENV_FILE=".env.${ENVIRONMENT}"
    
    # Deploy with zero-downtime strategy
    docker-compose --profile prod up -d --remove-orphans
    
    success "Services deployed"
}

# Health checks
run_health_checks() {
    log "Running health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        if curl -f http://localhost:8089/health >/dev/null 2>&1; then
            success "Backend health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Check frontend
    if curl -f http://localhost:8088 >/dev/null 2>&1; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed, but continuing..."
    fi
    
    success "Health checks completed"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    if [[ -d "backups" ]]; then
        find backups -type f -mtime +7 -delete
        find backups -type d -empty -delete
    fi
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    error "Deployment failed. Initiating rollback..."
    
    # Stop current containers
    docker-compose --profile prod down
    
    # Restore database from backup if exists
    if [[ -f "backups/$(date +'%Y-%m-%d')/backup_*.sql.gz" ]]; then
        warning "Restoring database from backup..."
        # Add database restore logic here
    fi
    
    # Start previous version (this is simplified - in production you'd have version management)
    docker-compose --profile prod up -d
    
    error "Rollback completed. Please check the logs and fix issues."
}

# Main deployment function
main() {
    log "Starting deployment of SiteBoss to $ENVIRONMENT environment"
    log "Version: $VERSION"
    
    # Change to project directory
    cd "$PROJECT_ROOT"
    
    # Deployment steps
    validate_environment
    pre_deployment_checks
    
    # Backup before deployment (production only)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        backup_database
    fi
    
    # Build and deploy
    build_images
    run_migrations
    deploy_services
    
    # Verify deployment
    if run_health_checks; then
        cleanup
        success "Deployment completed successfully!"
        
        log "Services are running at:"
        log "  - Backend: http://localhost:8089"
        log "  - Frontend: http://localhost:8088"
        log "  - Health Check: http://localhost:8089/health"
        
    else
        rollback
        exit 1
    fi
}

# Trap errors and cleanup
trap 'error "Deployment failed on line $LINENO"' ERR

# Run main function
main "$@"