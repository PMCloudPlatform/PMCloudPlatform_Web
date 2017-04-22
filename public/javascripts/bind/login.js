var loginVM = new Vue({
    el: '#app',
    data: {
        username: "",
        password: ""
    },
    methods: {
        register: function() {
            location.href = 'register';
        },
        login: function() {
            console.log(this);
            var data = {
                "uname": this.username,
                "upwd": this.password
            };
            this.$http.get('/login/login').then(
                function(response) {
                    console.log(response.data);
                },
                function(err) {
                    console.log(err);
                }
            )
        }
    }
});