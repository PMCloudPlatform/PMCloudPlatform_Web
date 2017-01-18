var predVM = new Vue({
    el: "#selector",
    data: {
        lot: 0,
        lat: 0,
        isDisable: false
    },
    methods: {
        searchData: function () {
            predVM.isDisable = true;
            //取出时间戳  
            var datetime1 = $('#timeInput').data().date;
            var datetimestamp = Date.parse(datetime1).toString();
            console.log(datetimestamp);
            if(datetimestamp == NaN){
                showVM.predictResult = "请选择日期！";
                return;
            }
            if(this.lot < -180 || this.lot > 180){
                showVM.predictResult = "请输入正确的经度！";
                return;
            }
            if(this.lat < -90 || this.lat > 90){
                showVM.predictResult = "请输入正确的纬度！";
                return;
            }
            this.$http.get('/comm/getPredict?time=' + datetimestamp + '&lot=' + this.lot + '&lat=' + this.lat).then(
                function (response) {
                    showVM.predictResult = response.data;
                    predVM.statusClass = 'btn-success';
                    predVM.isDisable = false;
                    console.log(listVM.items);
                },
                function (err) {
                    timeVM.statusClass = 'btn-danger';
                    timeVM.isDisable = false;
                    console.log(err);
                }
            )
        }
    }
});

var showVM = new Vue({
    el: "#showBox",
    data: {
        predictResult: "请输入查询信息"
    }
});