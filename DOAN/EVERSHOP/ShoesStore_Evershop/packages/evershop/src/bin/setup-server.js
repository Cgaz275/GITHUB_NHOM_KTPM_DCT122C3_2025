import http from 'http';
import { success, error } from '../lib/log/logger.js';

let port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>EverShop Setup</title>
        <style>
          body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          h1 { color: #333; }
          p { color: #666; font-size: 16px; }
          .code { background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>EverShop Setup</h1>
          <p>This is a setup-only package for shared modules.</p>
          <p>To configure your database, run:</p>
          <div class="code">npm run setup</div>
          <p>Or use the CLI command:</p>
          <div class="code">evershop-setup install</div>
        </div>
      </body>
    </html>
  `);
});

function tryListen(currentPort) {
  server.listen(currentPort, () => {
    success(`Setup server running at http://localhost:${currentPort}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (currentPort < 3010) {
        tryListen(currentPort + 1);
      } else {
        error(`Could not find available port. Please close the application running on port 3000-3010.`);
        process.exit(1);
      }
    } else {
      error(err);
      process.exit(1);
    }
  });
}

tryListen(port);

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
