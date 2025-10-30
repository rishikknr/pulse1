# Pulse Architecture Documentation

## System Overview

Pulse is a full-stack uptime monitoring service built with a modern, scalable architecture. The system is designed to be simple, maintainable, and easy to deploy across different environments.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard  │  Targets  │  Incidents  │  Settings    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    tRPC API Gateway
                    (/api/trpc/*)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express + tRPC)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Targets Router  │  Checks Router  │  Stats Router   │   │
│  │  Incidents Router  │  History Router                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Database Query Layer (Drizzle ORM)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Database (MySQL/TiDB/MariaDB)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ monitoring_targets  │  monitoring_checks  │ incidents │   │
│  │ uptime_history                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layer

The frontend is a React Single Page Application (SPA) built with Vite, providing a responsive user interface for monitoring management.

**Key Components:**

- **Dashboard**: Real-time overview of all monitored services with status indicators
- **Targets Management**: Create, read, update, and delete monitoring targets
- **Incidents View**: Historical view of downtime events and service disruptions
- **Settings**: Configuration interface for monitoring preferences
- **Sidebar Navigation**: Persistent navigation for easy access to all sections

**Technology Stack:**
- React 19 with TypeScript
- Tailwind CSS for styling
- shadcn/ui for component library
- Vite for build optimization
- tRPC client for type-safe API calls

### Backend Layer

The backend is built with Express.js and tRPC, providing a type-safe API layer for all frontend operations.

**Key Routers:**

1. **Targets Router**: CRUD operations for monitoring targets
   - `list`: Get all active targets
   - `getById`: Fetch specific target details
   - `create`: Add new monitoring target
   - `update`: Modify target configuration
   - `delete`: Remove monitoring target

2. **Checks Router**: Recording and retrieving monitoring check results
   - `getByTargetId`: Fetch recent checks for a target
   - `getRecent`: Get checks from last N hours
   - `create`: Record new check result

3. **History Router**: Aggregated uptime statistics
   - `getByTargetId`: Fetch historical uptime data
   - `create`: Store aggregated statistics

4. **Statistics Router**: Real-time monitoring metrics
   - `getAllStatus`: Get current status of all targets
   - `getStatus`: Get status of specific target
   - `getUptime`: Calculate uptime percentage

5. **Incidents Router**: Downtime event tracking
   - `getByTargetId`: Fetch incidents for target
   - `create`: Create new incident
   - `resolve`: Mark incident as resolved

**Technology Stack:**
- Express.js for HTTP server
- tRPC for type-safe RPC procedures
- Drizzle ORM for database operations
- SuperJSON for serialization

### Database Layer

The database uses Drizzle ORM for type-safe schema management and migrations.

**Tables:**

#### monitoring_targets
Stores configuration for URLs and services to monitor.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR | Target name |
| url | VARCHAR | URL to monitor |
| description | TEXT | Optional description |
| method | VARCHAR | HTTP method (GET, POST, etc.) |
| checkInterval | INT | Check frequency in seconds |
| timeout | INT | Request timeout in seconds |
| expectedStatusCode | INT | Expected HTTP status code |
| isActive | INT | Active status (1=true, 0=false) |
| createdAt | TIMESTAMP | Creation timestamp |
| updatedAt | TIMESTAMP | Last update timestamp |

#### monitoring_checks
Records individual check results for each monitoring target.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| targetId | INT | Reference to monitoring_targets |
| statusCode | INT | HTTP response status code |
| responseTime | INT | Response time in milliseconds |
| isSuccess | INT | Check success (1=success, 0=failure) |
| errorMessage | TEXT | Error details if failed |
| checkedAt | TIMESTAMP | Check timestamp |

#### uptime_history
Aggregated daily and hourly statistics for uptime tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| targetId | INT | Reference to monitoring_targets |
| period | VARCHAR | 'daily' or 'hourly' |
| timestamp | TIMESTAMP | Period timestamp |
| totalChecks | INT | Total checks in period |
| successfulChecks | INT | Successful checks in period |
| uptimePercentage | DECIMAL | Calculated uptime % |
| averageResponseTime | INT | Average response time (ms) |
| createdAt | TIMESTAMP | Record creation time |

#### incidents
Tracks downtime events and service disruptions.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| targetId | INT | Reference to monitoring_targets |
| startTime | TIMESTAMP | Incident start time |
| endTime | TIMESTAMP | Incident end time (if resolved) |
| status | ENUM | 'ongoing' or 'resolved' |
| reason | TEXT | Incident description |
| createdAt | TIMESTAMP | Record creation time |
| updatedAt | TIMESTAMP | Last update time |

## Data Flow

### Monitoring Check Flow

1. **Frontend Request**: User navigates to dashboard or targets page
2. **tRPC Query**: Frontend calls `trpc.stats.getAllStatus.useQuery()`
3. **Backend Processing**: Express handler executes query through database layer
4. **Database Query**: Drizzle ORM fetches latest check data
5. **Response**: Results serialized with SuperJSON and sent to frontend
6. **Frontend Rendering**: React renders status indicators and metrics

### Creating a Monitoring Target

1. **User Input**: User fills form in "Add Target" dialog
2. **Validation**: Frontend validates URL format and required fields
3. **tRPC Mutation**: Calls `trpc.targets.create.useMutation()`
4. **Backend Validation**: Express validates input and checks for duplicates
5. **Database Insert**: Drizzle ORM inserts new target record
6. **Response**: Returns created target with ID
7. **UI Update**: Frontend refetches targets list and updates display

## Deployment Architecture

### Vercel Deployment

```
GitHub Repository
        ↓
    Git Push
        ↓
Vercel CI/CD Pipeline
        ↓
Build & Test
        ↓
Deploy to Vercel Edge Network
        ↓
Auto-scale based on traffic
        ↓
Connected to external MySQL database
```

### Docker Deployment

```
Docker Compose
    ↓
┌─────────────────────────┐
│  MySQL Container        │
│  (Port 3306)           │
└─────────────────────────┘
    ↑
    │
┌─────────────────────────┐
│  Pulse App Container    │
│  (Port 3000)           │
│  - Node.js Runtime      │
│  - Express Server       │
│  - React Frontend       │
└─────────────────────────┘
```

### Self-Hosted Deployment

```
Server/VM
    ↓
┌──────────────────────────────┐
│  Node.js Runtime             │
│  ┌──────────────────────────┐│
│  │  Pulse Application       ││
│  │  - Express Server        ││
│  │  - React Frontend (SSR)  ││
│  └──────────────────────────┘│
│  ┌──────────────────────────┐│
│  │  MySQL Database          ││
│  └──────────────────────────┘│
└──────────────────────────────┘
    ↓
Nginx/Apache (Reverse Proxy)
    ↓
Public Internet
```

## API Communication Pattern

All communication between frontend and backend uses **tRPC**, a TypeScript-first RPC framework.

### tRPC Procedure Pattern

```typescript
// Backend Definition (server/routers.ts)
export const appRouter = router({
  targets: router({
    list: publicProcedure.query(async () => {
      return db.getAllTargets();
    }),
    create: publicProcedure
      .input(z.object({ name: z.string(), url: z.string().url() }))
      .mutation(async ({ input }) => {
        return db.createTarget(input);
      }),
  }),
});

// Frontend Usage (client/src/pages/Targets.tsx)
const { data: targets } = trpc.targets.list.useQuery();
const createMutation = trpc.targets.create.useMutation();
```

**Benefits:**
- Full type safety between frontend and backend
- Automatic API documentation
- No manual API versioning needed
- Reduced boilerplate code

## Security Architecture

### Public API Design

Since Pulse is a public monitoring service requiring no authentication:

- All tRPC procedures are public
- No authentication middleware
- No user context required
- All data is read-accessible

### Production Security Measures

1. **HTTPS/TLS**: All traffic encrypted in transit
2. **CORS Headers**: Restrict cross-origin requests if needed
3. **Rate Limiting**: Prevent abuse of API endpoints
4. **SQL Injection Prevention**: Drizzle ORM parameterized queries
5. **XSS Protection**: React's built-in HTML escaping
6. **Environment Secrets**: Sensitive data in environment variables

## Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: Each instance can handle requests independently
- **Database Connection Pooling**: Reuse database connections
- **Load Balancing**: Distribute traffic across multiple instances
- **Caching Layer**: Redis for frequently accessed data (optional)

### Vertical Scaling

- **Database Optimization**: Indexed queries on frequently searched columns
- **Code Splitting**: Lazy load frontend components
- **Asset Optimization**: Minification and compression
- **Database Sharding**: Partition data by target ID if needed

### Performance Optimization

- **Response Caching**: Cache check results for 5 minutes
- **Database Indexing**: Index on targetId, checkedAt columns
- **Frontend Code Splitting**: Load only needed components
- **CDN Integration**: Serve static assets from CDN
- **Database Connection Pooling**: Reuse connections

## Monitoring and Observability

### Application Monitoring

- **Error Logging**: Log all backend errors with context
- **Request Logging**: Track API request duration and status
- **Database Query Logging**: Monitor slow queries
- **Performance Metrics**: Track response times and throughput

### Health Checks

- **Database Connectivity**: Verify database connection on startup
- **API Health Endpoint**: `/api/health` for load balancer checks
- **Dependency Checks**: Verify all required services are available

## Future Architecture Enhancements

1. **Background Job Queue**: For async monitoring checks
2. **WebSocket Support**: Real-time status updates
3. **Notification System**: Email, Slack, Discord alerts
4. **Analytics Engine**: Advanced reporting and insights
5. **Multi-tenancy**: Support for multiple organizations
6. **API Authentication**: OAuth2 for programmatic access
7. **Caching Layer**: Redis for improved performance
8. **Message Queue**: For distributed monitoring

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**Author**: Manus AI
