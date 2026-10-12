document.getElementById('form_login').addEventListener('submit', async e => {
    e.preventDefault()
    const resposta = document.getElementById('resposta')
    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email: document.getElementById('email').value, senha: document.getElementById('senha').value})
        })
        const dados = await res.json()
        resposta.textContent = dados.message
        if (res.ok) {
            sessionStorage.setItem('token', dados.token)
            window.location.href = '../index.html'
        }
    } catch { resposta.textContent = 'Não foi possível conectar ao servidor.' }
})
