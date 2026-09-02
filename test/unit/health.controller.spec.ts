import { describe, it, expect } from 'vitest';
import { HealthController } from '../../src/infrastructure/http/controllers/health.controller';

describe('HealthController', () => {
  it('should return health status ok with version and timestamp', () => {
    const controller = new HealthController();
    const result = controller.check();

    expect(result).toBeDefined();
    expect(result.status).toBe('ok');
    expect(result.version).toBe('0.1.0');
    expect(typeof result.timestamp).toBe('string');
    expect(typeof result.uptime).toBe('number');
  });
});
