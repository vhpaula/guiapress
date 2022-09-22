const Sequelize = require("sequelize");
const connection = require("../database/database");

const Category = connection.define('categories', {
    title:{
        type: Sequelize.STRING,
        allowNull:false,
    },
    slug:{
        type: Sequelize.STRING,
        allowNull: false,
    },
});

//Category.sync({force: true}) //força a criação da tabela quando reiniciar a aplicação

module.exports = Category;