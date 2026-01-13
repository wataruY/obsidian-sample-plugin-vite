// Polyfills for Obsidian Mobile (iOS JavaScriptCore)

// process.env polyfill
if (typeof process === "undefined") {
  (globalThis as any).process = {
    env: { NODE_ENV: "production" },
  };
}

// // MessageChannel polyfill
// if (typeof MessageChannel === "undefined") {
//   (globalThis as any).MessageChannel = class MessageChannel {
//     port1: { onmessage: ((event: any) => void) | null };
//     port2: { postMessage: (message: any) => void };
//
//     constructor() {
//       this.port1 = { onmessage: null };
//       this.port2 = {
//         postMessage: (message: any) => {
//           setTimeout(() => {
//             if (this.port1.onmessage) {
//               this.port1.onmessage({ data: message });
//             }
//           }, 0);
//         },
//       };
//     }
//   };
// }
//
// // queueMicrotask polyfill
// if (typeof queueMicrotask === "undefined") {
//   (globalThis as any).queueMicrotask = (callback: () => void) => {
//     Promise.resolve().then(callback).catch((e) =>
//       setTimeout(() => {
//         throw e;
//       })
//     );
//   };
// }

// setImmediate polyfill
if (typeof setImmediate === "undefined") {
  (globalThis as any).setImmediate = (callback: (...args: any[]) => void, ...args: any[]) => {
    return setTimeout(callback, 0, ...args);
  };
  (globalThis as any).clearImmediate = (id: number) => {
    clearTimeout(id);
  };
}
