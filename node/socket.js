var url = window.location.origin;;
var socket = io.connect(url);
socket.on('news', function (data) {
	console.log(data);
	socket.emit('my other event', { my: 'data' });
});
