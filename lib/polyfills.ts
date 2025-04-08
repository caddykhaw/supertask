// This file provides polyfills for Node.js built-in modules in the browser environment
'use client';

import 'stream-browserify';
import 'buffer';

// Polyfills for browser compatibility
if (typeof window !== 'undefined') {
  // Buffer polyfill
  (window as any).Buffer = require('buffer').Buffer;
  
  // Ensure crypto is available for NextAuth in older browsers
  if (!window.crypto) {
    // @ts-ignore
    window.crypto = {};
  }
  
  if (!window.crypto.subtle) {
    // @ts-ignore
    window.crypto.subtle = {};
  }
  
  if (!window.crypto.getRandomValues) {
    // @ts-ignore
    window.crypto.getRandomValues = function(array) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
} 