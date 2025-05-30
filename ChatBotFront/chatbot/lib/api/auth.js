const API_URL = "http://localhost:8000/api";

export async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }

        const data = await response.json();

        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user_id', data.user_id);

        return data;
    } catch (error) {
        throw error;
    }
}

export async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            const msg =
                data?.username?.[0] ||
                data?.password?.[0] ||
                data?.email?.[0] ||
                'Erro ao registrar';
            throw new Error(msg);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

export async function authFetch(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        throw new Error('Usuário não autenticado');
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
            return;
        }

        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro na requisição');
    }

    return response.json();
}

export async function logoutUser() {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');

    if (!refreshToken || !accessToken) {
        localStorage.clear();
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Falha ao fazer logout');
        }

        localStorage.clear();
        window.location.href = '/login';

    } catch (error) {
        console.error('Erro no logout:', error);
        localStorage.clear();
        window.location.href = '/login';
    }
}
