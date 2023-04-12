let token = window['siyuan']?.config.api.token

export async function request(url, data) {
    let response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: {
            Authorization: `Token ${token}`,
        },
    });
    let r = await response.json();
    return r ? (r?.code === 0 ? r.data : null) : null;
}

