var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

/* GET recently watched */
router.get('/getrecent', function(req,res){
	var temp = req.url.split("?");
	var query = temp[1].replace("name=","");
	
	var wdb = req.db.get('watcheddb');

	res.writeHead(200, {'Content­Type': 'text/html'});
	
	wdb.find({name: query}, function(err, doc){
		if(typeof doc[0] == 'undefined') {
			wdb.insert({
				'name': query,
				'watched' : []
			}, function(err,doc){
				
			});
		}
		else {
			json = JSON.stringify({
				'name' : query,
				'watched' : doc[0]['watched']
			});
			res.write(json);
		}
		res.end();
	});
});

router.post('/addrecentview', function(req, res) {

    // Set our internal DB variable
    var wdb = req.db.get('watcheddb');

    // Get our form values. 
    var name = req.body.name;
    var title = req.body.title;
	
	wdb.find({name: name}, function(err, doc){
		var watched = [title]
		
		if(typeof doc[0] != 'undefined') {
			watched = doc[0]['watched'];
			watched.push(title);
		}
		
		console.log(watched);
		wdb.update({
			'name': name
		}, {
			'name': name,
			'watched' : watched
		},function(err,doc){
			
		});
	});
	
    
	res.send("OK");
});
module.exports = router;
