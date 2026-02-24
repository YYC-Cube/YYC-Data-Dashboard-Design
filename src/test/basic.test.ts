import { describe, it, expect, beforeEach } from 'vitest';

describe('测试环境配置', () => {
  it('Vitest 是否正常运行', () => {
    expect(1 + 1).toBe(2);
  });

  it('WebSocket Mock 是否可用', () => {
    expect(typeof WebSocket).toBe('function');
    expect(WebSocket.OPEN).toBe(1);
  });

  it('localStorage Mock 是否可用', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    localStorage.clear();
  });

  it('matchMedia Mock 是否可用', () => {
    const mediaQuery = matchMedia('(max-width: 768px)');
    expect(mediaQuery).toBeDefined();
    expect(typeof mediaQuery.matches).toBe('boolean');
  });
});
