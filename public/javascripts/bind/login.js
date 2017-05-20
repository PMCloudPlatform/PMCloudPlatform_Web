var app = new Vue({
    el: '#app',
    data: {
        username: "",
        password: "",
        status: "",
        message: ""
    },
    methods: {
        register: function() {
            location.href = 'register';
        },
        login: function() {
            console.log(this);
            var data = {
                "username": this.username,
                "password": this.password
            };
            this.$http.post('/login/login', data).then(
                function(response) {
                    if (response.data.status == 1) {
                        app.status = "Success!";
                        app.message = "Login successfully!";
                        setTimeout(function() {
                            location.href = '/';
                        }, 2000);
                        $('#warning').modal({});
                    } else if (response.data.status == 0) {
                        app.status = "Error!";
                        app.message = `Something wrong while following ${response.data.msg}`;
                        $('#warning').modal({});
                    }
                },
                function(err) {
                    console.log(err);
                }
            )
        }
    }
});