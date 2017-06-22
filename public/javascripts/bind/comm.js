var app = new Vue({
    el: "#selector",
    data: {
        lot: 0,
        lat: 0,
        isDisable: false,
        statusClass: 'btn-primary',
        loopEvent: 0
    },
    methods: {
        searchData: function() {
            app.isDisable = true;
            //取出时间戳  
            var datetime1 = $('#timeInput').data().date;
            var datetimestamp = Date.parse(datetime1).toString();
            console.log(datetimestamp);
            if (isNaN(datetimestamp)) {
                showVM.predictResult = "请选择日期！";
                app.isDisable = false;
                // return;
            } else if (this.lot < -180 || this.lot > 180) {
                showVM.predictResult = "请输入正确的经度！";
                app.isDisable = false;
                // return;
            } else if (this.lat < -90 || this.lat > 90) {
                showVM.predictResult = "请输入正确的纬度！";
                app.isDisable = false;
                // return;
            } else {
                this.$http.get('/comm/getPredict?time=' + datetimestamp + '&lot=' + this.lot + '&lat=' + this.lat).then(
                    function(response) {
                        showVM.predictResult = response.data;
                        app.statusClass = 'btn-success';
                        app.isDisable = false;
                        console.log(showVM.predictResult);
                        app.loopEvent = setInterval(checkResult, 1000);
                    },
                    function(err) {
                        app.statusClass = 'btn-danger';
                        app.isDisable = false;
                        console.log(err);
                    }
                )
            }
        }
    }
});

var app = new Vue({
    el: '#app',
    methods: {
        quit: function() {
            this.$http.post('/quit').then(
                function(response) {
                    if (response.data.status == 1) {
                        app.status = "Success!";
                        app.message = response.data.msg;
                        setTimeout(function() {
                            location.href = '/';
                        }, 2000);
                        $('#warning').modal({});
                    } else if (response.data.status == 0) {
                        app.status = "Error!";
                        app.message = `Something wrong while following ERR:${response.data.msg}`;
                        $('#warning').modal({});
                    }
                },
                function(err) {
                    console.log(err);
                }
            )
        }
    }
})

function checkResult() {
    Vue.http.get('/comm/getResult').then(
        function(response) {
            if (response.data != "1") {
                showVM.predictResult = response.data;
                app.statusClass = 'btn-success';
                app.isDisable = false;
                console.log(showVM.predictResult);
                clearInterval(app.loopEvent);
            };
        },
        function(err) {
            app.statusClass = 'btn-danger';
            app.isDisable = false;
            console.log(err);
        }
    )
}
var showVM = new Vue({
    el: "#showBox",
    data: {
        predictResult: "请输入查询信息"
    }
});