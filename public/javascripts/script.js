

$(document).ready(function(){
	//var hostname = "https://accedo.herokuapp.com";
	var hostname = "http://localhost:3000";
	
	//Handles Recently Viewed
	var list = {};
	
	function getName() {
		return new Fingerprint().get();
	}
	
	//Makes sure the bg color of the recently watched list is alternating
	function sort() {
		var ctr = 0;
		$("#watched li").each(function(index, li){
			$(this).removeClass("bg0");
			$(this).removeClass("bg1");
			$(this).addClass("bg"+(ctr%2));
			ctr++;
		});
	}
	
	function postJSON(name, title) {
		var myJSON = new Object();
		myJSON.name = name;
		myJSON.title = title;
		
		$.ajax({
		  type: "POST",
		  url: hostname+"/addrecentview",
		  data: myJSON,
		  success: function(){},
		  dataType: "json"
		});
	}
	
	function addRecentlyViewedEntry(title) {
		//checks if video was already in the list.
		//if it is, then move it on top of the list.
		if( list[title] == undefined) {
			var recentCount = $("#watched ul > li").length;
			toAdd = "";
			toAdd += "<li class=\"bg"+(recentCount%2)+"\">";
			toAdd += 	"<div class=\"fa fa-eye left\"></div>";
			toAdd += 	"<p class=\"left\">"+title+"</p>";
			toAdd += 	"<div class=\"clearfix\"></div>";
			toAdd += "</li>";
			$("#watched ul").prepend(toAdd);
			list[title] = 1;
			addListener();
		} else {
			$("#watched li").each(function(){
				if($(this).text() == title ) {
					$(this).parent().prepend(this);
					sort();
				}
			});
		}
	}
	
	function addRecentlyViewed(video) {
		var title = $(video).attr("title");
		var name = getName();
		postJSON(name, title);
		addRecentlyViewedEntry(title); 
	}
	
	//show the video on the screen
	function moveOnScreen(video) {
		var id = parseInt($(video).attr("id").replace("video-",""));
		if( !inView(id) ) {
			var diff = 0;
			
			//checks if video is among the last 4 in the list
			//if it is, then adjust scrolling accordingly
			if( id > $("video").length-4 ){
				diff = rightScroll-($("video").length-4);
				rightScroll = 26;
			} else {
				diff = rightScroll - id;
				rightScroll = id;
			}
			
			var width = getActualWidth();
			animateSlider(width*diff, true, $(video));
		} else {
			changeSelected($("video.selected"), $(video));
		}
	}
	
	function addListener() {
		$("#watched li").click(function() {
			var title = $(this).text();
			$("#vid-slider video").each(function(){
				var vidTitle = $(this).attr("title");
				if( vidTitle == title ) {
					moveOnScreen($(this));
				}
			});
		});
	}
	
	function populateRecentlyViewed() {
		var name = getName();
		$.ajax({
			url: hostname+"/getrecent?name="+name,
			dataType: 'json'
		}).done(function(data){
			for( title in data.watched ) {
				addRecentlyViewedEntry(data.watched[title]);
				list[title] = 1;
				addListener();
			}
		});
	}
	
	populateRecentlyViewed();
	
	//Handles Video Carousel
    var rightScroll = 0.0;
	var count = 0;
	
	//sets up the video carousel.
	function setup() {
		var toAdd = "";
		for( var x = 0; x < source["totalCount"]; x++ ) {
			count ++;
			selected = "selected";
			if(x != 0) selected = "";
			entry = source["entries"][x];
			toAdd += "<div id=\"video-set-" + x + "\" class=\"video-set\">";
			toAdd += 	"<video class=\"video "+selected+" bg"+(x%2)+"\" id=\"video-" + x + "\"";
			toAdd +=			"title=\""+entry["title"]+"\"";
			toAdd +=			"poster=\"" + entry["images"][0]["url"] + "\" >";
							
			toAdd +=		"<source src=\"" + entry["contents"][0]["url"] + "\" type=\"video/mp4\">";
			toAdd += 		"Your browser does not support the video tag.";
			toAdd += 	"</video>";
			toAdd += "<h3>"+entry["title"]+"</h3>"
			toAdd += "</div>";
		}
		
		toAdd += "<div class=\"clearfix\"></div>";
		$("#vid-slider").html(toAdd);
		
		//sets width to adjust according to width of browser
		$("#vid-slider").css("width", count*25+"%");
		$(".video-set").css("width", ((1/count)*100)+"%");
		
		//add on click listener for the videos
		$("#vid-slider video").click(function() {
			var vid = $(this).get(0);
			
			if (vid.requestFullscreen) {
				vid.requestFullscreen();
			} else if (vid.webkitRequestFullscreen) {
				vid.webkitRequestFullscreen();
			} else if (vid.mozRequestFullScreen) {
				vid.mozRequestFullScreen();
			} else if (vid.msRequestFullscreen) {
				vid.msRequestFullscreen();
			}
			vid.play();
			addRecentlyViewed(vid);
		});
		
		//add on ended listener for the videos
		$("#vid-slider video").on( "ended", function() {
			var vid = $(this).get(0);
			if (vid.exitFullscreen) {
				vid.exitFullscreen();
			} else if (vid.webkitExitFullscreen) {
				vid.webkitExitFullscreen();
			} else if (vid.mozCancelFullScreen) {
				vid.mozCancelFullScreen();
			} else if (vid.msExitFullscreen) {
				vid.msExitFullscreen();
			}
			vid.load();
		});
		
		//adds a listener when fullscreen mode is toggled
		$('#vid-slider video').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
			var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
			if( !state ) {
				var vid = $(this).get(0);
				vid.pause();
			}
			
		});
		
		//adds on click listener for the arrow carrousel
		$( ".right-arrow" ).click(function() {
			
			if(rightScroll+4 < count ) {
				var width = getActualWidth();
				rightScroll ++;
				var selectedID = parseInt($("video.selected").attr("id").replace("video-",""));
				animateSlider(-1*width, !inView(selectedID), $("#video-"+rightScroll));
			}
			
		});
		
		$( ".left-arrow" ).click(function() {
			if( rightScroll > 0 ) {
				var width = getActualWidth();
				rightScroll --;
				var selectedID = parseInt($("video.selected").attr("id").replace("video-",""));
				animateSlider(width, !inView(selectedID), $("#video-"+(rightScroll+3)));
			}
			
		});
		
		$(window).resize(function() {
			adjustSlider();
		});
		
		$("video").hover(function(){
			var id = $(this).attr("id").replace("video-","");
			if( inView(id)) {
				changeSelected($("video.selected"), $(this));
			}
			
		}, function(){});
		
		$(document).keyup(function(event) {
			var LEFT_KEY = 37;
			var RIGHT_KEY = 39;
			var ENTER = 13;
			
			if( event.keyCode == LEFT_KEY ) {
				var selectedVideo = $("video.selected"); 
				var selectedID = parseInt(selectedVideo.attr("id").replace("video-",""));

				if( selectedID > 0 ) {
					changeSelected(selectedVideo,$("#video-"+(selectedID-1)) );
					if( !inView(selectedID-1) ) $(".left-arrow").click();
				}
			} else if (event.keyCode == RIGHT_KEY ) {
				var selectedVideo = $("video.selected"); 
				var selectedID = parseInt(selectedVideo.attr("id").replace("video-",""));

				if( selectedID < count-1 ) {
					changeSelected(selectedVideo, $("#video-"+(selectedID+1)) );
					if( !inView(selectedID+1) )$(".right-arrow").click();
				}
			} else if(event.keyCode == ENTER ) {
				$("video.selected").click();
			}
			
		});
	}
	
	//gets floating point width of each video
	function getActualWidth() {
		if( count > 0 ) return $("#vid-slider").width()/count;
		return 0;
	}
	
	//adjusts the left css attribute of video slider
	function adjustSlider() {
		actualWidth = getActualWidth();
		$("#vid-slider").css("left", -1*actualWidth*rightScroll );
	}
	
	//checks if video id(num) is in view.
	//ie. checks if video is on screen
	function inView(num) {
		return rightScroll <= num && num <= rightScroll+3;
	}
	
	function changeSelected(prev, curr) {
		prev.removeClass("selected");
		curr.addClass("selected");
	}
	
	//moves the carousel a certain distance.
	//afterwards, it checks for checkSelectedCondition, if it is true,
	//it changes the selected video into changeSelectedTarget
	function animateSlider(distance, changeSelectedCondition, changeSelectedTarget) {
		$( "#vid-slider" ).animate({
			left: "+="+distance,
		}, 500, function() {
			var selectedVideo = $("video.selected"); 
			var selectedID = selectedVideo.attr("id");
			var number = selectedID.replace("video-", "");
			
			if( changeSelectedCondition ) {
				changeSelected(selectedVideo, changeSelectedTarget);
			}
			adjustSlider();
		});
	}
	
	//calls the setup function
	setup();
	
	
	
	
	
});