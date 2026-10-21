import http from 'node:http';
import { URL } from 'node:url';

let expressLib = null;
let corsLib = null;

try {
  const e = await import('express');
  expressLib = e.default || e;
} catch {
  expressLib = null;
}

try {
  const c = await import('cors');
  corsLib = c.default || c;
} catch {
  corsLib = null;
}

/**
 * Provides Express & CORS when installed in node_modules, or a lightweight
 * Express-compatible HTTP router when running in zero-dependency mode.
 */
export function createApp() {
  if (expressLib) {
    return expressLib();
  }
  return new MiniExpressApp();
}

export function createRouter() {
  if (expressLib) {
    return expressLib.Router();
  }
  return new MiniRouter();
}

export function jsonMiddleware(options = {}) {
  if (expressLib) {
    return expressLib.json(options);
  }
  return (req, _res, next) => next();
}

export function corsMiddleware(options = {}) {
  if (corsLib) {
    return corsLib(options);
  }
  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    next();
  };
}

class MiniRouter {
  constructor() {
    this.stack = [];
  }
  use(...args) {
    if (typeof args[0] === 'string') {
      const prefix = args[0].replace(/\/$/, '');
      const handlers = args.slice(1);
      this.stack.push({ type: 'mount', prefix, handlers });
    } else {
      this.stack.push({ type: 'mw', handlers: args });
    }
  }
  get(path, ...handlers) {
    this.stack.push({ type: 'route', method: 'GET', path, handlers });
  }
  post(path, ...handlers) {
    this.stack.push({ type: 'route', method: 'POST', path, handlers });
  }
  put(path, ...handlers) {
    this.stack.push({ type: 'route', method: 'PUT', path, handlers });
  }
  delete(path, ...handlers) {
    this.stack.push({ type: 'route', method: 'DELETE', path, handlers });
  }
}

class MiniExpressApp extends MiniRouter {
  listen(port, callback) {
    const server = http.createServer(async (req, res) => {
      res.status = code => {
        res.statusCode = code;
        return res;
      };
      res.json = obj => {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        res.end(JSON.stringify(obj));
        return res;
      };

      const parsedUrl = new URL(req.url || '/', 'http://localhost');
      req.originalUrl = req.url;
      req.path = parsedUrl.pathname;
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());
      req.params = {};

      // Parse JSON body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      await runRouter(this, '', req, res);
    });
    return server.listen(port, callback);
  }
}

function matchPath(pattern, actualPath) {
  const normPattern = pattern === '/' ? '' : pattern.replace(/\/$/, '');
  const normActual = actualPath === '/' ? '' : actualPath.replace(/\/$/, '');
  const pParts = normPattern.split('/');
  const aParts = normActual.split('/');
  if (pParts.length !== aParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    if (pParts[i].startsWith(':')) {
      params[pParts[i].slice(1)] = decodeURIComponent(aParts[i]);
    } else if (pParts[i] !== aParts[i]) {
      return null;
    }
  }
  return params;
}

async function runHandlers(handlers, req, res) {
  for (const h of handlers) {
    if (res.writableEnded) return true;
    let nextCalled = false;
    await new Promise((resolve, reject) => {
      const next = err => {
        if (err) return reject(err);
        nextCalled = true;
        resolve();
      };
      Promise.resolve(h(req, res, next)).then(() => {
        if (res.writableEnded || nextCalled) resolve();
      }).catch(reject);
    });
    if (!nextCalled && res.writableEnded) return true;
  }
  return res.writableEnded;
}

async function runRouter(router, basePrefix, req, res) {
  for (const layer of router.stack) {
    if (res.writableEnded) return true;
    if (layer.type === 'mw') {
      await runHandlers(layer.handlers, req, res);
    } else if (layer.type === 'mount') {
      const fullPrefix = basePrefix + layer.prefix;
      if (req.path === fullPrefix || req.path.startsWith(fullPrefix + '/')) {
        for (const sub of layer.handlers) {
          if (sub instanceof MiniRouter) {
            await runRouter(sub, fullPrefix, req, res);
          } else {
            await runHandlers([sub], req, res);
          }
        }
      }
    } else if (layer.type === 'route') {
      if (req.method !== layer.method) continue;
      const fullPattern = basePrefix + (layer.path === '/' ? '' : layer.path);
      const params = matchPath(fullPattern || '/', req.path);
      if (params) {
        req.params = { ...req.params, ...params };
        await runHandlers(layer.handlers, req, res);
        if (res.writableEnded) return true;
      }
    }
  }
  return res.writableEnded;
}
