var registerVm = new Vue({
    el: '#app',
    data: {
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
                        console.log(response.data);
                    },
                    function(err) {
                        console.log(err);
                    }
                )
            }
        }
    }

})