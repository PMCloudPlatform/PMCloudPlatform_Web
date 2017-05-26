var app = new Vue({
    el: '#app',
    data: {
        status: "",
        message: "",
        username: "",
        password: "",
        repeatPwd: ""
    },
    computed: {
        isSatisfy: function() {
            if (this.password !== "" && this.password === this.repeatPwd && this.username !== "") {
                return false;
            } else {
                return true;
            }
        }
    },
    methods: {
        login: function() {
            location.href = 'login';
        },
        register: function() {
            if (this.password == this.repeatPwd) {
                var data = {
                    "username": this.username,
                    "password": this.password
                };
                console.log(data);
                this.$http.post('/register/register', data).then(
                    function(response) {
                        if (response.data.status == 1) {
                            app.status = "Success!";
                            app.message = "Register successfully!";
                            setTimeout(function() {
                                location.href = '/login';
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
    }
})