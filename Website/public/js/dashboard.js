$(document).ready(function () {
	$(".manage").click((click) => {
		window.location = `/manage/${click.target.id}`
	})
});