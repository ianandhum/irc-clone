const zomoji = new Zomoji();

const messages = document.getElementById("messages")

function createMessageEntry(...children) {
    let messageEntry = document.createElement('div')

    messageEntry.className = 'message-entry';

    for(let child of children) {
        messageEntry.append(child)
    }

    messages.prepend(messageEntry)
}

function displayNewMessage(message, selfSender) {
    let newMessage = document.createElement('span');
    newMessage.innerHTML = zomoji.replace(message.content);
    newMessage.className = 'message-item' + (selfSender ? " sent" : " received")

    createMessageEntry(newMessage)
}

function displayNewInfo(message) {
    let newMessage = document.createElement('span');
    newMessage.innerText = message.content
    newMessage.className = 'info'

    createMessageEntry(newMessage)
}


function sendNotification(message) {
    new Notification("New message from " + message.by, {
      body: message.content
   })
}



const OutgoingMessageFilters = [
    /**
     * Outgoing filters
     */
    {
        name: "change-nick-name",
        regex: "([a-zA-Z][a-zA-Z_0-9]{2,20})",
        command: "register",
        terminate: true,
        action: function(socket, object, matches) {
            if(matches.length) {
                socket.emit(this.name, { nickName: matches[1], oldNickName: AppState.nickName})
                AppState.nickName = matches[1]

                const message = {content: "You are now known as " + AppState.nickName, by: AppState.nickName}
                displayNewInfo(message)
            }
        }
    },
    {
        name: "poke",
        regex: "([a-zA-Z][a-zA-Z_0-9]{2,20})",
        command: "poke",
        terminate: true,
        action: function(socket, object, matches) {
            socket.emit(this.name, { callee: matches[1], caller: AppState.nickName})

            const message = {content: "You poked " + matches[1]}
            displayNewInfo(message)
        }
    },
    {
        name: "message",
        regex: ".*?",
        terminate: false,
        action: function(socket, object, matches) {
            const message = {...object, by: AppState.nickName}
            socket.emit(this.name, message)

            displayNewMessage(message, true)
        }
    }
]

const IncomingMessageFilters = [

    /**
     * Incoming filters
     */
    {
        name: "message",
        action: function(socket, message) {
            displayNewMessage(message, false)
            sendNotification(message)
        }
    },
    {
        name: "poke",
        action: function(socket, args) {
            if(args.callee === AppState.nickName) {
                const poke = {content: args.caller + " is poking you!", by: args.caller};
                sendNotification(poke)
                displayNewInfo(poke)
            
            }
        }
    },
    {
        name: "change-nick-name",
        action: function(socket, args) {
            const message = {content: args.oldNickName + " is now known as " + args.nickName, by: args.nickName}
            displayNewInfo(message)
            sendNotification(message)
        }
    }
]