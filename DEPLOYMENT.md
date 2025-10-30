# Pulse Deployment Guide

This guide provides step-by-step instructions for deploying Pulse to different environments.

## Prerequisites

- Node.js 22 or higher
- pnpm package manager
- Git for version control
- MySQL 8.0+ or compatible database (TiDB, MariaDB, PlanetScale)

## Local Development Deployment

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd pulse

# Install dependencies
pnpm install
```

### Step 2: Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
DATABASE_URL=mysql://user:password@localhost:3306/pulse
JWT_SECRET=your-secret-key-change-in-production
VITE_APP_TITLE=Pulse Uptime Monitor
NODE_ENV=development
PORT=3000
```

### Step 3: Database Setup

```bash
# Run migrations
pnpm db:push

# This will:
# - Generate migration files
# - Create all required tables
# - Apply schema to database
```

### Step 4: Start Development Server

```bash
pnpm dev
```

Access the application at `http://localhost:3000`

## Docker Deployment

### Using Docker Compose (Recommended for Local)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

This creates:
- MySQL database on port 3306
- Pulse application on port 3000

### Manual Docker Build

```bash
# Build the image
docker build -t pulse:latest .

# Run the container
docker run -d \
  --name pulse \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@db:3306/pulse" \
  -e JWT_SECRET="your-secret-key" \
  pulse:latest
```

### Docker Production Deployment

For production, use a managed database service:

```bash
docker run -d \
  --name pulse \
  -p 3000:3000 \
  --restart unless-stopped \
  -e DATABASE_URL="mysql://user:password@managed-db.example.com:3306/pulse" \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e NODE_ENV="production" \
  pulse:latest
```

## Vercel Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Connect to Vercel

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/pulse` | Use managed database |
| `JWT_SECRET` | `<secure-random-string>` | Generate with `openssl rand -base64 32` |
| `VITE_APP_TITLE` | `Pulse Uptime Monitor` | Optional |
| `NODE_ENV` | `production` | Set to production |

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Access your application at the provided Vercel URL

### Step 5: Configure Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Verify domain ownership

### Continuous Deployment

After initial deployment, every push to `main` branch will automatically:
1. Trigger GitHub Actions workflow
2. Run tests and build
3. Deploy to Vercel if successful

## AWS Deployment

### Using EC2 + RDS

#### Step 1: Launch EC2 Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone repository
git clone <repository-url>
cd pulse
pnpm install
```

#### Step 2: Configure RDS Database

1. Create MySQL RDS instance in AWS Console
2. Note the endpoint, username, password
3. Create database: `CREATE DATABASE pulse;`

#### Step 3: Configure Environment

```bash
cat > .env.local << EOF
DATABASE_URL=mysql://admin:password@your-rds-endpoint:3306/pulse
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF
```

#### Step 4: Run Migrations

```bash
pnpm db:push
```

#### Step 5: Start Application

```bash
# Using PM2 for process management
npm install -g pm2
pm2 start "pnpm start" --name pulse
pm2 save
pm2 startup
```

#### Step 6: Configure Nginx Reverse Proxy

```bash
sudo apt-get install nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/pulse > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/pulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Enable HTTPS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## DigitalOcean Deployment

### Using App Platform

1. Connect GitHub repository to DigitalOcean
2. Create new App
3. Select "Node.js" runtime
4. Configure environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Add MySQL database component
6. Deploy

### Using Droplet + Docker

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and deploy
git clone <repository-url>
cd pulse
docker-compose up -d
```

## Google Cloud Deployment

### Using Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/your-project/pulse

# Deploy to Cloud Run
gcloud run deploy pulse \
  --image gcr.io/your-project/pulse \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL="mysql://...",JWT_SECRET="..." \
  --allow-unauthenticated
```

### Using Compute Engine

Similar to AWS EC2 deployment with SSH access and manual setup.

## Database Migration

### From Local to Production

```bash
# Export local database
mysqldump -u root -p pulse > pulse_backup.sql

# Import to production
mysql -u admin -p -h production-db.example.com pulse < pulse_backup.sql
```

### Using Drizzle ORM

```bash
# Generate migrations
pnpm db:generate

# Apply to production
DATABASE_URL="mysql://..." pnpm db:migrate
```

## Monitoring and Maintenance

### Health Checks

Set up monitoring for your application:

```bash
# Check application health
curl https://your-domain.com/api/health

# Expected response
{ "status": "ok" }
```

### Logs

#### Vercel
- View in Vercel Dashboard → Deployments → Logs

#### Docker
```bash
docker logs pulse -f
```

#### EC2/Self-hosted
```bash
# Using PM2
pm2 logs pulse

# Using systemd
journalctl -u pulse -f
```

### Database Backups

#### Automated Backups
- AWS RDS: Enable automated backups (7-35 days)
- DigitalOcean: Enable backups in database settings
- PlanetScale: Automatic backups included

#### Manual Backups
```bash
# Backup
mysqldump -u user -p -h host database > backup.sql

# Restore
mysql -u user -p -h host database < backup.sql
```

## Troubleshooting

### Database Connection Issues

**Error**: `Error: connect ECONNREFUSED`

**Solution**:
1. Verify DATABASE_URL format
2. Check database is running
3. Verify credentials
4. Check network/firewall rules

### Out of Memory

**Error**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=2048 pnpm start
```

### Build Failures

**Error**: `Build failed`

**Solution**:
1. Clear cache: `rm -rf dist node_modules`
2. Reinstall: `pnpm install`
3. Check Node version: `node --version`

### Slow Queries

**Solution**:
1. Add database indexes
2. Optimize queries
3. Use connection pooling
4. Consider caching layer

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_target_id ON monitoring_checks(targetId);
CREATE INDEX idx_checked_at ON monitoring_checks(checkedAt);
CREATE INDEX idx_target_active ON monitoring_targets(isActive);
```

### Application Optimization

```bash
# Enable production mode
NODE_ENV=production

# Use clustering
NODE_CLUSTER_SIZE=4

# Enable caching
REDIS_URL=redis://localhost:6379
```

### Frontend Optimization

- Enable gzip compression in Nginx
- Use CDN for static assets
- Enable browser caching
- Optimize images and assets

## Rollback Procedure

### Vercel Rollback

1. Go to Deployments
2. Click on previous deployment
3. Click "Redeploy"

### Docker Rollback

```bash
# Stop current container
docker stop pulse

# Run previous image
docker run -d --name pulse-old <previous-image-id>
```

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use HTTPS/SSL certificate
- [ ] Enable database authentication
- [ ] Set up firewall rules
- [ ] Enable automated backups
- [ ] Monitor error logs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring alerts

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Author**: Manus AI
