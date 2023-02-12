const socket = io.connect('http://localhost:3000');

socket.emit("dashboard-servers-update")
setInterval(() => {
	socket.emit("dashboard-servers-update")
}, 90000)

$(document).ready(function () {
	$(".manage").click((click) => {
		window.location = `/manage/${click.target.id}`
	})
});