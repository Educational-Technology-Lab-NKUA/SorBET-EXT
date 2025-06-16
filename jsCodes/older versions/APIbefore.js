function setUpCommunication(gameInstance) {
	//create a wiil instance
	var wiil = Wiil.getInstance();
	var sorbetWidget = gameInstance;
	//register this component as [malt] with wiil
	var componentID = "sorbet";
	wiil.setComponentID(componentID);

	//register host page as peer with name [host]
	var peer = window.parent.name;
	wiil.register(false, peer, parent);

	//set up my public interface  Name: type, events: events names
	var events = {
		elements: [
			{
				name: "playmode",
				events: [/*"clickanddrag" ,*/ "camera_on_event", "voice_commands_event", "sorted_objects", "game_over", "game_statistics", "active_player", /*"player_performance"*/],
			},
			{
				name: "database",
				events: [
					"switch_mode",
					"modify_category",
					"modify_object",
					"add_category",
					"add_object",
					"delete_category",
					"delete_object",
					"select_all_objects",
					"deselect_all_objects",
					"design_activity",
					"blockly_change_gamestart",
					"blockly_change_gameplay",
				],
			},
		],
	};

	//set up public interface
	wiil.pushFunction("logData", function (data) {
		console.log(data);
	});

	wiil.pushFunction(
		"setState", // state is a JSON object that holds all the info needed to initialise or reset the state of the malt instance
		function (state) {
			if (jQuery.isEmptyObject(state.initial_state)) {
				//sorbetWidget.resetState();
			} else {
				var res = sorbetWidget.setState(state.initial_state);
			}
		}
	);

	wiil.pushFunction(
		"getState", // the function returns the state of the sorbet instance as a JSON object
		function () {
			return sorbetWidget.getState();
		}
	);

	wiil.pushFunction(
		"getMetaData", // the function returns a JSON object that shows the types of elements we can have in a malt instance and the events they can be associated with
		function () {
			return events;
		}
	);

	//ask host page to register this component as peer
	var message = wiil.createMessage(null, "register", [true, componentID], null);
	wiil.sendMessage(peer, message);

	sendState = function () {
		//sends the current state to host. It is called when the button "save online" is clicked by the teacher
		console.log("Sending state:");
		var currentState = sorbetWidget.getState();
		var message = wiil.createMessage(null, "saveState", [currentState], null);
		wiil.sendMessage(peer, message);
	};

	sendEvent = function (msg) {
		//console.log ("Sending event:")
		//console.log (msg)
		//var msgToSent = JSON.stringify(msg);

		msg.timestamp=Date().timestamp
		msg.state.event_count++;
		if (message) console.log(msg)

		if (!fromLaunch) {
			var message = wiil.createMessage(null, "logAction", [msg], null);
			wiil.sendMessage(peer, message);
		}
	};
	//Send a message when everything has loaded
	sendReady = function () {
		//ask host page to register this component as peer
		var message = wiil.createMessage(null, "register", [true, componentID], null);
		wiil.sendMessage(peer, message);
	};
}
