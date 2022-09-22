const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");


router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles})
    });
});

router.get("/admin/articles/new", adminAuth, (req, res) => {
    
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories})
    });

});

router.post("/articles/save", (req, res) => {
    
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    if( (title != undefined) && (body != undefined) && (category != undefined) ){
        //Cadastrando no bando de dados uma nova categoria passando o Titulo e o Slug.
        //O mesmo que:
        //INSERT INTO categories (title, slug) VALUES ('title', 'title');
        Article.create({
            title: title,
            slug: slugify(title),
            body: body,
            categoryId: category            
        }).then(() => {
            res.redirect("/admin/articles");
        });
    }else{
        res.redirect("/admin/articles");
    }

});

// Rota para realizar a exclusão de categoria através do front-end
router.post("/articles/delete", (req, res) => {

    // Falando para o Sequelize realizar uma consulta no banco de dados e trazer todas as informações da tabela categories
    Article.findAll().then(articles => {
        
        // Pegando o ID da categoria que o usuário quer realizar a exclusão através do corpo da requisição
        var id =  req.body.id;

        // Verificando de a variável ID possui conteúdo
        if (id != undefined ) {

            // Verificando se o conteúdo da variavel ID é diferente de Letras
            if( !isNaN(id) ){
                
                // Passando para o Sequelize para excluir a categoria com o id igual ao ID pego no corpo da requisição
                // O mesmo que:
                // DELETE FROM categories WHERE categories.id = id;
                Article.destroy({
                    where: {
                        id: id
                    }
                }).then(() => { // Quando concluir a exclusão redireciona usuário para tela de categorias
                    res.redirect("/admin/articles");
                });

            } else { // id != NUMÉRICO
                res.redirect("/admin/articles");
            }

        } else { // id = NULL
            
            res.redirect("/admin/articles");
        
        };
    });

});

// Rota para criar a pagina de edição da categoria para o front-end
router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {

    // Pegando o ID que esta sendo passado pela rota através dos parâmetros da requisição
    var id = req.params.id;

    // Verificando se o conteúdo da varável ID é diferente de numérico
    if (isNaN(id)) {
        res.redirect("../../../admin/articles");
    }

    // Utilizando o Sequelize para realizar um consulta no banco de dados passando o ID como chave primaria
    // O mesmo que:
    // SELECT * FROM categories WHERE categories.id = id);
    Article.findByPk(id).then(article => {

        // Verificar se a variavel category possui valor
        if (article != undefined) {           
            
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {categories: categories, article: article});
            });
        
        } else {
            
            res.redirect("/");
        
        }

    }).catch(erro => { // Caso a categoria não seja encontrada ou aconteça algum problema direciona o usuário para tela de listagem das categorias
        
        res.redirect("admin/article");
   
    });

});

router.post("/articles/update", (req, res) => {
    // Pegando o ID e o TITLE do front-end vindos pelo corpo da requisição
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category

    //Falando ao sequelize para atualizar o titulo e o slug onde o ID do titulo seja igual ao ID recebido do front-end
    // O mesmo que:
    // UPDATE categories SET categories.title = 'title', categories.slug = 'title' WHERE categories.id = id; 
    Article.update({
        title: title, 
        slug: slugify(title), 
        body: body, 
        categoryId: category
    },
    {
        where: {
            id:id
        }
    }).then(() => { //Quando a atualização acontecer - Redirecionar o usuário para pagina de Categorias
        
        res.redirect("/admin/articles");
    
    }).catch(err => {
        res.redirect("/");
    });
});

router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var offset = 0;

    if (isNaN(page) || page == 1) {
        offset = 0;
    } else {
        offset = (parseInt(page) - 1 ) * 4;
    }

    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order: [
            ['id', 'DESC']
        ],
        include: [{model: Category}],
    }).then(articles => {

        var next;

        if( offset + 4 >= articles.count ){
            next = false;
        } else {
            next = true;
        }

        var result = {
            page : parseInt(page),
            next : next,
            articles : articles,
        }

        Category.findAll().then(categories => {
            res.render("admin/articles/page", {result: result, categories: categories})
        });
    });

});


module.exports = router;