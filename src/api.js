import { apiFetch } from "./apiBase";
import { formatUrlForm, CLIENT_ID, cookies } from "./util";

export async function apiGetToken(username, password) {
  const { access_token } = await apiFetch('/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formatUrlForm({
      username: username,
      password: password,
      client_id: CLIENT_ID,
      grant_type: 'password',
      scope: 'account'
    }),
    auth: false
  });
  return access_token;
}

export function saveToken(token, remember) {
  const options = { path: '/' };
  if (remember) {
    options.maxAge = 60 * 60 * 24 * 30 * 12;  // 1 year (token will expire sooner)
  }
  cookies.set('accountToken', token, options);
}

export function isLoggedIn() {
  return cookies.get('accountToken') !== undefined;
}
