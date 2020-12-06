const socket = io();

const handleFormSubmission = () => {
  const logSubmit = (e) => {
    e.preventDefault();
    socket.emit('chat message', document.querySelector('#m').value);
    document.querySelector('#m').value;
    return false;
  };

  const form = document.querySelector('form');
  form.addEventListener('submit', logSubmit);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  handleFormSubmission();

  socket.on('chat message', function(msg){
    const messageItem = document.createElement("li")
    messageItem.textContent = msg;

    document.querySelector('#messages').appendChild(messageItem);
  });
});
    