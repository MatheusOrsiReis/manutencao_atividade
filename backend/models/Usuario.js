const { DataTypes } = require('sequelize')
const db = require('../db/conn')

const Usuario = db.define('usuario',{
    codUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        unique: true,
        type: DataTypes.STRING(100),
        allowNull: false
    },
    senha: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    cpf:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    telefone:{
        type: DataTypes.STRING(100),
        allowNull: false
    }
},{
    timestamps: false,
    tableName: 'usuarios'
})

module.exports = Usuario