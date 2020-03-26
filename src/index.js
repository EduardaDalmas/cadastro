const axios = require("axios");
import Swal from 'sweetalert2'

class App {
    constructor() {
        this.buttonCreate = document.getElementById("btn_create");
        this.buttonEdit = document.getElementById("btn_edit");
        this.buttonLogin = document.getElementById("login");
        this.buttonLogar = document.getElementById("logar");
        this.buttonCadastrar = document.getElementById("cadastrar");
        this.buttonCadastro = document.getElementById("cadastro");

        this.title = document.getElementById("input_title");
        this.content = document.getElementById("input_content");

        this.cardEditing = null;

        //this.url = 'https://node-api-card.herokuapp.com/cards/';
        //this.urlLogin = 'https://node-api-card.herokuapp.com/login';
        this.url = 'http://localhost:3000/cards/';
        this.urlLogin = 'http://localhost:3000/login';
        this.urlCadastro = 'http://localhost:3000/users';

        this.token = null;

        this.getScraps(this, null);
        this.registerEvents();
    }

    registerEvents() {
        this.buttonCreate.onclick = (event) => this.createCard(event);
        this.buttonEdit.onclick = (event) => this.editCard(event, this);
        this.buttonLogin.onclick = (event) => this.logar();
        this.buttonLogar.onclick = (event) => this.login(event, this);
        this.buttonCadastrar.onclick = (event) => this.cadastrar(event, this);
        this.buttonCadastro.onclick = (event) => this.cadastro();
        

    }

    getScraps(app) {
        axios.get(this.url, this.token)
            .then(function (response) {
                app.recoveryScraps(response.data);
            })
            .catch(function (error) {
                console.log(error);
                //$("#LoginModal").modal("show");
            })
            .finally(function () {
            });
    }

    recoveryScraps(data) {
        for(item of data) {
            const html = this.cardLayout(item.id, item.title, item.content);

            this.insertHtml(html);
        }

        this.registerButtons();
    }

    registerButtons() {
        document.querySelectorAll('.delete-card').forEach(item => {
            item.onclick = event => this.deleteCard(event, this);
        });

        document.querySelectorAll('.edit-card').forEach(item => {
            item.onclick = event => this.openEditCard(event);
        });

        //console.log("Register Buttons!");
    }

    createCard(event) {
        event.preventDefault();

        if(this.title.value && this.content.value) {
            this.sendToServer(this);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'preencha os campos!',
                footer: '<a href>Why do I have this issue?</a>'
              });
        }
    }

    sendToServer(app) {
        axios.post(this.url, {
                title: this.title.value,
                content: this.content.value
            },app.token)
            .then(function (response) {
                const {id, title, content} = response.data;
                let html = app.cardLayout(id, title, content);

                app.insertHtml(html);

                app.clearForm();

                app.registerButtons();

            })
            .catch(function (error) {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'tente novamente mais tarde!',
                    footer: '<a href>Why do I have this issue?</a>'
                  });
            })
            .finally(function () {
            });
    }

    cardLayout(id, title, content) {
        const html = `
            <div class="col mt-5" scrap="${id}">
            <img class="card-img-top" src="imgs/lembre.jpg" alt="Imagem de capa do card">
                <div class="card">
                    <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${content}</p>
                    <button type="button" class="btn btn-primary edit-card" data-toggle="modal" data-target="#editModal">
                        Editar
                    </button>
                    <button type="button" class="btn btn-danger delete-card">Excluir</button>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    insertHtml(html) {
        document.getElementById("row_cards").innerHTML += html;
    }

    clearForm() {
        this.title.value = "";
        this.content.value = "";
    }

    deleteCard = (event, app) => {
        const id = event.path[3].getAttribute('scrap');
        
        axios.delete(`${this.url}${id}`, app.token)
            .then(function (response) {
                event.path[3].remove();
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
 });
 };

    openEditCard = (event) => {
        const id = event.path[3].getAttribute('scrap');
        const title = event.path[1].children[0].innerHTML;
        const content = event.path[1].children[1].innerHTML;
        
        document.getElementById("edit-title").value = title;
        document.getElementById("edit-content").value = content;
        document.getElementById("edit-id").value = id;

        this.cardEditing = event.path[1];
        this.cardEditing.editId = id;
    };

    editCard = (event, app) => {
        const id = this.cardEditing.editId;
        const title = document.getElementById("edit-title").value;
        const content = document.getElementById("edit-content").value

        axios.put(`${this.url}${id}`, {
            title: title,
            content: content
        },app.token)
        .then( (response) => {
            this.cardEditing.children[0].innerHTML = title;
            this.cardEditing.children[1].innerHTML = content;
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'tente novamente mais tarde!',
                footer: '<a href>Why do I have this issue?</a>'
              });
        })
        .finally(function () {
        }); 
    }

    logar(){
        $("#LoginModal").modal("show");
    }


    login(event, app) {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        axios.post(this.urlLogin, {
          email: email,
          password: password
        })
          .then( function (response)  {
            Swal.fire(
                'Good job!',
                'login efetuado com sucesso!',
                'success'
            )
            app.token =  {
              headers: {
                'Authorization': 'Bearer ' + response.data.token
              }
            }
            console.log(response.data.token);
            app.getScraps(app);
            //console.log(app);
  
          })
          .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'login inválido!',
                footer: '<a href>Why do I have this issue?</a>'
              });
          })
          .finally(function () {
          });
  
      
        }

        cadastro() {
            $("#CadastroModal").modal("show");
        }
        

        cadastrar(event, app) {
            const nameCad = document.getElementById('name').value;
            const emailCad = document.getElementById('email1').value;
            const passwordCad = document.getElementById('password').value;

            axios.post(this.urlCadastro, {
                name: nameCad,  
                email: emailCad,
                password: passwordCad
            })
                .then( function (response)  {
                    Swal.fire(
                        'Good job!',
                        'cadastro efetuado com sucesso!',
                        'success'
                      )

                $("#LoginModal").modal("show");
                })
                .catch(function (error) {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'falha no cadastramento!',
                    footer: '<a href>Why do I have this issue?</a>'
                  });
                })
                .finally(function () {
                });

        }
    
}

new App();