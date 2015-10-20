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
		
		//if entry doesnt exist, create the entry
		if(typeof doc[0] == 'undefined') {
			wdb.insert({
				'name': query,
				'watched' : []
			}, function(err,doc){});
		}
		//if entry exists, get the list and return it
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

/* POST add recently watched video */
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
			var index = watched.indexOf(title);
			
			//if entry already exists, remove it and push it back
			//to the list. this way, entry is moved up in the list. 
			if( index >= 0 ) {
				watched.splice(index,1);
			}
			watched.push(title);
		}

		wdb.update({
			'name': name
		}, {
			'name': name,
			'watched' : watched
		},function(err,doc){});
	});
	res.send("OK");
});
module.exports = router;
