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
        try {
            e = new ApiError((await r.json()).message, r.status);
        }
        catch (_) {
            e = new ApiError(await r.text(), r.status);
        }
        throw e;
    }
    return await r.json();
}

export async function apiPost(route, data, args) {
    const r = await fetch(baseUrl + route, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        ...(args || {})
    });
    return await apiResolve(r);
}

export async function apiGet(route, args) {
    const r = await fetch(baseUrl + route, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*'
        },
        ...(args || {})
    });
    return await apiResolve(r);
}

export async function apiDelete(route, args) {
    const r = await fetch(baseUrl + route, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json, text/plain, */*'
        },
        ...(args || {})
    });
    return apiResolve(r);
}

export async function apiPatch(route, data, args) {
    const r = await fetch(baseUrl + route, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        ...(args || {})
    });
    return await apiResolve(r);
}
