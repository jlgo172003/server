$(document).ready(function(){
	var hostname = "http://localhost:3000";
	
	//Handles Recently Viewed
	var list = {};
	function getName() {
		return new Fingerprint().get();
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
		console.log( list[title] );
		if( list[title] == undefined) {
			var recentCount = $("#watched ul > li").length;
			toAdd = "";
			toAdd += "<li class=\"bg"+(recentCount%2)+"\">";
			toAdd += 	"<div class=\"fa fa-eye left\"></div>";
			toAdd += 	"<p class=\"left\">"+title+"</p>";
			toAdd += 	"<div class=\"clearfix\"></div>";
			toAdd += "</li>";
			$("#watched ul").append(toAdd);
			list[title] = 1;
		}
		console.log( list[title] );
	}
	
	function addRecentlyViewed(video) {
		var title = $(video).attr("title");
		var name = getName();
		postJSON(name, title);
		addRecentlyViewedEntry(title); 
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
			}
		});
	}
	populateRecentlyViewed();
	
	//Handles Video Carousel
    var rightScroll = 0.0;
	var count = 0;
	
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
		
		$("#vid-slider").css("width", count*25+"%");
		$(".video-set").css("width", ((1/count)*100)+"%");
		
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
		$('#vid-slider video').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function(e) {
			var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
			if( !state ) {
				var vid = $(this).get(0);
				vid.pause();
			}
			
		});
	}
	
	function getActualWidth() {
		if( count > 0 ) return $("#vid-slider").width()/count;
		return 0;
	}
	
	function adjustSlider() {
		actualWidth = getActualWidth();
		$("#vid-slider").css("left", -1*actualWidth*rightScroll );
	}
	
	function inView(num) {
		return rightScroll <= num && num <= rightScroll+3;
	}
	
	setup();
	$( ".right-arrow" ).click(function() {
		
		if(rightScroll+4 < count ) {
			var width = getActualWidth();
			rightScroll ++;
			$( "#vid-slider" ).animate({
				left: "-="+width,
			}, 500, function() {
				selectedVideo = $("video.selected"); 
				selectedID = selectedVideo.attr("id");
				number = selectedID.replace("video-", "");
				if( !inView(number) ) {
					selectedVideo.removeClass("selected");
					$("#video-"+rightScroll).addClass("selected");
				}
				adjustSlider();
			});
		}
		
	});
	
	$( ".left-arrow" ).click(function() {
		if( rightScroll > 0 ) {
			var width = getActualWidth();
			rightScroll --;
			$( "#vid-slider" ).animate({
				left: "+="+width,
			}, 500, function() {
				selectedVideo = $("video.selected"); 
				selectedID = selectedVideo.attr("id");
				number = selectedID.replace("video-", "");
				if( !inView(number) ) {
					selectedVideo.removeClass("selected");
					$("#video-"+(rightScroll+3)).addClass("selected");
				}
				adjustSlider();
			});
		}
		
	});
	
	$(window).resize(function() {
		adjustSlider();
	});
	
	$("video").hover(function(){
		$("video.selected").removeClass("selected");
		$(this).addClass("selected");
	}, function(){});
	
	$(document).keyup(function(event) {
		LEFT_KEY = 37;
		RIGHT_KEY = 39;
		ENTER = 13;
		
		if( event.keyCode == LEFT_KEY ) {
			selectedVideo = $("video.selected"); 
			selectedID = parseInt(selectedVideo.attr("id").replace("video-",""));

			if( selectedID > 0 ) {
				selectedVideo.removeClass("selected");
				$("#video-"+(selectedID-1)).addClass("selected");
				if( !inView(selectedID-1) ) $(".left-arrow").click();
			}
		} else if (event.keyCode == RIGHT_KEY ) {
			selectedVideo = $("video.selected"); 
			selectedID = parseInt(selectedVideo.attr("id").replace("video-",""));

			if( selectedID < count-1 ) {
				selectedVideo.removeClass("selected");
				$("#video-"+(selectedID+1)).addClass("selected");
				if( !inView(selectedID+1) )$(".right-arrow").click();
			}
		} else if(event.keyCode == ENTER ) {
			$("video.selected").click();
		}
		
	});
	
	
	
});