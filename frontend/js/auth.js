// Envia o token nas requisições existentes, inclusive consultas GET.
const fetchOriginal = window.fetch.bind(window)
const paginaLogin = new URL('html/login.html', new URL('../', document.currentScript.src)).href
window.fetch = async function (url, opcoes = {}) {
    const destino = new URL(url, window.location.href)
    if (destino.origin !== 'http://localhost:3000') return fetchOriginal(url, opcoes)
    const headers = new Headers(opcoes.headers)
    const token = sessionStorage.getItem('token')
    if (token) headers.set('Authorization', token)
    const resposta = await fetchOriginal(url, {...opcoes, headers})
    if (resposta.status === 401 && destino.pathname !== '/login') {
        sessionStorage.removeItem('token')
        window.location.href = paginaLogin
    }
    return resposta
}
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav')
    if (!nav) return
    const link = document.createElement('a')
    link.href = paginaLogin
    link.textContent = sessionStorage.getItem('token') ? 'Sair' : 'Login'
    link.addEventListener('click', () => { sessionStorage.removeItem('token') })
    nav.prepend(link, document.createTextNode(' | '))
})
