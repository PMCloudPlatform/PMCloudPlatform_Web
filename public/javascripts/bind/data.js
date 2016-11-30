var timeVM = new Vue({
    el: '#selector',
    data: {
        time: 1,
        quantity: 30,
        baseClass: 'btn btn-block',
        statusClass: 'btn-primary',
        isDisable: false
    },
    methods: {
        searchData: function() {
            timeVM.isDisable = true;
            this.$http.get('/data/requireData?time=' + this.time + '&quantity=' + this.quantity).then(
                function(response) {
                    listVM.items = JSON.parse(response.data);
                    // timeVM.statusClass = 'btn-success';
                    timeVM.isDisable = false;
                    // console.log(listVM.items);
                },
                function(err) {
                    timeVM.statusClass = 'btn-danger';
                    timeVM.isDisable = false;
                    console.log(err);
                }
            )
        }
    }
});



var listVM = new Vue({
    el: '#showList',
    data: {
        items: []
    }
});
