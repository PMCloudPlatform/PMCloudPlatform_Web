var express = require('express');
var db = require('../../mongoDB');
var router = express.Router();

router.get('/', data);
router.get('/requireData', reData);

function data(req, res, next) {
  res.render('data', {title:'pm2.5 cloud platform'})
}

function reData(req, res, next) {
	var Data = [];
	if(req.query.quantity == undefined) res.send(JSON.stringify([]));;
	db.find({}, 0, Number(req.query.quantity), function(result){
		if(result == undefined){
			console.log('Error');
		}
		else if (result.length == 0){
			console.log('Load finished');
		}
		else{
			result.forEach(function(e){
				if(e.LOT != undefined && e.LAT != undefined && e.PM != undefined){
					// console.log(e.LOT);

					Data.push({
						"LOT": e.LOT,
						"LAT": e.LAT,
						"PM": e.PM
					})
				}
			})
		}
		res.send(JSON.stringify(Data));
	})
}

module.exports = router;
