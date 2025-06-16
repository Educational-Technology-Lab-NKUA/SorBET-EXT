var camera;
var workspaceGamestart, workspaceGameplay, workspaceGameover;

//One philosophical saying goes,
//"Entities should not be multiplied beyond neccesity".

var blocklySpeedField, blocklyDensityField

$(document).ready(function () {
	var canvas = document.getElementById("myCanvas");
	var categories = [];
	var gameObjects = [];
	var elementPerRound = 20;
	fromLaunch = false;

	//camera
	camera = new Camera(videoElement, {
		onFrame: async () => {
			await hands.send({ image: videoElement });
		},
		width: 1280,
		height: 720,
	});

	//** changed! */
	//camera.start();
	SorterGame = new SorterGame(canvas, gameObjects, categories, elementPerRound);

	//event handling codes
	//setUpCommunication(SorterGame);
	//sendReady();

	//design mode functon
	
	loadIntro();
	eventListeners(SorterGame);
	$('[data-toggle="tooltip"]').tooltip();

	//blockly
	/*
    To "on game start" που είχαμε στην αρχή που θα αρχικοποιει
    τα πεδία  speed και ίσως το score, αν και θα ναι by default 0
	Και το gameplay που θα περιέχει τα conditions
	"if.. Do.." τα variables και μια εντολή game over

    */
	/* TODO: Change toolbox XML ID if necessary. Can export toolbox XML from Workspace Factory. */
	// var toolbox = document.getElementById("toolboxGamestart");

	blocklyZoomParams = { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 };
	//
	var options = {
		// toolbox : toolboxXml,
		collapse: true,
		comments: true,
		disable: true,
		maxBlocks: Infinity,
		trashcan: true,
		horizontalLayout: false,
		toolboxPosition: "start",
		css: true,
		media: "https://blockly-demo.appspot.com/static/media/",

		scrollbars: true,
		sounds: true,
		oneBasedIndex: true,
		grid: {
			spacing: 20,
			length: 1,
			colour: "#888",
			snap: false,
		},
		zoom: blocklyZoomParams /* {
        controls : true,
        wheel : true,
        startScale : 1,
        maxScale : 3,
        minScale : 0.3,
        scaleSpeed : 1.2
      } */,
	};

	const wsXmlGSPath = "https://raw.githubusercontent.com/hermolaou/blocklyxml/main/workspaceGamestart.xml";
	const toolboxXmlGSPath = "https://raw.githubusercontent.com/hermolaou/blocklyxml/main/toolboxGamestart.xml";

	loadXml(wsXmlGSPath).then((workspaceXml) => {
		loadXml(toolboxXmlGSPath).then((toolboxXml) => {
			options.toolbox = toolboxXml;
			/* Inject your workspace */
			workspaceGamestart = Blockly.inject(
				blocklyDivGamestart,
				/* TODO: Add ID of div to inject Blockly into */ options
			);

			/* Load Workspace Blocks from XML to workspace. Remove all code below if no blocks to load */

			/* Load blocks to workspace. */
			Blockly.Xml.domToWorkspace(workspaceXml, workspaceGamestart);

			// αποκατάσταση προηγούμενης κατάστασης
			var jsonGs;
			if ((jsonGs = localStorage.getItem("jsongs")))
				//Blockly.serialization.workspaces.load(JSON.parse(jsonGs));
				1;

			//To set a starting value for a numeric field in Blockly library 
			//with JavaScript, you will need to create a variable 
			//for the starting value and assign it to the field's 
			//`setValue` method. Here's an example:

			var startingValue = 25; // This is the starting value you want to set

			// Get the block where you want to set the numeric field
			var block = workspaceGamestart.getBlockById("72Mpj7OZBorz%=_pv{f^");

			// Get the numeric field within the block
			blocklySpeedField = block.getField("NUM");

			// Assign the starting value to the field's setValue method
			blocklySpeedField.setValue(startingValue);


			// Get the block where you want to set the numeric field
			block = workspaceGamestart.getBlockById("`G^Yg+5BU6%)0D2ilXo5");

			// Get the numeric field within the block
			blocklyDensityField = block.getField("NUM");

			// Assign the starting value to the field's setValue method
			blocklyDensityField.setValue(20);

			//You can adjust the `startingValue` variable to the value you want the numeric field to start with. Also, make sure you have already included the Blockly library and have created a workspace to which you can add the field.
		});
	});

	const wsXmlGPPath = "https://raw.githubusercontent.com/hermolaou/blocklyxml/main/workspaceGameplay.xml";
	const toolboxXmlGPPath = "https://raw.githubusercontent.com/hermolaou/blocklyxml/main/toolboxGameplay.xml";

	loadXml(wsXmlGPPath).then((workspaceXml) => {
		loadXml(toolboxXmlGPPath).then((toolboxXml) => {
			options.toolbox = toolboxXml;
			/* Inject your workspace */
			workspaceGameplay = Blockly.inject(
				blocklyDivGameplay,
				/* TODO: Add ID of div to inject Blockly into */ options
			);

			/* Load Workspace Blocks from XML to workspace. Remove all code below if no blocks to load */

			/* Load blocks to workspace. */
			Blockly.Xml.domToWorkspace(workspaceXml, workspaceGameplay);

			//apokatastasi tis prohgoymenhs katastasis.
			var jsonGp;
			if ((jsonGp = localStorage.getItem("jsongp")))
				// Blockly.serialization.workspaces.load(JSON.parse(jsonGp));
				1;

			checkUrl(); //gia na arxisei to paixnidi
		});
	});

	//έχουμε ένα πρόβλημα: σε περίπτωση xml δε φορτωθεί,
	// το παιχνίδι δε θα αρχίσει, αλλά αν βάλουμε την εντολή
	// της έναρξης εδώ θα αρχίσει νωρίς.


});

//var workspace = Blockly.inject('blocklyDiv', {});
//var block = workspace.newBlock('math_number');
//block.setFieldValue('10', 'NUM');
//block.appendValueInput('INPUT_NAME').appendField(block, 'INPUT_NAME');
// var toolbox = {
//     "kind": "flyoutToolbox",
//     "contents": [
//       {
//         "kind": "block",
//         "type": "controls_if"
//       },
//       {
//         "kind": "block",
//         "type": "controls_whileUntil"
//       }
//     ]
//   };
// var workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
//var workspace = Blockly.inject('blocklyDiv', {
//  toolbox: `<block type="math_number"> <field name="NUM">10</field> </block>`
//});

//hand detection setup

const hands = new Hands({
	locateFile: (file) => {
		return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
	},
});
hands.setOptions({
	maxNumHands: 2,
	modelComplexity: 1,
	minDetectionConfidence: 0.5,
	minTrackingConfidence: 0.5,
});

function checkUrl() {
	var filename = window.location.href.split("?");
	if (filename.length > 1) {
		openOnlineExample(filename[1]);
	}
}

const backgroundImage = 'url("media/imgs/color-minimal-back.jpg")';
const background = localStorage.getItem("background") == "true" ? true : false;
var useCamera = localStorage.getItem("camera") == "true" ? true : false;
var autostart = localStorage.getItem("autostart") == "true" ? true : false;

function eventListeners(game) {
	var stopButton = document.getElementById("stopButton");
	var playButton = document.getElementById("playButton");
	var editButton = document.getElementById("editButton");
	var downloadButton = document.getElementById("downloadButton");
	var designButton = document.getElementById("designButton");
	var startButton = document.getElementById("startButton");
	var homeButton = document.getElementById("homeButton");

	//this fantastic code from stackoverflow solves the blockly zoom
	//problem when inside tabs:
	//https://stackoverflow.com/questions/20705905/bootstrap-3-jquery-event-for-active-tab-change
	$('button[data-bs-toggle="tab"]').on("shown.bs.tab", function (e) {
		window.dispatchEvent(new Event("resize"));
	});

	window.onbeforeunload = function (e) {
		var jsonGS = Blockly.serialization.workspaces.save(workspaceGamestart);
		var jsonGP = Blockly.serialization.workspaces.save(workspaceGameplay);
		localStorage.setItem("jsongs", JSON.stringify(jsonGS));
		localStorage.setItem("jsongp", JSON.stringify(jsonGP));
	};

	startButton.addEventListener("click", function () {
		//  game.end();
		var jsonGS = Blockly.serialization.workspaces.save(workspaceGamestart);
		var jsonGP = Blockly.serialization.workspaces.save(workspaceGameplay);
		localStorage.setItem("jsongs", JSON.stringify(jsonGS));
		localStorage.setItem("jsongp", JSON.stringify(jsonGP));

		game.start(); //initialize lists of elements
	});

	stopButton.addEventListener("click", function () {
		game.end();
	});
	playButton.addEventListener("click", function () {
		game.saveGame();
		game.loadPlayMode();
	});
	editButton.addEventListener("click", () => {
		//analytics: 4)Switch από Play σε Edit Mode
		if (game.playing) game.end();
		game.loadDesignMode();

		//this fixes the zoom problem with blockly inside bootstrap.
		//thanks to this
		//https://stackoverflow.com/questions/51545916/cannot-type-in-blockly-workspace-in-bootstrap-modal
		window.dispatchEvent(new Event("resize"));
	});
	designButton.addEventListener("click", function () {
		game.loadDesignMode();
	});
	downloadButton.addEventListener("click", function () {
		game.createFile();
	});
	homeButton.addEventListener("click", function () {
		loadIntro();
	});
	document.getElementById("loadGame").addEventListener("change", readFile, false);

	$("#background").prop("checked", background);
	$("#autostart").prop("checked", autostart);
	$("#camera").prop("checked", useCamera);

	$("#background").change(() => {
		$("canvas").css("background-image", $("#background").prop("checked") ? backgroundImage : "none");
		localStorage.setItem("background", $("#background").prop("checked"));
	});
	$("#autostart").change(() => {
		localStorage.setItem("autostart", $("#autostart").prop("checked"));
	});
	$("#camera").change(() => {
		localStorage.setItem("camera", (useCamera = $("#camera").prop("checked")));
		if (game.playing) useCamera ? camera.start() : camera.stop();
	});
}

function closeModal() {
	$("#gameOverModal").hide();
}

/* changed! moved these functions here from sortermain.js */
function getRandNumber(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function getRandNumberMinMax(min, max) {
	return Math.random() * (max - min) + min;
}

//from stackoverflow
function average(array) {
	const sum = array.reduce((a, b) => a + b, 0);
	return (avg = sum / array.length || 0);
}

//it's from stackoverflow
function getStandardDeviation(array) {
	const n = array.length;
	const mean = array.reduce((a, b) => a + b) / n;
	return Math.sqrt(array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}
