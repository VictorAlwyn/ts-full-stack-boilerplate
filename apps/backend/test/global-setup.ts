export default function globalSetup() {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Disable nestjs-trpc source map scanning in test environment
  process.env.NESTJS_TRPC_DISABLE_SOURCE_MAP = 'true';

  console.log('Global test setup completed');
}
