# Pulse Uptime Monitoring Service

A production-grade, real-time uptime monitoring service that continuously tracks the availability and performance of websites, APIs, and services. Built with modern web technologies for simplicity, reliability, and ease of deployment.

## Overview

**Pulse** is a public-facing uptime monitoring dashboard that requires no user authentication. It provides real-time monitoring of multiple services, tracks historical uptime data, and displays comprehensive statistics through an intuitive web interface.

### Key Features

- **Real-time Monitoring**: Track HTTP status codes and response times for multiple URLs
- **Historical Analytics**: View uptime percentages and performance trends over time
- **Public Dashboard**: Access monitoring data without authentication
- **Easy Deployment**: Deploy to Vercel, Docker, or traditional servers
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **REST API**: Full tRPC API for integrating with external systems
- **Incident Tracking**: Automatic downtime detection and incident logging

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS | Modern, responsive UI |
| **Backend** | Express.js + tRPC | Type-safe API layer |
| **Database** | MySQL/TiDB | Persistent data storage |
| **Build Tool** | Vite | Fast development and production builds |
| **Deployment** | Vercel, Docker, or self-hosted | Flexible hosting options |
| **UI Components** | shadcn/ui | Consistent, accessible components |

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pulse
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database connection string
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start both the MySQL database and the Pulse application.

2. **Access the application**
   ```
   http://localhost:3000
   ```

### Vercel Deployment

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your repository
   - Configure environment variables:
     - `DATABASE_URL`: Your MySQL connection string
     - `JWT_SECRET`: A secure random string
   - Click "Deploy"

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | MySQL connection string | Yes | - |
| `JWT_SECRET` | Session signing secret | Yes | - |
| `VITE_APP_TITLE` | Application title | No | Pulse Uptime Monitor |
| `VITE_APP_LOGO` | Logo image URL | No | - |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 3000 |

### Database Setup

The application uses Drizzle ORM for database management. The schema includes four main tables:

- **monitoring_targets**: URLs and services to monitor
- **monitoring_checks**: Individual check results with status codes and response times
- **uptime_history**: Aggregated daily and hourly statistics
- **incidents**: Downtime events and disruptions

Run migrations automatically:
```bash
pnpm db:push
```

## API Reference

All API endpoints are accessed through the `/api/trpc` gateway using tRPC procedures. The API is fully type-safe and public (no authentication required).

### Monitoring Targets

**List all targets**
```typescript
trpc.targets.list.useQuery()
```

**Create a new target**
```typescript
trpc.targets.create.useMutation({
  name: "My API",
  url: "https://api.example.com",
  checkInterval: 300,
  timeout: 10,
  expectedStatusCode: 200
})
```

**Get target by ID**
```typescript
trpc.targets.getById.useQuery({ id: 1 })
```

### Monitoring Checks

**Get recent checks for a target**
```typescript
trpc.checks.getByTargetId.useQuery({
  targetId: 1,
  limit: 100
})
```

**Get checks from the last N hours**
```typescript
trpc.checks.getRecent.useQuery({
  targetId: 1,
  hoursBack: 24
})
```

### Statistics

**Get real-time status of all targets**
```typescript
trpc.stats.getAllStatus.useQuery()
```

**Calculate uptime for a specific target**
```typescript
trpc.stats.getUptime.useQuery({
  targetId: 1,
  hoursBack: 24
})
```

### Incidents

**Get incidents for a target**
```typescript
trpc.incidents.getByTargetId.useQuery({
  targetId: 1,
  limit: 50
})
```

**Create an incident**
```typescript
trpc.incidents.create.useMutation({
  targetId: 1,
  startTime: new Date(),
  reason: "Service down"
})
```

## Project Structure

```
pulse/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── pages/            # Page components (Home, Targets, Incidents, Settings)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # tRPC client configuration
│   │   └── App.tsx           # Main application router
│   └── index.html            # HTML entry point
├── server/                    # Express backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   └── _core/                # Core framework files
├── drizzle/                   # Database schema and migrations
│   └── schema.ts             # Table definitions
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker image definition
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

## Deployment Guide

### Prerequisites

- Node.js 22 or higher
- pnpm package manager
- MySQL 8.0 or compatible database (TiDB, MariaDB)

### Local Deployment

1. Install dependencies: `pnpm install`
2. Configure database: Set `DATABASE_URL` in `.env.local`
3. Run migrations: `pnpm db:push`
4. Start server: `pnpm dev`

### Docker Deployment

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000` with MySQL running on port `3306`.

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Production Considerations

- Use a managed database service (AWS RDS, PlanetScale, etc.)
- Set strong `JWT_SECRET` value
- Enable HTTPS/SSL certificates
- Configure proper CORS headers
- Set up monitoring and alerting
- Use environment-specific configurations
- Implement rate limiting for API endpoints
- Regular database backups

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:push` | Generate and apply database migrations |
| `pnpm lint` | Run ESLint (if configured) |
| `pnpm test` | Run tests (if configured) |

### Adding New Monitoring Targets

1. Navigate to the "Targets" page
2. Click "Add Target"
3. Enter target details:
   - **Name**: Descriptive name for the service
   - **URL**: Full URL to monitor (e.g., https://api.example.com/health)
   - **Check Interval**: How often to check (in seconds)
   - **Timeout**: Maximum response time (in seconds)
   - **Expected Status Code**: HTTP status code indicating success
4. Click "Create Target"

### Viewing Monitoring Data

- **Dashboard**: Real-time status of all services
- **Targets**: Detailed view of each monitored service
- **Incidents**: Historical downtime events
- **Settings**: Configuration options

## Troubleshooting

### Database Connection Error

**Problem**: `Error: connect ECONNREFUSED`

**Solution**: Verify database connection string in `.env.local`:
```
DATABASE_URL=mysql://user:password@localhost:3306/pulse
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE :::3000`

**Solution**: Change the port in `.env.local`:
```
PORT=3001
```

### Docker Build Fails

**Problem**: `Docker build error`

**Solution**: Ensure Docker daemon is running and you have sufficient disk space:
```bash
docker system prune -a
docker-compose build --no-cache
```

## Performance Optimization

- Response times are cached for 5 minutes
- Database queries use indexed columns
- Frontend uses code splitting and lazy loading
- Static assets are cached with aggressive headers
- Consider using a CDN for static content in production

## Security

- All API endpoints are public (no authentication required)
- HTTPS/SSL recommended for production
- SQL injection prevention through Drizzle ORM
- XSS protection via React's built-in escaping
- CSRF tokens in forms (if added)
- Rate limiting recommended for production

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Email notifications for downtime
- [ ] Slack/Discord integration
- [ ] Advanced analytics and reporting
- [ ] Custom alert rules and thresholds
- [ ] API authentication for private instances
- [ ] Multi-region monitoring
- [ ] Performance metrics and SLA tracking
- [ ] Webhook support for integrations

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React Single Page Application (SPA) with Vite
- **Backend**: Express.js with tRPC for type-safe APIs
- **Database**: MySQL with Drizzle ORM for migrations
- **Deployment**: Vercel (serverless) or Docker (containerized)

All communication between frontend and backend uses tRPC, ensuring type safety across the entire stack.

---

**Built with ❤️ by Manus AI**

Last updated: October 2025
