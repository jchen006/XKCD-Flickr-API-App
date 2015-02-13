//Style initializers
var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');
var whiteSkin = new Skin({fill:"white"});
var titleStyle = new Style({font:"bold 70px", color:"black"});
var buttonStyle = new Style({font:"35px", color:"black"}); //Have to change the size 

//Variable declarations
var API_KEY = "ef180bd4d6922fb2e60e2c1fb72de6b2";
var search = "";
var current_comic = 1; 
var last_comic;
var safe_title = "";
var image = "";

//Column declarations
var mainColumn = new Column({
	left: 0, right: 0, top: 0, bottom: 0,
	skin: whiteSkin,
	contents:[
		new Label({left: 0, right: 0, height: 90, string: "XKCD Comic #" + current_comic, style: titleStyle, name: "title"}),
		new Picture({left:160, right:160, top:0, bottom:10, url: "", name: "picture"}), 
	]
});

//Next Button
var nextButtonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}

nextButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(button){
		trace("Next Clicked\n");
		application.invoke(new Message("/getNextXKCD"));
	}}
});

var myNextButtonTemplate = BUTTONS.Button.template(function($){ return{
	top:50, height:50, width: 100, right:50,
	contents:[
		new Label({left:10, height:10, string:$.textForLabel, style:buttonStyle})
	],
	behavior: new nextButtonBehavior
}});

//Back Button
var backButtonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}

backButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(button){
		trace("Back Clicked\n");
		application.invoke(new Message("/getBackXKCD"));
	}}
});

var myBackButtonTemplate = BUTTONS.Button.template(function($){ return{
	top:50, height:50, width: 100, left:30,
	contents:[
		new Label({left:10, height:10, string:$.textForLabel, style:buttonStyle})
	],
	behavior: new backButtonBehavior
}});

//Flickr Button
var flickrButtonBehavior = function(content, data){
	BUTTONS.ButtonBehavior.call(this, content, data);
}

flickrButtonBehavior.prototype = Object.create(BUTTONS.ButtonBehavior.prototype, {
	onTap: { value:  function(button){
		trace("Flickr\n");
		application.invoke(new Message("/getFlickr"));
	}}
});

var myflickrButtonTemplate = BUTTONS.Button.template(function($){ return{
	top:110, height:50, width: 100, left:30,
	contents:[
		new Label({left:10, height:10, string:$.textForLabel, style:buttonStyle})
	],
	behavior: new flickrButtonBehavior
}});


//Most Recent XKCD API Call
Handler.bind("/getRecentXKCD", {
	onInvoke: function(handler, message){
		var recent_xkcd_call = "http://xkcd.com/info.0.json";
		handler.invoke(new Message(recent_xkcd_call), Message.JSON);
	},
	onComplete: function(handler, message, json){
		search = searchConversion(json.safe_title);
		image = json.img;
		current_comic = json.num;
		last_comic = json.num;
		trace("Image updated: " + image + "\n");
		mainColumn.picture.url = image;
		mainColumn.title.string = "XKCD Comic #" + current_comic;
		trace("Returned Title is: " + json.safe_title + "\n");
	}
});

//XKCD Next API Call
Handler.bind("/getNextXKCD", {
	onInvoke: function(handler, message){
		if(current_comic != last_comic) {
			current_comic = current_comic + 1;
			var current_xkcd_call = "http://xkcd.com/" + current_comic+"/info.0.json";
		} else {
			var current_xkcd_call = "http://xkcd.com/" + current_comic+"/info.0.json";
		}
		handler.invoke(new Message(current_xkcd_call), Message.JSON);
	},
	onComplete: function(handler, message, json){
		search = searchConversion(json.safe_title);
		image = json.img;
		trace("Image updated: " + image + "\n");
		mainColumn.picture.url = image;
		mainColumn.title.string = "XKCD Comic #" + current_comic;
		trace("Returned Title is: " + json.safe_title + "\n");
	}
});

//XKCD Back API Call
Handler.bind("/getBackXKCD", {
	onInvoke: function(handler, message){
		if(current_comic!=1) {
			current_comic = current_comic - 1;
			var current_xkcd_call = "http://xkcd.com/" + current_comic+"/info.0.json";
		} else {
			var current_xkcd_call = "http://xkcd.com/" + current_comic+"/info.0.json";
		}
		handler.invoke(new Message(current_xkcd_call), Message.JSON);
	},
	onComplete: function(handler, message, json){
		search = searchConversion(json.safe_title);
		image = json.img;
		trace("Image updated: " + image + "\n");
		mainColumn.picture.url = image;
		mainColumn.title.string = "XKCD Comic #" + current_comic;
		trace("Returned Title is: " + json.safe_title + "\n");
	}
});

//Flickr API Call 
Handler.bind("/getFlickr", {
	onInvoke: function(handler, message){
		var flickr_call = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + API_KEY + "&text=" + search + "&format=json&nojsoncallback=1";
		trace("Search: " + search + " Flickr Call: " + flickr_call + "\n");
		handler.invoke(new Message(flickr_call), Message.JSON);
	},
	onComplete: function(handler, message, json){
		var randomPhoto = Math.round(Math.random() * 100)
		trace("Random num: " + randomPhoto + "\n");
		var farm = json.photos.photo[randomPhoto].farm;
		var server = json.photos.photo[randomPhoto].server;
		var id = json.photos.photo[randomPhoto].id;
		var secret = json.photos.photo[randomPhoto].secret;
		var pic = "http://c4.staticflickr.com/" + farm +"/"+server+"/"+id+"_"+secret+"_n.jpg";
		mainColumn.picture.url = pic;
		trace("Returned Total is: " + pic + "\n");
	}
});

//Converts search into RESTful API format
function searchConversion(safe_title) {
	var search = "";
	var wordList = safe_title.split(" ");
	if(wordList.length == 1) {
		return safe_title;
	} else {
		trace("Updating format\n")
		var search = wordList[0];
		for(i = 1; i < wordList.length; i++) {
			search = search + "+" + wordList[i];
		}
		return search;
	}
}

//Intializations for the app
var nextButton = new myNextButtonTemplate({textForLabel:"Next"});
var backButton = new myBackButtonTemplate({textForLabel:"Back"});
var flickrButton = new myflickrButtonTemplate({textForLabel:"Flickr"});

application.behavior = Object.create(Behavior.prototype, {	
	onLaunch: { value: function(application, data){
		application.add(mainColumn);
		application.add(nextButton);
		application.add(backButton);
		application.add(flickrButton);
		application.invoke(new Message("/getRecentXKCD"));
	}}
});
