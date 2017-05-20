var registerVm = new Vue({
    el: '#app',
    data: {
        status: "",
        message: "",
        username: "",
        password: "",
        repeatPwd: "",
        warning: ""
    },
    methods: {
        login: function() {
            location.href = 'login';
        },
        identity: function() {
            if (this.password != this.repeatPwd) {
                console.log("www");
                this.warning = "1px solid red";
            } else {
                this.warning = "";
            }
        },
        register: function() {
            if (this.password == this.repeatPwd) {
                var data = {
                    "uname": this.username,
                    "upwd": this.password
                };
                console.log(data);
                this.$http.post('/register/register', data).then(
                    function(response) {
                        if (response.data.status == 1) {
                            app.status = "Success!";
                            app.message = "Register successfully!";
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