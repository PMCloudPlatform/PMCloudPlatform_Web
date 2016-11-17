var express = require('express');
var router = express.Router();

router.get('/', map);

function map(req, res, next) {
	firstData = {data:[
            {
                "type": "Feature",
                "geometry": {
                "type": "Point",
                "coordinates": [121.4369081, 31.0236681]
                },
                "properties": {"size": 76}},
            {
                "type": "Feature",
                "geometry": {
                "type": "Point",
                "coordinates": [121.4369081, 31.0246681]
                },
                "properties": {"size": 543}},    
        ]}





  	res.render('map', {
	  	title:'pm2.5 cloud platform',
	  	pointData: JSON.stringify(firstData)
  	})
}

module.exports = router;
