//Event fired when page is loaded
document.addEventListener('DOMContentLoaded', function () {
    setDefaultValue()
}, false);

//Set default values if specified in URL
function setDefaultValue() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    document.getElementById('bot_token').value = urlParams.get('bot_token');
    document.getElementById('bot_chat_id').value = urlParams.get('bot_chat_id');
    document.getElementById('bot_message').value = urlParams.get('bot_message');
    document.getElementById('image_url').value = urlParams.get('image_url'); // Set default for image URL
}

//Send message/image through Telegram Bot
function send() {
    // Read input values
    let bot_token = document.getElementById('bot_token').value;
    let bot_chat_ids_raw = document.getElementById('bot_chat_id').value;
    let bot_message = document.getElementById('bot_message').value;
    let image_url = document.getElementById('image_url').value;

    // Split chat IDs by new line and filter out empty lines
    let bot_chat_ids = bot_chat_ids_raw.split('\n').map(id => id.trim()).filter(id => id.length > 0);

    // Replace spaces in message with + for URL encoding
    let encoded_message = encodeURIComponent(bot_message);

    if (bot_chat_ids.length === 0) {
        alert("Please enter at least one Chat ID.");
        return;
    }

    bot_chat_ids.forEach(chat_id => {
        let bot_request_url;

        if (image_url) {
            // If an image URL is provided, use sendPhoto API
            bot_request_url = `https://api.telegram.org/bot${bot_token}/sendPhoto?chat_id=${chat_id}&photo=${encodeURIComponent(image_url)}`;
            if (encoded_message) {
                bot_request_url += `&caption=${encoded_message}`;
            }
        } else {
            // Otherwise, use sendMessage API
            bot_request_url = `https://api.telegram.org/bot${bot_token}/sendMessage?chat_id=${chat_id}&text=${encoded_message}`;
        }

        // Send request
        fetch(bot_request_url)
            .then(response => response.json())
            .then(data => {
                console.log(`Message/Image sent to ${chat_id}:`, data);
                if (data.ok) {
                    // You might want to provide some feedback to the user here
                    console.log(`Successfully sent to ${chat_id}`);
                } else {
                    console.error(`Failed to send to ${chat_id}:`, data.description);
                }
            })
            .catch(err => {
                console.error(`Error sending to ${chat_id}:`, err);
                alert(`Error sending to ${chat_id}! Check your Token / Chat ID / Network Connection.`);
            });
    });
}

function viewReceived() {
    //Create url
    let bot_token = document.getElementById('bot_token').value
    let bot_request_url = 'https://api.telegram.org/bot' + bot_token + '/getUpdates';

    //Send request
    fetch(bot_request_url)
        .then(response => {
            return response.json()
        })
        .then(data => {

            console.log(data)

            //Clear previous messages
            const myNode = document.getElementById("ReceivedMessages");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.lastChild);
            }

            //Add new messages
            for (var i = 0; i < data.result.length; i++) {

                var chat = document.createElement("P");
                chat.innerHTML += " Chat ID: " + data.result[i].message.chat.id;
                chat.innerHTML += " Date: " + new Date(data.result[i].message.date * 1000).toLocaleDateString("it-IT");
                chat.innerHTML += " " + new Date(data.result[i].message.date * 1000).toLocaleTimeString("it-IT");
                chat.innerHTML += " Name: " + data.result[i].message.chat.first_name;
                chat.innerHTML += " Message: " + data.result[i].message.text;
                chat.id = "chat"
                document.getElementById("ReceivedMessages").appendChild(chat);
            }

        })
        .catch(err => {

            var chat = document.createElement("P");
            chat.innerHTML = " Error! Check your Token / Chat ID / Network Connection. "
            chat.id = "chat"
            document.getElementById("ReceivedMessages").appendChild(chat);

        })
}
