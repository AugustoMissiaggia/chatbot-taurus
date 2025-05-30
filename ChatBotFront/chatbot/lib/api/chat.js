const API_URL = "http://localhost:8000/api";

export async function getMessages(userId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Token não encontrado');
    }


    const response = await fetch(`${API_URL}/chat/messages/?user_id=${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar mensagens');
    }

    return await response.json();
}


export async function sendMessage(userId, text) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Token não encontrado');
    }


    const response = await fetch(`${API_URL}/chat/send/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
    }

    return await response.json();
}


export async function getChatGPTResponses(userId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_URL}/chat/responses/?user_id=${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar respostas do ChatGPT');
    }

    return await response.json();
}

export async function uploadCsvFile(file) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('Token não encontrado');
    }


    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/chat/upload-csv/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Erro ao enviar o CSV');
    }

    return res.blob();
}

export async function sendMessageWithCsv(file, instruction) {
    const token = localStorage.getItem('accessToken')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('instruction', instruction)

    const res = await fetch(`${API_URL}/chat/upload_csv/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include',
    })

    if (!res.ok) throw new Error('Erro ao enviar CSV com instrução')

    const contentType = res.headers.get('Content-Type')
    if (contentType && contentType.includes('text/csv')) {
        return await res.blob()
    } else {
        return await res.json()
    }
}



