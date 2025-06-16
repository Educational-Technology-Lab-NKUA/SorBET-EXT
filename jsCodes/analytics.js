function sendEvent(event, message){
    event.timestamp=Date().timestamp
    event.state.event_count++;
    if (message) console.log(message)
    console.log( JSON.stringify(event))
}