import { cookies } from "./util";

export const baseUrl = process.env.REACT_APP_COURATOR_API_URL || '';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.message = message + ' (' + status.toString() + ')';
    this.status = status;
  }
}

export async function apiResolve(r) {
  if (!r.ok) {
    let e;
    let text = await r.text();
    try {
      e = new ApiError(JSON.parse(text).detail, r.status);
    }
    catch (_) {
      e = new ApiError(text, r.status);
    }
    throw e;
  }
  return await r.json();
}

export async function apiFetch(route, args) {
  args = args || {};
  args.headers = args.headers || {};
  let auth = true;
  if (args.auth !== undefined) {
    auth = args.auth;
    delete args.auth;
  }
  const token = cookies.get('accountToken');
  if (auth && token) {
    args.headers['Authorization'] = 'Bearer ' + token;
  }
  return await apiResolve(await fetch(baseUrl + route, args));
}

export async function apiPost(route, data, args) {
  return await apiFetch(route, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    ...(args || {})
  });
}

export async function apiGet(route, args) {
  return await apiFetch(route, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    ...(args || {})
  });
}

export async function apiDelete(route, args) {
  return await apiFetch(route, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    },
    ...(args || {})
  });
}

export async function apiPut(route, data, args) {
  return await apiFetch(route, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    ...(args || {})
  });
}
