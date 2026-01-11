#!/usr/bin/env node

/**
 * Health check script for Docker container
 * Used by Docker HEALTHCHECK to verify the application is running correctly
 */

const http = require('http');

const options = {
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 3000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log(`Health check failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log(`Health check failed: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('Health check timed out');
  request.destroy();
  process.exit(1);
});

request.end(); 