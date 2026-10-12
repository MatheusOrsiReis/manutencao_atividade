const cryptoJs = require('crypto-js')
const CHAVE_SECRETA = 'segredo' // deve ficar no arquivo .env

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']
    if (!token) return res.status(401).json({message: 'Acesso negado! Faça o login!'})
    try {
        const bytes = cryptoJs.AES.decrypt(token, CHAVE_SECRETA)
        const dadosDescriptografados = bytes.toString(cryptoJs.enc.Utf8)
        if (!dadosDescriptografados) return res.status(403).json({message: 'Acesso proibido!'})

        const payload = JSON.parse(dadosDescriptografados)
        if (!payload.expiraEm || Date.now() >= payload.expiraEm) {
            return res.status(401).json({message: 'Sessão expirada! Faça login!'})
        }
        req.usuario = payload
        next()
    } catch (err) {
        return res.status(401).json({message: 'Falha na autenticação!'})
    }
}
module.exports = authMiddleware
