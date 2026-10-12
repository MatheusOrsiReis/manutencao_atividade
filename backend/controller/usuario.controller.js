const Usuario = require('../models/Usuario')

const cryptoJs = require('crypto-js')
const CHAVE_SECRETA = 'segredo' // deve ficar no arquivo .env

const cadastrar = async (req, res)=>{
    let valores
    try { valores = preparar(req.body || {}) }
    catch (err) { return res.status(400).json({message: err.message}) }

    if(!valores.nome || !valores.email || !valores.senha){
        return res.status(400).json({message: 'Todos os campos são obrigatórios!'})
    }



    try{
        if (await Usuario.findOne({where: {email: valores.email}})) return res.status(409).json({message: 'Email já cadastrado!'})

        await Usuario.create({
            nome: valores.nome,
            email: valores.email,
            senha: valores.senha,
            cpf: valores.cpf,
            telefone: valores.telefone
            
        })
        res.status(201).json({message: 'dados cadastrados com sucesso'})
    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Email já cadastrado!'})
        console.error('Não foi possível cadastrar o Usuário',err.message)
        res.status(500).json({message: 'Não foi possível cadastrar o Usuário'})
    }
}
const listar = async (req,res)=>{
    try{
        const dados = await Usuario.findAll({attributes: atributosPublicos})
        res.status(200).json(dados)
    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Email já cadastrado!'})
        console.error('Não foi possível listar os Usuários',err.message)
        res.status(500).json({message: 'Não foi possível listar os Usuários'})
    }
}
const buscarPorCod = async (req,res)=>{
    const id = req.params.id
    try{
        const dados = await Usuario.findByPk(id, {attributes: atributosPublicos})
        if(!dados){
            res.status(404).json({message: 'Usuário não encontrado!'})
        }else{
            res.status(200).json(dados)
        }
    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Email já cadastrado!'})
        console.error('Não foi possível encontrar o Usuário',err.message)
        res.status(500).json({message: 'Não foi possível encontrar o Usuário'})
    }
}
const buscarPorNome = async (req,res)=>{
    const nome = req.params.nome
    try{
        const dados = await Usuario.findOne({where: { nome: nome}, attributes: atributosPublicos})
        if(!dados){
            res.status(404).json({message: 'Nome do Usuário não encontrado!'})
        }else{
            res.status(200).json(dados)
        }
    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Email já cadastrado!'})
        console.error('Não foi possível encontrar o nome do Usuário',err.message)
        res.status(500).json({message: 'Não foi possível encontrar o nome do Usuário'})
    }
}
const excluir = async (req,res)=>{
    const id = req.params.id
    try{
        const dados = await Usuario.findByPk(id, {attributes: atributosPublicos})
        if(!dados){
            res.status(404).json({message: 'Usuário não encontrado no banco de dados!'})
        }else{
            await Usuario.destroy({where: { codUsuario: id}})
            res.status(200).json({message: 'Usuário excluído com sucesso!'})
        }
    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Email já cadastrado!'})
        console.error('Não foi possível excluir o Usuário',err.message)
        res.status(500).json({message: 'Não foi possível excluir o Usuário'})
    }
}
const atualizar = async (req,res)=>{
    const id = req.params.id
    let valores
    try { valores = preparar(req.body || {}, true) }
    catch (err) { return res.status(400).json({message: err.message}) }
    try{
        let dados = await Usuario.findByPk(id, {attributes: atributosPublicos})
        if(!dados){
            res.status(404).json({message: 'Usuário não encontrado no banco de dados!'})
        }else{
            if (valores.email) {
                const existente = await Usuario.findOne({where: {email: valores.email}})
                if (existente && existente.codUsuario !== dados.codUsuario) return res.status(409).json({message: 'Email já cadastrado!'})
            }
            await Usuario.update(valores, { where: { codUsuario: id}})
            dados = await Usuario.findByPk(id, {attributes: atributosPublicos})
            res.status(200).json(dados)
        }
    }catch(err){
        if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({message: 'Email já cadastrado!'})
        console.error('Não foi possível atualizar o Usuário',err.message)
        res.status(500).json({message: 'Não foi possível atualizar o Usuário'})
    }
}
module.exports = { cadastrar, listar, buscarPorCod, buscarPorNome, excluir, atualizar}
const atributosPublicos = ['codUsuario', 'nome', 'email', 'telefone']
function preparar(valores, parcial = false) {
    const dados = {}
    for (const campo of ['nome', 'email', 'senha', 'cpf', 'telefone']) {
        if (parcial && valores[campo] === undefined) continue
        if (typeof valores[campo] !== 'string' || !valores[campo].trim()) throw new Error('Campo ' + campo + ' obrigatório!')
        dados[campo] = campo === 'senha' ? valores[campo] : valores[campo].trim()
    }
    if (!Object.keys(dados).length) throw new Error('Informe um campo para atualizar!')
    if (dados.nome && dados.nome.length > 100) throw new Error('Nome deve ter até 100 caracteres!')
    if (dados.email) {
        dados.email = dados.email.toLowerCase()
        if (dados.email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) throw new Error('Email inválido!')
    }
    if (dados.cpf) {
        dados.cpf = dados.cpf.replace(/[.\-\s]/g, '')
        if (!/^\d{11}$/.test(dados.cpf)) throw new Error('CPF deve conter 11 dígitos!')
        dados.cpf = cryptoJs.AES.encrypt(dados.cpf, CHAVE_SECRETA).toString()
    }
    if (dados.telefone && !/^\d{10,11}$/.test(dados.telefone.replace(/[()\s+\-]/g, ''))) throw new Error('Telefone deve conter 10 ou 11 dígitos com DDD!')
    if (dados.senha) dados.senha = cryptoJs.AES.encrypt(dados.senha, CHAVE_SECRETA).toString()
    return dados
}
