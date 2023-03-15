let guildId = window.location.href.split('/')[4]

$("#leftside-navigation .sub-menu > a").click(function (e) {
	$("#leftside-navigation ul ul").slideUp(), $(this).next().is(":visible") || $(this).next().slideDown(),
		e.stopPropagation()
})

$(document).ready(function () {
	socket.emit('manage-botinfo-getnickname', guildId)
	$("#savebotinfo").click(() => {
		$("#savebotinfo").addClass('is-loading');
		let nickname = $("#nickname").val()
		let prefix = $("#prefix").val()
		let embedcolor = $("#embedcolor").val()
		socket.emit('manage-botinfo-updateguild', guildId, { nickname, prefix, embedcolor })
	})
});

socket.on('manage-botinfo-updateguild-return', (nickname) => {
	$("#savebotinfo").removeClass('is-loading');
})

socket.on('manage-botinfo-getnickname-return', (nickname) => {
	$("#nickname").val(nickname);
})