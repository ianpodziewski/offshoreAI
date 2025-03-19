// types/ioredis.d.ts
declare module 'ioredis' {
  // Re-export for dynamic imports in server components
  export * from 'ioredis';
  
  // Default export for dynamic imports in server components
  const Redis: any;
  export default Redis;
} 