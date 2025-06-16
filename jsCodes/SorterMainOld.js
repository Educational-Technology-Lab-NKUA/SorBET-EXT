class Shape {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	// Determine if a point is inside the shape's bounds
	contains(mx, my) {
		// All we have to do is make sure the Mouse X,Y fall in the area between
		// the shape's X and (X + Width) and its Y and (Y + Height)
		return this.x <= mx && this.x + this.w >= mx && this.y <= my && this.y + this.h >= my;
	}

	//determine if a target contains some shape, for correct processing of
	//long text
	containsElement(element) {
		return (
			this.contains(element.x, element.y) ||
			this.contains(element.x + element.w / 2, element.y) ||
			this.contains(element.x + element.w, element.y)
		);
	}

	setImage(img) {
		var image = document.createElement("img");
		image.src = img;
		this.img = image;
	}
}

class ShapeTarget extends Shape {
	constructor(x, y, w, h, fill, text) {
		super(x, y);

		this.fill = fill || "#5F5654";
		let boxImage = "media/imgs/box.png";
		this.setImage(boxImage);
		this.boxImage = this.img;

		this.img.onload = function () {
			//   this.w = this.width; //|| 100;
			// this.h = this.height;// || 100;
		};
		this.img.width = 100;
		this.img.height = 100;
		this.w = w;
		this.h = 120;
		this.type = "target";
		this.text = text;

		this.boxImageRight = document.createElement("img");
		this.boxImageRight.src = "media/imgs/boxRight.png";
		this.boxImageRight.width = 100;
		this.boxImageRight.height = 100;

		this.boxImageWrong = document.createElement("img");
		this.boxImageWrong.src = "media/imgs/boxWrong.png";
		this.boxImageWrong.width = 100;
		this.boxImageWrong.height = 100;
	}

	// Draws this shape to a given context (text + box)
	draw(ctx) {
		//console.log(width);
		ctx.fillStyle = this.fill;
		ctx.font = "20px Helvetica";
		ctx.beginPath();

		ctx.drawImage(this.img, this.x + this.w / 2 - this.img.width / 2, this.y - 20, this.img.width, this.img.height);

		ctx.fillText(this.text, this.x, this.y + 90);

		//ctx.fillRect(this.x, this.y, this.w, this.h);
		ctx.closePath();
	}
}
class ShapeImage extends Shape {
	constructor(x, y, w, h, img, right) {
		super(x, y);
		this.w = w || 50;
		this.h = h || 50;
		//var shape= this;
		this.setImage(img);

		this.type = "element";
		this.right = right;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
		ctx.closePath();
	}
}

class ShapeText extends Shape {
	constructor(x, y, w, fill, right, text) {
		super(x, y);
		this.w = w || 150;
		this.fill = fill || "#5F5654";
		this.type = "element";
		this.right = right;
		this.text = text;
	}

	draw(ctx) {
		this.text=insertSpaces(this.text);
		var measure = ctx.measureText(this.text);
		this.w = measure.width;

		//from stackoverflow to measure text height
		let fontHeight = measure.fontBoundingBoxAscent + measure.fontBoundingBoxDescent;
		let actualHeight = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent;
		this.h = /*actualHeight*/ 30;

		ctx.beginPath();
		ctx.font = "20px Arial";
		ctx.fillStyle = this.fill;

		drawMultilineText(ctx, this.text, this.x, this.y+30, 12, 30);
		//ctx.fillText(this.text, this.x, this.y + 30, this.w);

		//ctx.fill();
		ctx.closePath();

		function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
			var words = text.split(' ');
			var line = '';
			var lines = [];
		
			for (var i = 0; i < words.length; i++) {
				var testLine = line + words[i] + ' ';
				var metrics = ctx.measureText(testLine);
				var testWidth = metrics.width;
		
				if (testWidth > maxWidth && i > 0) {
					lines.push(line);
					line = words[i] + ' ';
				} else {
					line = testLine;
				}
			}
		
			lines.push(line);
		
			for (var j = 0; j < lines.length; j++) {
				ctx.fillText(lines[j], x, y + j * lineHeight);
			}
		}
		function insertSpaces(str) {
			return str.replace(/(.{12})(.{12})/g, '$1\n$2\n');
		}
	}
}

class ShapeRectangle extends Shape {
	constructor(x, y, w, h, fill, right) {
		super(x, y);
		this.w = w || 1;
		this.h = h || 1;
		this.fill = fill || "#AAAAAA";
		this.type = "element";
		this.right = right;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.fill;
		ctx.fillRect(this.x, this.y, this.w, this.h, 0, true);
		ctx.fill();
		ctx.closePath();
	}
}

class ShapeCircle extends Shape {
	constructor(x, y, r, fill, right) {
		super(x, y);
		this.r = r || 1;
		this.fill = fill || "#AAAAAA";
		this.type = "element";
		this.right = right;
	}

	// Draws this shape to a given context (circle)
	draw(ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.fill;
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
		ctx.fill();
		ctx.closePath();
	}

	// vriskw an to shmeio einai mesa ston kuklo
	contains(mx, my) {
		var distancesquared = (mx - this.x) * (mx - this.x) + (my - this.y) * (my - this.y);
		return distancesquared <= this.r * this.r;
	}
}

function SorterGame(canvas, gameObjects, categories, elementsPerRound) {
	// **** First some setup! ****
	this.score = 0;

	 this.faster=this.slower=this.more=this.less=this.percentageDragged=0;
	this.wrong = 0;

	this.addElementTimeouts = []; //gia na mhn vgainoune thn idia stigmh
	this.currentgameObjects = [];
	this.elementsPerRound = elementsPerRound;
	this.gameObjects = gameObjects;
	//this.defaultValues = {right: [],text:"sometext",type: "text",num:1}
	this.defaultValues = {
		right: [],
		text: language.sometext,
		type: "text",
		num: 1,
	};
	this.categories = categories;
	this.playAnswers = [];
	this.defaultColour = "#000000"; //"#72e7ff"
	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;

	this.ctx = canvas.getContext("2d");

	$("canvas").css("background-image", background ? backgroundImage : "none");

	// ctx.textAlign="center"      //* changed!

	this.dataTable = document.getElementById("datatable"); //for the design table
	//this.fields = [{name: "OBJECT"}, {name: "Field1"}, {name: "Field2"}];                                           //for the design table
	this.fields = [
		{
			name: "OBJECT",
		},
		{
			name: language.field1,
		},
		{
			name: language.field2,
		},
	];

	this.idCounter = 0;
	this.dataTableHeader = document.getElementById("datatable").tHead;
	this.images = [];
	this.fieldsCounter = 0;
	this.playing = false;

	/* event logging code */
	this.gameID = 1;
	this.counters = { switchModeCounter: 0, gameOverCounter: 0, sortedObjectsCounter: 0,
						deleteCategoryCounter:0, deleteObjectCounter:0,
						cameraOnCounter:0,voiceCommandsCounter:0,
						blocklyChangeGameplayCounter:0,
						blocklyChangeGameStartCounter:0,
						draggedObjects:0,
						gameStatisticsCounter:0,
						gameStartCounter:0, associateObjectCounter:0,
						modifyCategoryCounter:0, modifyObjectCounter:0
					 }
					
	
	this.switchModeEvent = function (type) {
		if (!fromLaunch) {
			//var time = moment.utc().format("x");
			this.counters.switchModeCounter++;
			var curstate = { value: "playmode", 
				event_count: this.counters.switchModeCounter,
				type:type };

			var feedbackMsg = {
				id: this.gameID,
				type: "database",
				event: "switch_mode",
				state: curstate,
				timestamp: Date.now()
			};
	
			sendEvent(feedbackMsg);
		}
	};

	this.sortedObjectsEvent = function () {
		if (!fromLaunch) {
			//var time = moment.utc().format("x");
			this.counters.sortedObjectsCounter++;
			var fallingObj = { correct: this.score, wrong: this.wrong }; //na allazoun ayta
			var object = { name: "", type: "", times: 0 }; //na allazoun ayta
			var curstate = {
				game_progress: { correct:this.score,wrong:this.wrong },
				event_count: this.counters.sortedObjectsCounter,
			};
			var feedbackMsg = {
				id: this.gameID,
				type: "playmode",
				event: "sorted_objects",
				state: curstate,
				timestamp: Date.now()

			};
	
			sendEvent(feedbackMsg);
		}
	};

	this.clickDragEvent = {
		id: this.gameID,
		type: "playmode",
		event: "clickanddrag",
		state: {
			game_progress: {
				fallingObj: { Classified: this.gameObjects.length-this.currentgameObjects.length, 
					Unclassified: this.currentgameObjects.length, score: this.score },
				Object: { name: "", type: "", times: 0 },
			},
			event_count: 0,
		},
		timestamp: Date.now()

	};
	this.gameOverEvent = function () {
		if (!fromLaunch) {
			//var time = moment.utc().format("x");
			this.counters.gameOverCounter++;
			var fallingObj = { Classified:
					this.gameObjects.length-this.currentgameObjects.length, 
					Unclassified: this.currentgameObjects.length,
					 score: this.score }
			var state = {
				game_progress:   fallingObj ,
				event_count: this.counters.gameOverCounter,
			};
			var feedbackMsg = { id: this.gameID, type: "playmode", 
				event: "game_over", state: state,timestamp: Date.now()
			};
			
			sendEvent(feedbackMsg);
		}
	};

	this.gameStartEvent = function() {
		if (!fromLaunch) { // Assuming 'fromLaunch' is a boolean defined elsewhere
	
		  this.counters.gameStartCounter++; // Increment a counter to track game start events.
	
		  const gameState = { // Capture relevant game state information
			level: this.currentLevel,  // Example: Current level of the game
			score: this.score,         // Example: Starting score
			// Add any other relevant game state information you want to track here.
		  };
	
		  const eventDetails = { // Construct the event message
			id: this.gameID,      // A unique identifier for this game session.
			type: "playmode",      // Classify the event (e.g., playmode, tutorial, etc.)
			event: "game_start",   // The specific event type (game_start, level_up, etc.)
			state: gameState,      // The current game state.
			timestamp: Date.now()   // Timestamp of the event.
		  };
	
		  sendEvent(eventDetails); // Send the event data (assuming 'sendEvent' is a function defined elsewhere).
		}
	  };
	  //todo: add game start to api.js

	this.gameStatisticsEvent = function () {
		if (!fromLaunch) {
			//var time = moment.utc().format("x");
			this.counters.gameStatisticsCounter++;
			var fallingObj = { Correct: this.score,
					Total: this.gameObjects.length, 
				playAnswers:this.getPlayAnswers() }
			var state = {
				game_progress:   fallingObj ,
				event_count: this.counters.gameStatisticsCounter,
			};
			var feedbackMsg = { id: this.gameID, type: "playmode", 
				event: "game_statistics", state: state,
					timestamp: Date.now()
			};
			
			sendEvent(feedbackMsg);
		}
	};

	this.cameraOnEvent = function () {
		if (!fromLaunch) {
			var time = moment.utc().format("x");
			this.counters.cameraOnCounter++;
			var curstate = { value: "camera_on", event_count: this.counters.cameraOnCounter };
			var feedbackMsg = {
				type: "playmode",
				event: "camera_on_event",
				id: this.gameID,
				state: curstate,
				timestamp: Date.now()

			};
	
			sendEvent(feedbackMsg);
		}
	};
	
	this.voiceCommandsEvent = function () {
		if (!fromLaunch) {
			//var time = moment.utc().format("x");
			this.counters.voiceCommandsCounter++;
			var curstate = { game_progress: {faster:this.faster, 
				slower:this.slower,
				 more:this.more,less:this.less} , 
				event_count: this.counters.voiceCommandsCounter };
			var feedbackMsg = {
				type: "playmode",
				event: "voice_commands_event",
				id: this.gameID,
				state: curstate,
				timestamp: Date.now()

			};
	
			sendEvent(feedbackMsg);
		}
	};
	


	//Learning Analytics - design mode events
	//*entryscounter = the number of the column that corresponds to the specific category
	//*idcounter = the number of the row that corresponds to the specific object

	this.editdbID = 1;
	this.modifyCategoryEvent = {
		id: this.editdbID,
		type: "database",
		event: "modify_category",
		timestamp: Date.now(),
		state: { info: { entryscounter: 0 }, 
		name: { old: "Verb", new: "Noun" }, 
		event_count: this.counters.modifyCategoryCounter },
	};
	this.modifyObjectEvent = {
		id: this.editdbID,
		type: "database",
		event: "modify_object",
		state: {
			/*info: {idcounter: 12, type: 'text', times: 5, },
          name: {old: 'running' , new: 'swimming', times: 2},
          type: {old: 'text' , new: 'text', times: 2}},*/
			event_count: this.counters.modifyObjectCounter,
		},
		timestamp: Date.now()

	};
	this.addCategoryEvent = {
		id: this.editdbID,
		type: "database",
		event: "add_category",
		state: { info: {entryscounter: 0},  event_count: 0 },
		timestamp: Date.now()

	};
	this.addObjectEvent = {
		id: this.editdbID,
		type: "database",
		event: "add_object",
		state: {
			/*info: {idcounter: 13, name: 'swimming',
           type: 'text', times: 6},*/
			event_count: 0,
		}, 
		timestamp: Date.now()

	};

	this.deleteCategoryEvent = function (num, name) {
		if (!fromLaunch) {
			//var time = moment.utc().format("x");
			this.counters.deleteCategoryCounter++;
			var curstate = { value: "designmode", event_count:
						 this.counters.deleteCategoryCounter,
						num:num, name:name };
			var feedbackMsg = {
				
				type: "database",
				event: "delete_category",
				id: this.gameID,
				timestamp: Date.now(),
				
				state: curstate,
			};
	
			sendEvent(feedbackMsg);
		}
	} 

		this.deleteObjectEvent = function() {
			if (!fromLaunch) {
				this.counters.deleteObjectCounter++;
				var curstate = {
					event_count: this.counters.deleteObjectCounter
				};
		
				var feedbackMsg = {
					type: "database",
					event: "delete_object",
					id: this.gameID,
					state: curstate,
					timestamp: Date.now()

				};
		
				sendEvent(feedbackMsg);
			}
		};

	this.selectAllObjectsEvent = {
		id: this.editdbID,
		type: "database",
		event: "select_all_objects",
		state: {
			/*info: {idcounter: 13, name:
               'swimming', type: 'text', times: 6},*/
			event_count: 0,
		},
		timestamp: Date.now()

	};
	this.deselectAllObjectsEvent = {
		id: this.editdbID,
		type: "database",
		event: "deselect_all_objects",
		state: {
			/*info: {idcounter: 13, name: 'swimming', type: 'text', times: 6},
      event_count:0*/ event_count: 0,
		},
		timestamp: Date.now()

	};
	this.designActivityEvent = {
		id: this.editdbID,
		type: "database",
		event: "design_activity",
		state: {

			info: {percentage: 0,},
			 event_count: 0,
		},
		timestamp: Date.now()

	 };


	 this.activePlayerEvent = function() {
		// An event that triggers after dragging a certain percentage 
		//of objects (e.g., 70%).
		if (!fromLaunch) {
		
				this.counters.activePlayerCounter++;
				var curstate = {
					percentage: this.percentageDragged,
					event_count: this.counters.activePlayerCounter
				};
	
				var feedbackMsg = {
					type: "player",
					event: "active_player",
					state: curstate,
					id: this.gameID,
					timestamp: Date.now()

				};
	
				sendEvent(feedbackMsg);
			
		}
	};

	// console.log(arguments.callee.toString(), "categories: ",JSON.stringify(categories,null,4));
	//console.log("gameObjects: ",JSON.stringify(gameObjects, null, 4))

	// This complicates things a little but but fixes mouse co-ordinate problems
	// when there's a border or padding. See getMouse for more detail
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
	if (document.defaultView && document.defaultView.getComputedStyle) {
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)["paddingLeft"], 10) || 0;
		this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)["paddingTop"], 10) || 0;
		this.styleBorderLeft =
			parseInt(document.defaultView.getComputedStyle(canvas, null)["borderLeftWidth"], 10) || 0;
		this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)["borderTopWidth"], 10) || 0;
	}
	// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
	// They will mess up mouse coordinates and this fixes that
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;

	// **** Keep track of state! ****

	this.valid = false; // when set to false, the canvas will redraw everything
	this.shapes = []; // the collection of things to be drawn
	this.dragging = []; // Keep track of when we are dragging
	// the current selected object. In the future we could turn this into an array for multiple selection
	this.selection = null;
	this.dragoffx = []; // See mousedown and mousemove events for explanation
	this.dragoffy = 0;

	this.myPalmState = null;
	this.landmarks = null;

	var myState = this;

	if (useCamera) {
		camera.start();
		this.cameraOnEvent();
	}

	canvas.addEventListener(
		"mousemove",
		(e) => {
			if (!myState.playing) return;
			const m = this.getMouse(e);
			this.drag([m]);
		},
		true
	);

	// Allazoyme sta events pointerdown and pointermove gia thn hyopsthrixi ths afhs
	canvas.addEventListener("pointerdown", (e) => this.drag(myState.getMouse(e)), true);

	canvas.addEventListener(
		"mouseup",
		function (e) {
			endDrag();
		},
		true
	);

	//gia na leitoyrgei kai me thn afi dioti mouseup h pointerup den stelnontai
	canvas.addEventListener(
		"touchend",
		function (e) {
			endDrag();
		},
		true
	);

	function endDrag() {
		myState.dragging = [];
		//p.innerText+="\nτο σύρσιμο τελείωσε"
	}

	//fixes a problem where double clicking causes text to get selected on the canvas
	canvas.addEventListener(
		"selectstart",
		function (e) {
			e.preventDefault(); //curious method
			return false;
		},
		false
	);

	myState.createTargets(categories);

	// **** Options! ****
	this.selectionWidth = 2;

	this.d = 50; //50
	this.containerNumber = categories.length;

	
}


SorterGame.prototype.fillGameInstructions = function (val) {
	$("#instructions").html(val);

}

SorterGame.prototype.togglePlayInstructions = function () {
	$("#gameInstructions").toggle();

}

SorterGame.prototype.drag = function (cs) {
	const barwidth = 5;
	const barheight = 50;

	for (var j in cs) {
		//  let [x,y]=[c[i].x, c[i].y];
		const [barx, bary] = [cs[j].x, cs[j].y];

		//ctx.fillStyle = "green";

		var myState = this;
		this.ctx.fillRect(barx - barwidth / 2, bary - barheight / 2, barwidth, barheight);

		/*analytics:
        //3)Όταν ο παίκτης πατά START και ξεκινούν να πέφτουν αντικείμενα,
        να φαίνεται το αν κάνει κλικ και μετακινεί όλα τα αντικείμενα
        ή μένει αδρανής και τα αφήνει να πέφτουν στην προκαθορισμένη θέση τους.
        (συχνότητα click & drag): myState.dragging - mousemove/mouseup

        Εδώ είναι όταν σύρει, mousemove.
        */
		//console.log("μετακινεί, σύρει, mousemove")

		var shapes = myState.shapes;
		var l = shapes.length;

		let barpoints = [];
		for (let step = 0; step <= barheight; step += barheight / 5)
			barpoints.push([barx, bary - barheight / 2 + step]);

		for (var i = l - 1; i >= 0; i--) {
			let mySel = shapes[i];
			if (mySel.type == "target") continue;

			for ([x, y] of barpoints)
				if (mySel.contains(x, y)) {
					myState.ctx.fillStyle = "blue";

					if (myState.dragging[j])
						mySel.x = x - myState.dragoffx[j];
					else {
						// Keep track of where the bar touched the object
						// so we can move it smoothly
						// myState.dragoffy = my - mySel.y;
						myState.dragging[j] = true;
						myState.dragoffx[j] = x - mySel.x;
						myState.selection = mySel;
					}
					myState.valid = false;

					/*
					myState.clickDragEvent.state = {
						...myState.clickDragEvent.state,
						debuginfo:{cs,l, i,},
						game_progress: {
							fallingObj: {
								Classified: myState.classified,
								Unclassified: myState.unclassified,
								score: this.score,
							},
							Object: mySel,
						},
					};
					console.log(myState.dragging, mySel);
					sendEvent(myState.clickDragEvent);

					*/
					var draggedCount = ++this.counters.draggedObjects; // Count of objects dragged by the player
					var totalCount = this.gameObjects.length; // Total number of objects available
					 this.percentageDragged = (draggedCount / totalCount) * 100;
			
					if (this.percentageDragged >= 70) this.activePlayerEvent();

					return;
				}
		}

		// havent returned means we have failed to select anything.
		// If there was an object selected, we deselect it
		if (myState.selection) {
			myState.selection = null;
			myState.valid = false; // Need to clear the old selection border
		}
		myState.dragging[j] = false;
	}
};

SorterGame.prototype.loadPlayMode = function () {
	$("#introArea").hide();
	$("#gameScene").show();
	$("#designArea").hide();
	$("#playButton").hide();
	$("#downloadButton").show();
	$("#editButton").show();
	$("#stopButton").hide();
	$("#startButton").show();

	//changed, have background checkbox appear and disappear too
	$("#backgroundSpan").show();

	$("#gameInstructions").show();

	this.switchModeEvent("play");


};

/* changed! moved this here from designmode.js */
SorterGame.prototype.saveGame = function () {
	//analytics: α)Πόσες κατηγορίες και αντικείμενα προσθέτει και τι είδους (text/image)
	// επιτέλους
	//    δ)Αν έχει επιλέξει όλες τις κατηγορίες σε κάποιο αντικείμενο
	//ε)Αν δεν έχει επιλέξει καμία κατηγορία σε κάποιο αντικείμενο

	//console.log("Event: save game, we can extract game characteristics");
	//console.log(this.dataTable.outerHTML);
	this.playAnswers = [];
	this.categories = [];
	this.gameObjects = [];
	this.dataTableRows = [];
	var gameObjects = [];
	var newgameObjects = [];
	var categories = [];
	var thead = this.dataTableHeader;
	var trsh = thead.getElementsByTagName("tr");
	var tdsh = null;
	tdsh = trsh[0].getElementsByTagName("th");
	if (tdsh != null) {
		for (var m = 1; m < tdsh.length; m++) {
			this.processField(tdsh[m], categories);
		}
	}
	var trs = this.dataTable.getElementsByTagName("tr");
	var tds = null;
	for (var i = 0; i < trs.length; i++) {
		tds = trs[i].getElementsByTagName("td");
		for (var n = 0; n < tds.length; n++) {
			if (n == 0) {
				this.processCel(tds[n], gameObjects);
			} else {
				this.processCorrects(tds[n], gameObjects, n);
			}
		}
	}
	for (var q = 0; q < gameObjects.length; q++) {
		this.dataTableRows.push(gameObjects[q]);
		for (var j = 0; j < gameObjects[q].num; j++) {
			newgameObjects.push(gameObjects[q]);
		}
	}
	//μέσα από gameObjects για να δουμε πόσα αντικείμενα έχει
	// κάθε κατηγορία για τα συμβάντα select all/deselect all
	categories.forEach((c) => (c.nObjects = 0));
	gameObjects.forEach((go) => {
		go.right.forEach((i) => {
			categories[i - 1].nObjects++;
		});
	});
	const myState = this;
	categories.forEach((c, i) => {
		myState.selectAllObjectsEvent.state.entryscounter = i;
		myState.deselectAllObjectsEvent.state.entryscounter = i;
		if (c.nObjects == gameObjects.length) 
			sendEvent(myState.selectAllObjectsEvent);
		//else if (c.nObjects == 0) 
			//sendEvent(myState.deselectAllObjectsEvent);

		//but, is it still needed? deselectAllObjects? It seems to be kinda useless
	});
	this.shapes = [];
	this.gameObjects = newgameObjects;
	//  console.log("gameObjects mesa sto design",gameObjects)
	this.categories = categories;
	var playAnswer;
	for (var i = 0; i < categories.length; i++) {
		playAnswer = { category: categories[i].text + ": ", answers: [] };
		this.playAnswers.push(playAnswer);
	}
	playAnswer = { category: language.classUncl, answers: [] };
	this.playAnswers.push(playAnswer);
	this.clear();
	this.createTargets(categories);

	const percentage=(this.addCategoryEvent.state.event_count+
			this.addObjectEvent.state.event_count+
			this.counters.deleteCategoryCounter +
			this.counters.deleteObjectCounter)
					/
					(this.categories.length+this.gameObjects.length);

	this.designActivityEvent = {
		...this.designActivityEvent,
		state: { ...this.designActivityEvent.state, percentage: percentage,
		  },
	  };
	//sendEvent(this.designActivityEvent);

	//todo: question: when to send designActivityEvent?
	//not on the start

	//instructions
    this.instructions = $(".jqte_editor").html()
	this.fillGameInstructions(this.instructions );

};

SorterGame.prototype.start = function () {
	$("#startButton").hide();
	$("#stopButton").show();
	this.score = 0;
	this.currentgameObject = -1;
	this.unusedgameObjects = [];
	//this.interval=30;
	this.playing = true;

	for (var i = 0; i < this.gameObjects.length; i++) {
		this.unusedgameObjects.push(i);
	}
	for (var i = 0; i < this.playAnswers.length; i++) {
		this.playAnswers[i].answers = [];
	}
	this.usedgameObjects = [];

	var myState = this;

	//blockly gamestart code
	// if (!workspaceGamestart) return
	var code = Blockly.JavaScript.workspaceToCode(workspaceGamestart);
	var speed, density;
	try {
		// alert(code);
		eval(code);
	} catch (e) {
		alert(e);
	}
	if (speed) this.d = speed;
	else this.d = 50;
	this.density = 34;
	if (density) this.density = density;
	this.interval = this.d;

	this.intervalid = setInterval(function () {
		myState.draw();
	}, myState.interval);
	//myState.interval

	this.pickManyElements();
	this.updateScore();

	hands.onResults(onHandInput);

	//code that handles palm input
	function onHandInput(results) {
		var fingertips;
		//var myState=this

		if (!useCamera | !results) {
			return;
		}

		myState.landmarks = results.multiHandLandmarks;
		if (!myState.landmarks.length) return;

		//for 2 hands
		myState.landmarks = myState.landmarks.map((lm) =>
			lm.map((lm) => {
				return { x: 1 - lm.x, y: lm.y, z: lm.z };
			})
		);

		//4, 8, 12, 16, 20;
		fingertips = myState.landmarks.map((lm) => [lm[4], lm[8], lm[12], lm[16], lm[20]]);

		//translate into mouse/canvas coordinates...
		const canvasMappedFingertips = fingertips.map((ft) =>
			ft.map((ft) => ({ x: ft.x * myState.ctx.canvas.width, y: ft.y * myState.ctx.canvas.height, z: ft.z }))
		);

		//math number offset sum of dispersion from the middle
		//const deviationX=getStandardDeviation(Array.from(fingertips, (ft)=>ft.x));
		//const deviationY=getStandardDeviation(Array.from(fingertips, (ft)=>ft.y));

		//calculate coordinates
		myState.hc = canvasMappedFingertips.map((cmf) => getHandCoordinates(cmf));

		//check if the palm is closed or open.
		const smallEnough = 0.1;

		// if (deviationX+deviationY <= smallEnough) {
		//if this number is small enough
		//the palm is closed

		if (myState.myPalmState == "open") {
			// drag(hc);
			//  circle.fill='#1E1E75';
		} else if (myState.dragging) {
			//   dragging(hc);
			//  circle.fill='#0E0E75';
		}
		//  myState.myPalmState="closed";

		///} else {
		//the palm is open
		// if ( myState.dragging) endDrag();
		// if (myState.myPalmState=="closed") myState.myPalmState="open"
		/// }

		myState.drag(myState.hc);

		function getHandCoordinates(ft) {
			//ft=fingertips
			return { x: average(Array.from(ft, (ft) => ft.x)), y: average(Array.from(ft, (ft) => ft.y)) };
		}
	}

	//s when to start speech recognition starts
	recognition.start();

	this.gameStartEvent()
};

SorterGame.prototype.stop = function () {
	$("#stopButton").hide();
	$("#startButton").show();
	this.end();
	this.removeElements();
	for (var i = 0; i < this.addElementTimeouts.length; i++) {
		clearTimeout(this.addElementTimeouts[i]);
	}
	

};

const speedStepConst=20

const densityStepConst=5

SorterGame.prototype.IncreaseSpeed = function() {
	this.d+=speedStepConst
	this.faster++//. increase in some way
	
	// Assign the starting value to the field's setValue method
	//blocklySpeedField.setValue(this.d);
}

SorterGame.prototype.DecreaseSpeed = function() {
	this.d-=speedStepConst
	SorterGame.slower++ // . decrease in some way


	// Assign the starting value to the field's setValue method
	//blocklySpeedField.setValue(this.d);
}

SorterGame.prototype.IncreaseDensity = function() {
	this.density+=densityStepConst
	this.more++ // . decrease in some way


	// Assign the starting value to the field's setValue method
	blocklyDensityField.setValue(this.density);
}

SorterGame.prototype.DecreaseDensity = function() {
	this.density-=densityStepConst
	this.less++ // . decrease in some way

	// Assign the starting value to the field's setValue method
	blocklyDensityField.setValue(this.density);
}

SorterGame.prototype.ScoreText = function (x, y, color, text) {
	this.x = x;
	this.y = y;
	this.text = text;
	var ctx = this.ctx;
	//this.score= score;
	ctx.font = this.width + " " + this.height;
	ctx.fillStyle = color;
	ctx.fillText(this.text, this.x, this.y);
};

//Αυτή η λειτουργία διανέμει τα αντικείμενα που πέφτουν κάθε φορά.
//changed!
SorterGame.prototype.pickManyElements = function () {
	//pick gameObject
	var self = this;
	this.totalCurrentgameObjects = 0;
	this.currentgameObjects = [];
	this.removeElements();

	const plafon = Math.min(this.elementsPerRound, this.unusedgameObjects.length);
	const oldValue = getRandNumber(plafon) + 1;
	const newValue = (this.density / 100) * this.gameObjects.length;

	for (var i = 0; i < newValue; i++) {
		//an menoun ligotera apo osa exei kanei pick tha parei tosa osa prepei
		var unusedgameObject = getRandNumber(this.unusedgameObjects.length);
		var currentgameObject = this.unusedgameObjects[unusedgameObject];
		this.currentgameObjects.push(currentgameObject);
		this.unusedgameObjects.splice(unusedgameObject, 1);
		this.usedgameObjects.push(this.currentgameObject);
	}

	function addElementClosure(gameObject, gameObject_i) {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
		return function () {
			self.addElement(gameObject, gameObject_i);
		};
	}

	for (var j = 0; j < this.currentgameObjects.length; j++) {
		//drawing gameObject
		var gameObject = this.gameObjects[this.currentgameObjects[j]];
		if (gameObject)
			this.addElementTimeouts.push(setTimeout(addElementClosure(gameObject, j), 1500 * j)); //cancel to timeout
		//console.log("gameObject sto pickmnay",gameObject);
	}
};

SorterGame.prototype.addShape = function (shape) {
	this.shapes.push(shape);
	this.valid = false;
	//return shapes
};

SorterGame.prototype.createTargets = function (categories) {
	var zones = categories.length * 2 + 1;
	var zoneSize = this.width / zones;
	for (var z = 0; z < categories.length; z += 1) {
		this.addShape(
			new ShapeTarget((1 + z * 2) * zoneSize, 505, zoneSize, 20, this.defaultColour, categories[z].text)
		);
	} //260
};

//dhmiourgia addelement gia na ftiaxnoume to gameObject
SorterGame.prototype.addElement = function (gameObject, gameObject_i) {
	var canvas = this.canvas;
	var shape = null;

	//what if gameObject.type=shape? from preloaded.js
	switch (gameObject.type) {
		case "circle":
			shape = new ShapeCircle(getRandNumber(canvas.width - 20) + 10, 10, 10, "#1E1E75", gameObject.right);
			break;

		case "text":
			shape = new ShapeText(
				getRandNumber(canvas.width - 100),
				10,
				canvas.width * 0.2,
				"#5F5654",
				gameObject.right,
				gameObject.text
			);
			break;

		case "rectangle":
			shape = new ShapeRectangle(getRandNumber(canvas.width - 20) + 10, 10, 60, 20, "#1E1E75", gameObject.right);
			break;

		case "image":
			var image = new Image();
			var w, h, maxWidth, maxHeight;
			maxWidth = canvas.width * 0.10;
			maxHeight = canvas.height * 0.2;
			image.src = gameObject.img;
			h = image.height;
			w = image.width;
			if (h > maxHeight) {
				h = h * Math.min(maxHeight / h);
			}
			if (w > maxWidth) {
				w = w * Math.min(maxWidth / w);
			}
			shape = new ShapeImage(getRandNumber(canvas.width - 100), 10, w, h, gameObject.img, gameObject.right);
			break;

		default:
			return;
	}

	//console.log(gameObject.type, gameObject, shape);
	shape.gameObject_i = gameObject_i;
	this.addShape(shape); //gia na min einai sta oria
};

SorterGame.prototype.removeElement = function (gameObject_i) {
	for (var i = 0; i < this.shapes.length; i++) {
		if (this.shapes[i].type == "element" && gameObject_i == this.shapes[i].gameObject_i) {
			this.shapes.splice(i, 1);
			break;
		}
	}
};
SorterGame.prototype.removeElements = function () {
	var i = this.shapes.length;
	while (i--) {
		if (this.shapes[i].type == "element") {
			this.shapes.splice(i, 1);
		}
	}
};

SorterGame.prototype.checkRoundEnd = function () {
	if (this.totalCurrentgameObjects == this.currentgameObjects.length) {
		//edw elegxoume an exei teleiwsei to paixnidi
		if (this.unusedgameObjects.length > 0) {
			//edw elegxoume an exei teleiwsei o guros
			// this.interval=this.interval*2;
			//auksanoume thn taxuthta se kathe guro
			this.pickManyElements();
		} else {
			this.end();
		}
	}
};


//This is where we check if an element hits a correct or wrong target
// and react. 
// ** changed enough
SorterGame.prototype.checkElementTarget = function (element) {
	var mystate = this;
	var shapes = this.shapes;
	//this scope magia
	var l = shapes.length;
	var proceed = false;
	if (element.finish) {
		//clears animation
		return;
	}

	if (element.outOfBounds ) {
		//object out of bounds = missed object
		element.finish = true;
		var length = this.playAnswers.length;
		if (element.img != undefined) {
	//		this.playAnswers[length - 1].answers.push({ type: "img", uri: element.img.currentSrc, correct: false });

	
			// Check if an element with a specific URI already exists in the answers array
			const uriExists = this.playAnswers[length - 1].answers.some(answer => answer.type === "img" && answer.uri === element.img.currentSrc);
			
			// If the URI doesn't exist, add a new element to the answers array
			//if (!uriExists) {
				this.playAnswers[length - 1].answers.push({ type: "img", uri: element.img.currentSrc, correct: false });
			//}

		} else {
			//this.playAnswers[length - 1].answers.push({ type: "text", text: element.text, correct: false });
	
			// Check if an element with a specific URI already exists in the answers array
			const uriExists = this.playAnswers[length - 1].answers.some(answer => answer.type === "text" && answer.text === element.text);
					
			// If the URI doesn't exist, add a new element to the answers array
			//if (!uriExists) {
				this.playAnswers[length - 1].answers.push({ type: "text", text: element.text, correct: false });
			//}
		}
		this.totalCurrentgameObjects++;
		this.checkRoundEnd();
		return;
	}

	for (var i = l - 1; i >= 0; i--) {
		var myTarget = shapes[i];

		if (myTarget.type == "element") {
			//mySel = mouse target
			continue;
		}
		let correctness;

		//if (myTarget.contains(element.x, element.y)) {
		//allazoyme auto edw gia na diorthwthoun ta makra keimena
		if (myTarget.containsElement(element)) {
			//analytics:
			// κατά τη διάρκεια του παιχνιδιού ίσως το count των πράσινων 
			// ή κόκκινων κουτιών (right array)
			for (var k = 0; k <= element.right.length; k++) {
				
				if (element.right[k] == i + 1) {
					//i = rand value
					//hits the right target
					correctness = true;

					//this.removeElement(element.gameObject_i);

					this.score++;
					
					this.updateScore();
					setTimeout(restoreTarget, 1000);

					this.sortedObjectsEvent()
					// "Hitting a right target");
					

					myTarget.fill = "#00e600";
					myTarget.img = myTarget.boxImageRight;
					//this.correct++;

					break;

				} 


			}

			if (!correctness)	{
				// wrong target
				
				this.wrong++;
				this.sortedObjectsEvent()// "Hitting a wrong target");
				
				//this.sortedObjectsEvent("wrong");

				myTarget.fill = "#CC0000";
				myTarget.img = myTarget.boxImageWrong;
				correctness = false;
			
				setTimeout(restoreTarget, 1000);
			}
				

			//adding element to the  "answers" array, with correctness
			if (element.img != undefined) {

				// Check if an element with a specific URI already exists in the answers array
				//const uriExists = this.playAnswers[i].answers.some(answer => answer.type === "img" && answer.uri === element.img.currentSrc);
				
				// If the URI doesn't exist, add a new element to the answers array
				//if (!uriExists) 
					
					this.playAnswers[i].answers.push({
						type: "img",
						uri: element.img.currentSrc,
						correct: correctness,
					});
			} else {
				//const uriExists = this.playAnswers[i].answers.some(answer => answer.type === "text" && answer.text === element.text);
				
				// If the URI doesn't exist, add a new element to the answers array
				//if (!uriExists) 
					this.playAnswers[i].answers.push({ type: "text", text: element.text, correct: correctness });
			}
			//if (correctness) return;

			function restoreTarget() {
				myTarget.fill = mystate.defaultColour;
				myTarget.img = myTarget.boxImage;
				// console.log(mystate.totalCurrentgameObjects,mystate.currentgameObjects.length);
				mystate.checkRoundEnd();
			}

			element.finish = true;
			this.totalCurrentgameObjects++;
			return;
		}
	}
	
};

SorterGame.prototype.updateScore = function () {
	document.getElementById("score").innerHTML = this.score + "/" + this.gameObjects.length;
};

SorterGame.prototype.clear = function () {
	//this.canvas.width = this.canvas.width;
	// Store the current transformation matrix
	// Use the identity matrix while clearing the canvas
	this.ctx.clearRect(0, 0, this.width, this.height);
};

SorterGame.prototype.end = function () {
	//analytics: 5)Τα δεδομένα από τον τερματισμό του παιχνιδιού - Σκορ
	this.gameOverEvent();

	//this.sortedObjectsEvent();
	//increase correct and wirng counters on the fly
	this.voiceCommandsEvent()
	this.gameStatisticsEvent()
	/*
	game_statistics
When the game ends, or user clicks sotp the game,
 the program send statistic of the game to LA as json object 
By statistics I mean the final "score" of the game each time it ends
For example the information as they appear here in the score and
 statistics board. Whatever is easier as structure for something like that
 */

	var playAnswersTable = document.getElementById("playAnswersTable").tBodies;
	var scoreModal = document.getElementById("score-modal");
	var newRow, newCell, text, answer;

	clearInterval(this.intervalid);
	this.playing = false;

	$("#gameOverModal").show();
	$("#stopButton").hide();
	$("#startButton").show();
	this.removeElements();
	for (var i = 0; i < this.addElementTimeouts.length; i++) {
		clearTimeout(this.addElementTimeouts[i]);
	}

//remove duplicates from playAnswers. thanks you chatgpt
	this.playAnswers=this.playAnswers.map((category)=>{
// Assuming playAnswers is your array containing objects with duplicate entries

		// Step 1: Convert the array to a Set to remove duplicates based on object references
		const uniqueSet = new Set(category.answers.map(JSON.stringify));

		// Step 2: Convert the Set back to an array while parsing the objects back from string
		category.answers=Array.from(uniqueSet).map(JSON.parse);

		return category;

	});
	

	
	// uniqueArray now contains the array playAnswers without duplicate objects


	//text = "Correct: " + this.score + " out of " + this.gameObjects.length;
	text = [language.correct, this.score, language.outof, this.gameObjects.length].join(" ");

	scoreModal.innerHTML = text;
	text = "";
	if (playAnswersTable.length > 0) {
		var tableRows = playAnswersTable[0].rows;
		if (tableRows.length > 0) {
			for (var i = tableRows.length - 1; i >= 0; i--) {
				playAnswersTable[0].deleteRow(i);
			}
		}
	}

	for (var i = 0; i < this.playAnswers.length; i++) {
		newRow = playAnswersTable[0].insertRow(i);
		newCell = newRow.insertCell(0);
		newCell.innerHTML = this.playAnswers[i].category;
		newCell = newRow.insertCell(1);
		text = "";
		for (var j = 0; j < this.playAnswers[i].answers.length; j++) {
			if (this.playAnswers[i].answers[j].type == "text") {
				text = "    " + this.playAnswers[i].answers[j].text;
				newCell.innerHTML += text;
			} else {
				thumbnail = document.createElement("img");
				thumbnail.src = this.playAnswers[i].answers[j].uri;
				thumbnail.style.width = "40px";
				thumbnail.style.height = "40px";
				newCell.appendChild(thumbnail);
			}
			newCell.innerHTML += " " + this.playAnswers[i].answers[j].correct;
		}
	}

	//when to stop recognition, now it's time to stop
	recognition.stop();
};

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
SorterGame.prototype.draw = function () {
	//edw mesw tou x,y orizoume tin kinisi
	// if our state is invalid, redraw and validate!

	//let's run blockly code here
	//apply speed and density from blockly
	if (workspaceGameplay) {
		var code = Blockly.JavaScript.workspaceToCode(workspaceGameplay);

		var score = this.score,
			density = this.density,
			speed = this.d;
		try {
			//alert(code);
			eval(code);
		} catch (e) {
			alert(e);
		}

		if (speed) this.d = speed;
		if (density) this.density = density;
	}

	var ctx = this.ctx;
	this.clear();

	// ** Add stuff you want drawn in the background all the time here **

	//draw the koukida here.
	hc = this.hc;
	if (hc)
		hc.forEach((hc) => {
			let circle = new ShapeCircle(hc.x, hc.y, 10, "#cacaca");
			circle.draw(ctx);
		});

	if (this.landmarks && useCamera) {
		this.landmarks.map((lm) => {
			drawConnectors(ctx, lm, HAND_CONNECTIONS, {
				color: "#e0e0e0",
				lineWidth: 5,
			});
			drawLandmarks(ctx, lm, {
				color: "#ababab",
				lineWidth: 2,
			});
		});
	}

	// draw all shapes
	var l = this.shapes.length;
	for (var i = 0; i < l; i++) {
		var shape = this.shapes[i];
		// We can skip the drawing of elements that have moved off the screen:
		if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0) {
			shape.outOfBounds = true;
		}
		if (shape.type == "element") {
			//  if((this.selection!=null)&&(this.selection.gameObject_i == shape.gameObject_i)) { uncomment an theloume na stamataei h kinhsh tou selected element
			//   if (!this.dragging) {
			shape.y += (this.d / 1000) * this.interval;
			this.valid = false;

			//   }
			//  }
			this.checkElementTarget(shape);
		}
		//console.log("draw:", shape);

		shape.draw(ctx);
	}

	this.valid = true;
};

SorterGame.prototype.getMouse = function (e) {
	var element = this.canvas,
		offsetX = 0,
		offsetY = 0,
		mx,
		my;
	//alert(2);

	// Compute the total offset
	if (element.offsetParent !== undefined) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		} while ((element = element.offsetParent));
	}

	// Add padding and border style widths to offset
	// Also add the <html> offsets in case there's a position:fixed bar
	offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
	offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

	mx = e.pageX - offsetX;
	my = e.pageY - offsetY;

	// We return a simple javascript object (a hash) with x and y defined
	return { x: mx, y: my };
};

//changed here to accomodate gameStatistics event
SorterGame.prototype.getPlayAnswers = function () {

	playAnswers=this.playAnswers.map((answer)=>Object.values(answer));
    playAnswers=playAnswers.map((answer)=>{answer[1]=answer[1].map((obj)=>{
        if(obj.type =="text"){
            return([ obj.text, obj.correct.toString()]);
          }
          else {
            /*thumbnail = document.createElement("img");
            thumbnail.src = this.playAnswers[i].answers[j].uri;
            thumbnail.style.width = "40px"
            thumbnail.style.height = "40px"
            */
           return (([{image:obj.uri,
                width:90, height:90}, obj.correct.toString()]))
          }
    }); return answer});
    playAnswers.unshift([language.category, language.classifObj]);

	return playAnswers;
};

SorterGame.prototype.getState = function () {
	//Καλείται από το αρχείο API.js όταν ο χρήστης πατήσει το κουμπί Save σε μια δραστηριότητα του SorBET στην πλατφόρμα SMILE. Πρέπει να παρεις την τρεχουσα κατασταση σε ενα JSON και να τη στειλεις στην πλατφόρμα. Το JSON είναι ιδιο με οταν αποθηκευει τοπικά ενα αρχείο
	var state = getCurrentState(); //see states.js file
	return state;
};

SorterGame.prototype.setState = function (data) {
	//Καλείται από το αρχείο API.js όταν μια δραστηριότητα SorBET φορτών στην πλατφόρμα SmILE. Η μεταβλητή data έχει το state της δραστηριοτητας οταν εγινε αποθηκευση σε μορφή JSON

	this.state = data;
	try {
		handleState(data); //TODO:Να διαβάζει το JSON (data) που το στελνει και να δημιουργεί το παιχνιδι. Η μεταβλητή json ειναι αντιστοιη με αυτή που αποθηκευει οταν κανεις τοπικη αποθηκευση αρα ακολουθεις την ιδια διαδικασία
	} catch (error) {
		console.log(error + " Could not load state:" + data);
	}

	return "SORBET SET STATE: OK";
};
