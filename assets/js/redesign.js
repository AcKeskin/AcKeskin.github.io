/* ============================================================
   Portfolio Redesign — Interaction Layer
   Scroll reveals, nav tracking, cursor glow, loader.
   ============================================================ */

(function () {
	'use strict';

	// --- Loader ---
	const loader = document.getElementById('loader');
	window.addEventListener('load', function () {
		setTimeout(function () {
			loader.classList.add('hidden');
		}, 1400);
	});

	// --- Scroll Reveal ---
	function initReveal() {
		const reveals = document.querySelectorAll('.reveal, .reveal-slide');
		if (!reveals.length) return;

		// Hero reveals fire on load with stagger
		const heroReveals = document.querySelectorAll('.hero .reveal');
		heroReveals.forEach(function (el) {
			const delay = parseInt(el.dataset.delay || '0', 10);
			setTimeout(function () {
				el.classList.add('visible');
			}, 1600 + delay * 150);
		});

		// Intersection observer for remaining elements
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					// Stagger siblings
					var parent = entry.target.parentElement;
					var siblings = parent ? parent.querySelectorAll('.reveal-slide') : [];
					var index = Array.prototype.indexOf.call(siblings, entry.target);
					var staggerDelay = index >= 0 ? index * 80 : 0;

					setTimeout(function () {
						entry.target.classList.add('visible');
					}, staggerDelay);

					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.15,
			rootMargin: '0px 0px -40px 0px'
		});

		reveals.forEach(function (el) {
			// Skip hero reveals — handled above
			if (!el.closest('.hero')) {
				observer.observe(el);
			}
		});
	}

	// --- Active Nav Link ---
	function initNavTracking() {
		var links = document.querySelectorAll('.nav__link');
		var sections = [];

		links.forEach(function (link) {
			var id = link.getAttribute('data-section');
			var section = document.getElementById(id);
			if (section) {
				sections.push({ el: section, link: link });
			}
		});

		function updateActive() {
			var scrollY = window.scrollY + window.innerHeight * 0.35;

			// Find current section
			var current = null;
			for (var i = sections.length - 1; i >= 0; i--) {
				if (sections[i].el.offsetTop <= scrollY) {
					current = sections[i];
					break;
				}
			}

			links.forEach(function (l) { l.classList.remove('active'); });
			if (current) {
				current.link.classList.add('active');
			}
		}

		window.addEventListener('scroll', updateActive, { passive: true });
		updateActive();
	}

	// --- Smooth scroll for nav links ---
	function initSmoothScroll() {
		document.querySelectorAll('.nav__link, .hero__cta a[href^="#"]').forEach(function (link) {
			link.addEventListener('click', function (e) {
				var href = this.getAttribute('href');
				if (href && href.charAt(0) === '#') {
					e.preventDefault();
					var target = document.getElementById(href.substring(1));
					if (target) {
						target.scrollIntoView({ behavior: 'smooth', block: 'start' });

						// Close mobile nav
						var nav = document.getElementById('nav');
						var toggle = document.getElementById('nav-toggle');
						var backdrop = document.getElementById('nav-backdrop');
						if (nav) nav.classList.remove('open');
						if (toggle) toggle.classList.remove('active');
						if (backdrop) backdrop.classList.remove('visible');
					}
				}
			});
		});
	}

	// --- Mobile Nav ---
	function initMobileNav() {
		var toggle = document.getElementById('nav-toggle');
		var nav = document.getElementById('nav');
		var backdrop = document.getElementById('nav-backdrop');
		if (!toggle || !nav) return;

		function openNav() {
			toggle.classList.add('active');
			nav.classList.add('open');
			if (backdrop) backdrop.classList.add('visible');
		}

		function closeNav() {
			toggle.classList.remove('active');
			nav.classList.remove('open');
			if (backdrop) backdrop.classList.remove('visible');
		}

		toggle.addEventListener('click', function () {
			if (nav.classList.contains('open')) {
				closeNav();
			} else {
				openNav();
			}
		});

		// Close on backdrop tap
		if (backdrop) {
			backdrop.addEventListener('click', closeNav);
		}

		// Close on outside click
		document.addEventListener('click', function (e) {
			if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
				closeNav();
			}
		});
	}

	// --- Cursor Glow ---
	function initCursorGlow() {
		var glow = document.getElementById('cursor-glow');
		if (!glow || window.matchMedia('(max-width: 860px)').matches) return;

		var mouseX = 0;
		var mouseY = 0;
		var currentX = 0;
		var currentY = 0;
		var isVisible = false;

		document.addEventListener('mousemove', function (e) {
			mouseX = e.clientX;
			mouseY = e.clientY;
			if (!isVisible) {
				isVisible = true;
				glow.style.opacity = '1';
			}
		});

		document.addEventListener('mouseleave', function () {
			isVisible = false;
			glow.style.opacity = '0';
		});

		function animate() {
			// Smooth follow with lerp
			currentX += (mouseX - currentX) * 0.08;
			currentY += (mouseY - currentY) * 0.08;
			glow.style.left = currentX + 'px';
			glow.style.top = currentY + 'px';
			requestAnimationFrame(animate);
		}

		animate();
	}

	// --- Video Playback Rates ---
	function initVideoPlayback() {
		var videos = document.querySelectorAll('.project-card__media video');
		videos.forEach(function (video) {
			var src = video.querySelector('source');
			if (!src) return;

			var srcAttr = src.getAttribute('src') || '';
			// Set playback rates based on video file
			if (srcAttr.indexOf('lf.mp4') !== -1) {
				video.playbackRate = 3.0;
			} else if (srcAttr.indexOf('Virtuanance') !== -1) {
				video.playbackRate = 4.0;
			} else if (srcAttr.indexOf('FPS-ER') !== -1) {
				video.playbackRate = 2.0;
			}

			// Ensure autoplay
			video.play().catch(function () {
				// Autoplay blocked — muted videos should work, but swallow error
			});
		});
	}

	// --- Initialize ---
	document.addEventListener('DOMContentLoaded', function () {
		initReveal();
		initNavTracking();
		initSmoothScroll();
		initMobileNav();
		initCursorGlow();
		initVideoPlayback();
	});

})();
