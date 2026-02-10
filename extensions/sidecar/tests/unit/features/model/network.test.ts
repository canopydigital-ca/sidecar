import { describe, it, expect } from 'vitest';
import { getRetryConfig } from '../../../../src/features/model/network';

describe('features/model/network', () => {
  describe('getRetryConfig', () => {
    it('should return correct config for good connection', () => {
      const config = getRetryConfig('good');
      expect(config).toEqual({ maxRetries: 2, baseDelay: 100 });
    });

    it('should return correct config for moderate connection', () => {
      const config = getRetryConfig('moderate');
      expect(config).toEqual({ maxRetries: 3, baseDelay: 200 });
    });

    it('should return correct config for slow connection', () => {
      const config = getRetryConfig('slow');
      expect(config).toEqual({ maxRetries: 5, baseDelay: 500 });
    });

    it('should return correct config for offline connection', () => {
      const config = getRetryConfig('offline');
      expect(config).toEqual({ maxRetries: 1, baseDelay: 1000 });
    });

    it('should default to good config for unknown condition', () => {
      const config = getRetryConfig('unknown');
      expect(config).toEqual({ maxRetries: 2, baseDelay: 100 });
    });
  });
});
