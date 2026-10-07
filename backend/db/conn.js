const { Sequelize } = require('sequelize')

const db = new Sequelize('ecom','root','senai',{
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
})

db.authenticate()
.then(()=>{
    console.log('conexão realizada')
})
.catch((err)=>{
    console.error('erro na conexão')
})
module.exports = db