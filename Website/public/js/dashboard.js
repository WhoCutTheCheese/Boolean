setInterval(() => {
	socket.emit("dashboard-servers-update")
}, 90000)

$(document).ready(function () {
	$(".redirect").click((click) => {
		window.location = `/manage/${click.target.id}`
	})
});