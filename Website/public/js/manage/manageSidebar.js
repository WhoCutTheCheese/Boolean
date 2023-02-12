$(document).ready(function () {
	$('.main-item').click(function () {
		var customData = $(this).data('href');
		window.location = `${window.location.href}/${customData}`
	});
});