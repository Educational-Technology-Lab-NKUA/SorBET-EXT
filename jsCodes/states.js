// get/set methods
stateIsSet = false;
// called by getState in SorterMain.js
function getCurrentState() {
	SorterGame.saveGame();
	//var testString = "somethinginstring";
	var gameObjects = JSON.stringify(SorterGame.dataTableRows);
	var gameCategories = JSON.stringify(SorterGame.categories);

	var jsonGS = Blockly.serialization.workspaces.save(workspaceGamestart);
	var jsonGP = Blockly.serialization.workspaces.save(workspaceGameplay);
	//NA PAIRNEI TON KODIKA KAI NA TON SWZEI STO STATE
	//	var gameCode = JSON.stringify();
	var stateJSON = { gameObjects: gameObjects, 
		categories: gameCategories, 
		blockly:{jsonGS: jsonGS, jsonGP: jsonGP},
		instructions: SorterGame.instructions, };
	console.log(stateJSON);
	return stateJSON;
}

// called by setState in SorterMain.js
function handleState(jsonState) {
	//var loadedJSON = (JSON.parse(jsonState))

	// console.log(loadedJSON);
	//if (!stateIsSet) {
		//STO LOAD GAME FILE NA FORTWNEI TON KWDIKA APO TO STATE
		SorterGame.loadGameFile(jsonState, 2); //Create new game with the saved state
		stateIsSet = true;
	//}
}
