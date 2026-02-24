import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// 创建 localStorage mock
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

// Mock localStorage
const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

// Mock WebSocket
vi.stubGlobal('WebSocket', class {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = WebSocket.OPEN;
  url = '';
  protocol = '';

  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: AddEventListenerOptions
  ): void {
    if (type === 'open') this.onopen = listener as any;
    if (type === 'error') this.onerror = listener as any;
    if (type === 'close') this.onclose = listener as any;
    if (type === 'message') this.onmessage = listener as any;
  }

  removeEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: EventListenerOptions
  ): void {
    if (type === 'open' && this.onopen === listener) this.onopen = null;
    if (type === 'error' && this.onerror === listener) this.onerror = null;
    if (type === 'close' && this.onclose === listener) this.onclose = null;
    if (type === 'message' && this.onmessage === listener) this.onmessage = null;
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // Mock implementation
  }

  close(code?: number, reason?: string): void {
    // Mock implementation
  }
});

// Mock ResizeObserver
vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

// Mock IntersectionObserver
vi.stubGlobal('IntersectionObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

// Mock matchMedia
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
}));
