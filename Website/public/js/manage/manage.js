$("#leftside-navigation .sub-menu > a").click(function (e) {
	$("#leftside-navigation ul ul").slideUp(), $(this).next().is(":visible") || $(this).next().slideDown(),
		e.stopPropagation()
})