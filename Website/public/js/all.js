// tippy.js
tippy("[data-tippy-content]");

// aos.js
AOS.init({
	duration: 700,
	once: true
});

// navbar burger
document.addEventListener('DOMContentLoaded', () => {
	const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

	if ($navbarBurgers.length > 0) {
		$navbarBurgers.forEach(el => {
			el.addEventListener('click', () => {
				const target = el.dataset.target;
				const $target = document.getElementById(target);
				el.classList.toggle('is-active');
				$target.classList.toggle('is-active');
			});
		});
	}
});

$(document).ready(function () {
	$(".navbar-burger").click(function () {
		$(".navbar-burger").toggleClass("is-active");
		$(".navbar-menu").toggleClass("is-active");
	});
	$(".login").click(() => {
		window.location = "/auth/login"
	})
	$(".logout").click(() => {
		window.location = "/auth/logout"
	})
	$(".dashboard").click(() => {
		window.location = "/dashboard"
	})
});

// Tostar

toastr.options.positionClass = 'toast-bottom-right';

// back to top
var backToTopBtn = $("#backtotop");

$(window).scroll(function () {
	if ($(window).scrollTop() > 100) {
		backToTopBtn.addClass("show");
	} else {
		backToTopBtn.removeClass("show");
	}
});

backToTopBtn.on("click", function (e) {
	e.preventDefault();
	$("html, body").animate({ scrollTop: 0 }, "300");
});

// copyright year
document.getElementById("cp-year").innerHTML = new Date().getFullYear()
