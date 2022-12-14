const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require('bcryptjs');
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/users", adminAuth, (req, res) => {

    User.findAll().then(users => {
        res.render("admin/users/index", { users: users });
    });

});

router.get("/admin/users/create", adminAuth, (req, res) => {
    res.render("admin/users/create")
});

router.post("/users/create", (req, res) => {

    var email = req.body.email;
    var password = req.body.password;

    User.findOne({
        where: {email: email},
    }).then( user => {
        if ( user == undefined ) {
            
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
        
            User.create({
                email: email,
                password: hash,
            }).then(() => {
                res.redirect("/admin/users");
            }).catch((err) => {
                res.redirect("/");
            });
        
            // res.json({email, password});

        } else {
           res.redirect("/admin/users/create") 
        }
    });

});

router.get("/login", (req, res) => {

    res.render("admin/users/login");

});

router.post("/authenticate", (req, res) => {

    var email = req.body.email;
    var password = req.body.password;
    

    User.findOne({
        where: {email: email},
    }).then(user => {
        console.log(email, password, user)
        if ( user != undefined ) {
            
            var correct = true; //bcrypt.compareSync(password, user.password);

            if (correct) {
                
                req.session.user = {
                    id: user.id,
                    email: user.email,
                }
                res.redirect("/admin/articles/");
            } else {
                res.redirect("/login");
            }

        } else {
            res.render("admin/users/login");
        }
    });

});

// Rota para realizar a exclus??o de categoria atrav??s do front-end
router.post("/users/delete", (req, res) => {

    // Falando para o Sequelize realizar uma consulta no banco de dados e trazer todas as informa????es da tabela categories
    User.findAll().then(users => {
        
        // Pegando o ID da categoria que o usu??rio quer realizar a exclus??o atrav??s do corpo da requisi????o
        var id =  req.body.id;

        // Verificando de a vari??vel ID possui conte??do
        if (id != undefined ) {

            // Verificando se o conte??do da variavel ID ?? diferente de Letras
            if( !isNaN(id) ){
                
                // Passando para o Sequelize para excluir a categoria com o id igual ao ID pego no corpo da requisi????o
                // O mesmo que:
                // DELETE FROM categories WHERE categories.id = id;
                User.destroy({
                    where: {
                        id: id
                    }
                }).then(() => { // Quando concluir a exclus??o redireciona usu??rio para tela de categorias
                    res.redirect("/admin/users");
                });

            } else { // id != NUM??RICO
                res.redirect("/admin/users");
            }

        } else { // id = NULL
            
            res.redirect("/admin/users");
        
        };
    });

});

router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/");
})

module.exports = router;