# SiteBoss Production Deployment Guide

This document provides comprehensive instructions for deploying SiteBoss to production environments.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd siteboss

# 2. Copy and configure environment
cp .env.production.example .env.production
# Edit .env.production with your production values

# 3. Deploy to production
./scripts/deploy.sh production

# 4. Verify deployment
curl -f http://localhost:8089/health
```

## 📋 Prerequisites

### System Requirements
- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0
- **Node.js**: >= 20.0.0 (for local development)
- **PostgreSQL**: 16+ (handled by Docker)
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 20GB free space

### Security Requirements
- SSL/TLS certificates for HTTPS
- Firewall configured to allow only necessary ports
- Regular security updates applied
- Strong passwords and secrets
- Network segmentation (recommended)

## 🔧 Configuration

### Environment Variables

Create `.env.production` from the template and configure:

```bash
# Critical Security Settings
JWT_SECRET=<generate-strong-secret-32+chars>
POSTGRES_PASSWORD=<strong-database-password>
BCRYPT_ROUNDS=12

# Domain Configuration
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com

# Database Settings
DB_SSL=true
DB_MAX_CONNECTIONS=20

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### SSL/TLS Configuration

For production, configure SSL termination:

**Option 1: Reverse Proxy (Recommended)**
```nginx
# /etc/nginx/sites-available/siteboss
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8088;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8089;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Option 2: Load Balancer**
Configure your load balancer (AWS ALB, GCP Load Balancer, etc.) to terminate SSL and forward to the application.

## 🐳 Docker Deployment

### Build and Deploy

```bash
# Build production images
docker-compose --profile prod build

# Deploy services
docker-compose --profile prod up -d

# Check status
docker-compose ps
```

### Service Management

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart backend
docker-compose restart frontend

# Update services
docker-compose pull
docker-compose --profile prod up -d --remove-orphans
```

## 🗄️ Database Management

### Migrations

```bash
# Check migration status
cd backend && npm run migrate:status

# Run pending migrations
cd backend && npm run migrate

# Rollback last migration (if needed)
cd backend && npm run migrate:rollback
```

### Backups

**Automated Backups** (runs daily at 2 AM):
```bash
# Set up cron job
crontab -e
# Add: 0 2 * * * /path/to/siteboss/scripts/backup.sh
```

**Manual Backup**:
```bash
# Create backup
docker-compose exec db pg_dump -U siteboss_user siteboss_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore backup
gunzip -c backup_20241201_020000.sql.gz | docker-compose exec -T db psql -U siteboss_user -d siteboss_prod
```

### Database Monitoring

```bash
# Check database connections
docker-compose exec db psql -U siteboss_user -d siteboss_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Check database size
docker-compose exec db psql -U siteboss_user -d siteboss_prod -c "SELECT pg_size_pretty(pg_database_size('siteboss_prod'));"

# Check slow queries
docker-compose exec db psql -U siteboss_user -d siteboss_prod -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## 📊 Monitoring and Logging

### Health Checks

The application provides several health check endpoints:

- `GET /health` - Overall application health
- `GET /ready` - Readiness probe (K8s compatible)
- `GET /live` - Liveness probe (K8s compatible)

### Application Logs

```bash
# View real-time logs
docker-compose logs -f backend

# View specific time range
docker-compose logs --since "2024-01-01T00:00:00" --until "2024-01-01T23:59:59" backend

# Export logs
docker-compose logs --no-color backend > backend_logs_$(date +%Y%m%d).log
```

### Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# /etc/logrotate.d/siteboss
/var/lib/docker/containers/*/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    copytruncate
}
```

### Performance Monitoring

**Basic Monitoring**:
```bash
# Container resource usage
docker stats

# System resources
htop
iostat -x 1
free -h
```

**Advanced Monitoring** (Recommended):
- **Prometheus + Grafana** for metrics
- **ELK Stack** for log aggregation
- **New Relic** or **DataDog** for APM
- **Sentry** for error tracking

## 🔐 Security Best Practices

### Network Security
- Use firewall to restrict access to necessary ports only
- Configure fail2ban for brute force protection
- Use VPN or private networks when possible
- Regular security updates

### Application Security
- Strong, unique secrets for all services
- Regular security audits: `npm audit`
- HTTPS only in production
- Rate limiting configured
- Input validation and sanitization
- SQL injection protection via parameterized queries

### Container Security
- Non-root user in containers
- Minimal base images (Alpine Linux)
- Regular image updates
- No secrets in images or logs
- Container resource limits

## 🚀 Scaling and Performance

### Horizontal Scaling

**Database Scaling**:
```bash
# Add read replicas
docker-compose -f docker-compose.yml -f docker-compose.replica.yml up -d
```

**Application Scaling**:
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer for distribution
# Configure nginx, HAProxy, or cloud load balancer
```

### Performance Optimization

**Database**:
- Regular `VACUUM` and `ANALYZE`
- Proper indexing
- Connection pooling
- Query optimization

**Application**:
- Caching (Redis)
- CDN for static assets
- Image optimization
- Compression enabled

**Infrastructure**:
- SSD storage
- Adequate RAM
- CPU optimization
- Network optimization

## 🔄 CI/CD Pipeline

### GitHub Actions (Included)

The repository includes a complete CI/CD pipeline:

1. **Continuous Integration**:
   - Code linting and testing
   - Security scans
   - Docker image building

2. **Continuous Deployment**:
   - Automated staging deployment
   - Manual production deployment
   - Smoke tests
   - Rollback capability

### Manual Deployment

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production v1.2.3
```

## 🆘 Troubleshooting

### Common Issues

**Service Won't Start**:
```bash
# Check logs
docker-compose logs backend

# Check environment
docker-compose config

# Verify ports
netstat -tulpn | grep :8089
```

**Database Connection Issues**:
```bash
# Check database status
docker-compose exec db pg_isready -U siteboss_user

# Test connection
docker-compose exec backend npm run migrate:status
```

**Performance Issues**:
```bash
# Check resource usage
docker stats

# Check database performance
docker-compose exec db psql -U siteboss_user -d siteboss_prod -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

### Emergency Procedures

**Service Down**:
1. Check health endpoints
2. Review logs
3. Restart services
4. Rollback if necessary

**Data Loss**:
1. Stop all services
2. Restore from latest backup
3. Verify data integrity
4. Restart services

**Security Incident**:
1. Isolate affected systems
2. Change all secrets
3. Review access logs
4. Apply security patches

## 📞 Support and Maintenance

### Regular Maintenance

**Daily**:
- Monitor health checks
- Review error logs
- Check disk space

**Weekly**:
- Security updates
- Performance review
- Backup verification

**Monthly**:
- Full security audit
- Dependency updates
- Capacity planning

### Getting Help

1. **Documentation**: Check this guide and code comments
2. **Logs**: Always check application and system logs first
3. **Health Checks**: Use provided endpoints to diagnose issues
4. **Community**: Search existing issues or create new ones

## 📝 Changelog and Versioning

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Tag releases in Git
- Maintain CHANGELOG.md
- Document breaking changes

## 🔗 Related Documents

- [README.md](./README.md) - General project information
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup
- [API Documentation](./backend/docs/) - API reference
- [Architecture Guide](./docs/architecture.md) - System architecture

---

**⚠️ Important**: Always test deployments in staging before production!