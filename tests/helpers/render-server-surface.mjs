// Render real components in a client-capable React process. The normal suite
// uses react-server conditions for server-only modules, which disable hooks.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import * as registry from '../../app/shared/serverGroup.mjs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const require = createRequire(import.meta.url);
const server = { ...registry.servers[1], ...input.server };
// This disposable process supplies launch records to the real registry helpers,
// including their default group lookup. No production records are edited.
registry.servers.splice(0, registry.servers.length, server);
const fixture = { ...registry, getServerBySlug: () => server };
const cache = new Map();
const language = input.language ?? 'en';
const react = { ...React, useState(initial) {
  return React.useState(initial === 'Java' ? input.edition ?? initial : initial === 'legacy' ? input.scope ?? initial : initial);
} };
const hostElement = tag => function RenderBoundary({ children, ...props }) {
  for (const key of ['priority', 'fill', 'initial', 'whileInView', 'viewport', 'transition']) delete props[key];
  return React.createElement(tag, props, children);
};
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} };
  cache.set(file, loaded);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  function boundary(id) {
    if (id === 'react') return react;
    if (id.endsWith('/serverGroup.mjs')) return fixture;
    if (id.endsWith('/LanguageProvider')) return { useLanguage: () => ({ language, t: (ko, en) => language === 'ko' ? ko : en }) };
    if (id.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
    if (id === 'next/image') return { __esModule: true, default: hostElement('img') };
    if (id === 'framer-motion') return {
      useReducedMotion: () => true, useScroll: () => ({ scrollYProgress: 0 }), useTransform: () => 0,
      motion: new Proxy({}, { get: (_, tag) => hostElement(tag) }),
    };
    if (id.startsWith('.')) {
      const resolved = path.resolve(path.dirname(file), id);
      if (id.endsWith('.mjs')) return require(resolved);
      return load(resolved + '.tsx');
    }
    return require(id);
  }
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(boundary, loaded, loaded.exports);
  return loaded.exports;
}
const exports = load(input.file);
process.stdout.write(JSON.stringify(input.metadata ? exports.metadata : renderToStaticMarkup(React.createElement(exports.default, input.props === 'server' ? { server } : input.props ?? {}))));
