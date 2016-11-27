var timeVM = new Vue({
	el:'#selector',
	data:{
		time:1,
		quantity:30
	},
	methods:{
		searchData: function(){
			this.$http.get('/data/requireData?time='+this.time+'&quantity='+this.quantity).then(
				function(response){
					listVM.items = JSON.parse(response.data);
					// console.log(listVM.items);
				},
				function(err){
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