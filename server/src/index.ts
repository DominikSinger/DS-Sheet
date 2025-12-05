import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import basicAuth from 'express-basic-auth';
import { config } from './config';
import { scanner } from './services/scanner';
import { watcher } from './services/watcher';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import scoresRoutes from './routes/scores';

const app = express();

// Security Middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Auth (optional)
if (config.basicAuth.enabled) {
  console.log('🔒 Basic Auth aktiviert');
  app.use(basicAuth({
    users: { [config.basicAuth.user]: config.basicAuth.password },
    challenge: true,
    realm: 'Musiknoten-System',
  }));
}

// API Routes
app.use('/api', healthRoutes);
app.use('/api', scoresRoutes);

// Root-Endpunkt
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Musiknoten-Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      version: '/api/version',
      scores: '/api/scores',
      folders: '/api/folders',
    },
  });
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Startup
async function start() {
  try {
    console.log('');
    console.log('🎵 Musiknoten-Backend startet...');
    console.log('');

    // Initialer Scan
    console.log('🔍 Führe initialen Scan durch...');
    await scanner.scanDirectory();

    // Starte File-Watcher
    watcher.start();

    // Starte Server
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('✅ Server läuft!');
      console.log(`   URL: http://localhost:${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log('');
      console.log('📚 Verfügbare Endpunkte:');
      console.log(`   GET  http://localhost:${config.port}/api/health`);
      console.log(`   GET  http://localhost:${config.port}/api/scores`);
      console.log(`   GET  http://localhost:${config.port}/api/scores/:id`);
      console.log(`   GET  http://localhost:${config.port}/api/scores/:id/file`);
      console.log(`   POST http://localhost:${config.port}/api/scores/scan`);
      console.log(`   GET  http://localhost:${config.port}/api/folders`);
      console.log('');
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('');
      console.log('🛑 Server wird heruntergefahren...');
      
      watcher.stop();
      
      server.close(() => {
        console.log('✅ Server gestoppt');
        process.exit(0);
      });

      // Force shutdown nach 10 Sekunden
      setTimeout(() => {
        console.error('⚠️  Erzwungenes Herunterfahren');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Fehler beim Starten:', error);
    process.exit(1);
  }
}

// Unhandled Errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start
start();
