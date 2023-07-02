
const composeTxtInput = document.getElementById('txt-compose')

function processInput() {
    const message = composeTxtInput.value.trim()
    if (message) {
        processOutgoingFilterChain({ content: message })
        composeTxtInput.value = ""
    }
}

function processOutgoingFilterChain(object) {
    let processed;

    OutgoingMessageFilters.some(filter => {
        let regex;

        // it should be a command
        if(object.content.startsWith("/")) {
            if(filter.command && filter.regex) {
                regex = new RegExp(`^\/${filter.command} ${filter.regex}`)
            } else {
                return false;
            }
        } else if(!filter.command && filter.regex) {
            regex = new RegExp(filter.regex)
        }
        if(regex) {
            const matches = regex.exec(object.content)
            if(matches && typeof filter.action === 'function') {
                
                console.log("Processing outgoing filter: ", filter)
                filter.action(socket, object, matches)

                processed = true    
                if(filter.terminate) {
                    return
                }
            }
        }
    })
    
    if(!processed) {
        console.warn("No filter matched for the object", object)
        alert("Invalid message: " + object.content)
    }
}

function processIncomingFilterChain(event, object) {
    IncomingMessageFilters.forEach( filter => {
        if(event === filter.name && typeof filter.action === 'function') {
            console.log("Processing incoming filter: ", filter)
            filter.action(socket, object)
        }
    })
}

function checkNotification() {
    if (Notification.permission !== "denied") {
        Notification.requestPermission().then( permission => {
            console.log("notification permission: ", permission)
        })
    }
}


const socket = io()
checkNotification()

socket.on("broadcast", (...args) => {
    const broadcast = args[0]
    console.log("New broadcast", broadcast)
    processIncomingFilterChain(broadcast.originalEvent, broadcast.args)
})
