const express = require("express");
const router = express.Router();
const Category = require("./Category");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

// Rota para criar uma nova categoria
router.get("/admin/categories/new", adminAuth, (req, res) => {

    //Renderiza na tela a pagina para criação de novas categorias
    res.render("admin/categories/new");
});

// Rota para cadastrar no banco de dados uma nova Categoria
router.post("/categories/save", (req, res) => {

    // Pegando o titulo através do corpo da requisição
    var title = req.body.title;

    // Verificando se existe conteúdo na variável titulo
    if( title != undefined ){

        // Cadastrando no bando de dados uma nova categoria passando o Titulo e o Slug.
        // O mesmo que:
        // INSERT INTO categories (title, slug) VALUES ('title', 'title');
        Category.create({
            title: title,
            slug: slugify(title),
        }).then(() => {
            res.redirect("/admin/categories/");
        })

    }else{
        res.redirect("/admin/categories/new");
    }
});

// Rota para listar e exibir as categorias no Front-End
router.get("/admin/categories", adminAuth, (req, res) => {

    // Falando para o Sequelize realizar uma consulta no banco de dados e trazer todas as informações da tabela categories
    // O mesmo que:
    // SELECT * FROM categories;
    Category.findAll().then(categories => {
        res.render("admin/categories/index", { categories: categories });
    });

});

// Rota para realizar a exclusão de categoria através do front-end
router.post("/categories/delete", (req, res) => {

    // Falando para o Sequelize realizar uma consulta no banco de dados e trazer todas as informações da tabela categories
    Category.findAll().then(categories => {
        
        // Pegando o ID da categoria que o usuário quer realizar a exclusão através do corpo da requisição
        var id =  req.body.id;

        // Verificando de a variável ID possui conteúdo
        if (id != undefined ) {

            // Verificando se o conteúdo da variavel ID é diferente de Letras
            if( !isNaN(id) ){
                
                // Passando para o Sequelize para excluir a categoria com o id igual ao ID pego no corpo da requisição
                // O mesmo que:
                // DELETE FROM categories WHERE categories.id = id;
                Category.destroy({
                    where: {
                        id: id
                    }
                }).then(() => { // Quando concluir a exclusão redireciona usuário para tela de categorias
                    res.redirect("/admin/categories");
                });

            } else { // id != NUMÉRICO
                res.redirect("/admin/categories");
            }

        } else { // id = NULL
            
            res.redirect("/admin/categories");
        
        };
    });

});

// Rota para criar a pagina de edição da categoria para o front-end
router.get("/admin/categories/edit/:id", adminAuth, (req, res) => {

    // Pegando o ID que esta sendo passado pela rota através dos parâmetros da requisição
    var id = req.params.id;

    // Verificando se o conteúdo da varável ID é diferente de numérico
    if (isNaN(id)) {
        res.redirect("../../../admin/categories");
    }

    // Utilizando o Sequelize para realizar um consulta no banco de dados passando o ID como chave primaria
    // O mesmo que:
    // SELECT * FROM categories WHERE categories.id = id);
    Category.findByPk(id).then(category => {

        // Verificar se a variavel category possui valor
        if (category != undefined) {           
        
            // Renderiza para o usuário a pagina edit.ejs (/admin/categories/edit.ejs) e passa o conteúdo da consulta feita no banco de dados.
            res.render("admin/categories/edit",{category: category});
        
        } else {
            
            res.redirect("admin/categories");
        
        }

    }).catch(erro => { // Caso a categoria não seja encontrada ou aconteça algum problema direciona o usuário para tela de listagem das categorias
        
        res.redirect("admin/categories");
   
    });

});

// Rota para realizar o UPDATE de uma Categoria
router.post("/categories/update", (req, res) => {
    // Pegando o ID e o TITLE do front-end vindos pelo corpo da requisição
    var id = req.body.id;
    var title = req.body.title;

    //Falando ao sequelize para atualizar o titulo e o slug onde o ID do titulo seja igual ao ID recebido do front-end
    // O mesmo que:
    // UPDATE categories SET categories.title = 'title', categories.slug = 'title' WHERE categories.id = id; 
    Category.update({title: title, slug: slugify(title)}, {
    
        where: {
            id:id
        }
    
    }).then(() => { //Quando a atualização acontecer - Redirecionar o usuário para pagina de Categorias
        
        res.redirect("/admin/categories");
    
    });
});

module.exports = router;