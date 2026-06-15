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
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		var mouseX = 0;
		var mouseY = 0;
		var currentX = 0;
		var currentY = 0;
		var isVisible = false;
		var running = false;

		// Compositor-friendly positioning (transform, not left/top).
		glow.style.left = '0';
		glow.style.top = '0';

		function animate() {
			currentX += (mouseX - currentX) * 0.08;
			currentY += (mouseY - currentY) * 0.08;
			glow.style.transform = 'translate(' + currentX + 'px, ' + currentY + 'px) translate(-50%, -50%)';

			// Stop the loop once it has effectively caught up — restart on next move.
			if (Math.abs(mouseX - currentX) < 0.5 && Math.abs(mouseY - currentY) < 0.5) {
				running = false;
				return;
			}
			requestAnimationFrame(animate);
		}

		function ensureRunning() {
			if (!running) {
				running = true;
				requestAnimationFrame(animate);
			}
		}

		document.addEventListener('mousemove', function (e) {
			mouseX = e.clientX;
			mouseY = e.clientY;
			if (!isVisible) {
				isVisible = true;
				glow.style.opacity = '1';
			}
			ensureRunning();
		}, { passive: true });

		document.addEventListener('mouseleave', function () {
			isVisible = false;
			glow.style.opacity = '0';
		});
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

	// --- Morphing Wireframe Background ---
	function initWireframe() {
		var canvas = document.getElementById('wireframe-bg');
		if (!canvas) return;
		// Skip the continuous canvas loop entirely for reduced-motion users.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			canvas.style.display = 'none';
			return;
		}

		var ctx = canvas.getContext('2d');
		var dpr = window.devicePixelRatio || 1;
		var cssSize = 420;

		function sizeCanvas() {
			var mobile = window.innerWidth <= 860;
			cssSize = mobile ? 200 : 420;
			canvas.style.width = cssSize + 'px';
			canvas.style.height = cssSize + 'px';
			canvas.width = cssSize * dpr;
			canvas.height = cssSize * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}
		sizeCanvas();
		window.addEventListener('resize', sizeCanvas);

		var angleX = 0;
		var angleY = 0;

		function normalize(v) {
			var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
			if (len === 0) return [0, 0, 0];
			return [v[0] / len, v[1] / len, v[2] / len];
		}

		// --- Shape generators return { verts, edges } ---
		// Verts are normalized to unit sphere for uniform morphing radius

		function makeIcosahedron() {
			var phi = (1 + Math.sqrt(5)) / 2;
			var raw = [
				[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
				[0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
				[phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
			];
			var verts = raw.map(normalize);
			var edges = [
				[0,1],[0,5],[0,7],[0,10],[0,11],
				[1,5],[1,7],[1,8],[1,9],
				[2,3],[2,4],[2,6],[2,10],[2,11],
				[3,4],[3,6],[3,8],[3,9],
				[4,5],[4,9],[4,11],
				[5,9],[5,11],
				[6,7],[6,8],[6,10],
				[7,8],[7,10],
				[8,9],
				[10,11]
			];
			return { verts: verts, edges: edges };
		}

		function makeOctahedron() {
			var verts = [
				[0, 1, 0], [0, -1, 0], [1, 0, 0],
				[-1, 0, 0], [0, 0, 1], [0, 0, -1]
			];
			var edges = [
				[0,2],[0,3],[0,4],[0,5],
				[1,2],[1,3],[1,4],[1,5],
				[2,4],[2,5],[3,4],[3,5]
			];
			return { verts: verts, edges: edges };
		}

		function makeCube() {
			var verts = [
				[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
				[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
			].map(normalize);
			var edges = [
				[0,1],[1,2],[2,3],[3,0],
				[4,5],[5,6],[6,7],[7,4],
				[0,4],[1,5],[2,6],[3,7]
			];
			return { verts: verts, edges: edges };
		}

		function makeTorus(rings, segs, R, r) {
			var verts = [];
			for (var i = 0; i < rings; i++) {
				var u = (i / rings) * Math.PI * 2;
				for (var j = 0; j < segs; j++) {
					var v = (j / segs) * Math.PI * 2;
					verts.push(normalize([
						(R + r * Math.cos(v)) * Math.cos(u),
						r * Math.sin(v),
						(R + r * Math.cos(v)) * Math.sin(u)
					]));
				}
			}
			var edges = [];
			for (var i = 0; i < rings; i++) {
				for (var j = 0; j < segs; j++) {
					var cur = i * segs + j;
					var nextJ = i * segs + (j + 1) % segs;
					var nextI = ((i + 1) % rings) * segs + j;
					edges.push([cur, nextJ]);
					edges.push([cur, nextI]);
				}
			}
			return { verts: verts, edges: edges };
		}

		function makeSphere(n) {
			var pts = [];
			var golden = Math.PI * (3 - Math.sqrt(5));
			for (var i = 0; i < n; i++) {
				var y = 1 - (i / (n - 1)) * 2;
				var rad = Math.sqrt(1 - y * y);
				var theta = golden * i;
				pts.push([Math.cos(theta) * rad, y, Math.sin(theta) * rad]);
			}
			// Connect nearest neighbors for geodesic-like mesh
			var edges = [];
			var seen = {};
			for (var i = 0; i < pts.length; i++) {
				var dists = [];
				for (var j = 0; j < pts.length; j++) {
					if (i === j) continue;
					var dx = pts[i][0] - pts[j][0];
					var dy = pts[i][1] - pts[j][1];
					var dz = pts[i][2] - pts[j][2];
					dists.push({ j: j, d: Math.sqrt(dx * dx + dy * dy + dz * dz) });
				}
				dists.sort(function (a, b) { return a.d - b.d; });
				for (var k = 0; k < Math.min(4, dists.length); k++) {
					var a = Math.min(i, dists[k].j);
					var b = Math.max(i, dists[k].j);
					var key = a + ',' + b;
					if (!seen[key]) {
						seen[key] = true;
						edges.push([a, b]);
					}
				}
			}
			return { verts: pts, edges: edges };
		}

		function makeDiamond() {
			// Double pyramid — two pyramids fused at the base
			var verts = [
				[0, 1.2, 0],   // top
				[0, -1.2, 0],  // bottom
				[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1] // equator
			].map(normalize);
			var edges = [
				[0,2],[0,3],[0,4],[0,5],
				[1,2],[1,3],[1,4],[1,5],
				[2,4],[4,3],[3,5],[5,2]
			];
			return { verts: verts, edges: edges };
		}

		// Build shape library: each has explicit verts + edges
		var rawShapes = [
			makeIcosahedron(),                    // Hero
			makeTorus(8, 8, 0.7, 0.3),            // About
			makeCube(),                            // Experience
			makeOctahedron(),                      // Education
			makeSphere(32),                        // Projects
			makeDiamond()                          // Contact
		];

		// Uniform point count for morphing — pad smaller shapes
		var maxPts = 0;
		for (var s = 0; s < rawShapes.length; s++) {
			if (rawShapes[s].verts.length > maxPts) maxPts = rawShapes[s].verts.length;
		}

		var shapes = rawShapes.map(function (shape) {
			var verts = shape.verts.slice();
			var edges = shape.edges.slice();
			var origCount = verts.length;
			// Pad by distributing copies around existing vertices
			while (verts.length < maxPts) {
				var srcIdx = (verts.length - origCount) % origCount;
				var src = verts[srcIdx];
				var jitter = 0.001 * (verts.length - origCount + 1);
				verts.push(normalize([
					src[0] + jitter,
					src[1] - jitter * 0.5,
					src[2] + jitter * 0.7
				]));
			}
			return { verts: verts, edges: edges, origCount: origCount };
		});

		var POINT_COUNT = maxPts;

		// Interpolated vertex state
		var currentVerts = shapes[0].verts.map(function (v) { return v.slice(); });

		// Scroll-driven morph — returns a fractional index (e.g. 2.4 = 40% between shape 2 and 3)
		var sectionIds = ['hero', 'about', 'experience', 'education', 'projects', 'contact'];
		var sectionEls = [];
		for (var s = 0; s < sectionIds.length; s++) {
			sectionEls.push(document.getElementById(sectionIds[s]));
		}

		// Cache section offsets (recalculate on resize)
		var sectionTops = [];
		function cacheSectionOffsets() {
			sectionTops = [];
			for (var i = 0; i < sectionEls.length; i++) {
				sectionTops.push(sectionEls[i] ? sectionEls[i].offsetTop : 0);
			}
		}
		cacheSectionOffsets();
		window.addEventListener('resize', cacheSectionOffsets);

		// Per-section wireframe position targets (right%, verticalOffset%)
		// Alternates sides and drifts vertically for visual variety
		var positionTargets = [
			{ right: 5,  vOff: 0   },  // Hero — right side, centered
			{ right: 60, vOff: -10 },  // About — left side, slightly up
			{ right: 8,  vOff: 5   },  // Experience — right side, slightly down
			{ right: 55, vOff: -5  },  // Education — left side, slightly up
			{ right: 10, vOff: 8   },  // Projects — right side, down
			{ right: 50, vOff: 0   }   // Contact — centered
		];

		function getScrollFraction() {
			var scrollY = window.scrollY;
			var winH = window.innerHeight;
			var ref = scrollY + winH * 0.4;

			for (var i = sectionTops.length - 1; i >= 0; i--) {
				if (ref >= sectionTops[i]) {
					var shapeIdx = Math.min(i, shapes.length - 1);
					if (i < sectionTops.length - 1 && shapeIdx < shapes.length - 1) {
						var sectionLen = sectionTops[i + 1] - sectionTops[i];
						if (sectionLen > 0) {
							var progress = (ref - sectionTops[i]) / sectionLen;
							return shapeIdx + Math.min(progress, 1);
						}
					}
					return shapeIdx;
				}
			}
			return 0;
		}

		// Smoothly move the canvas position based on scroll fraction
		function updateCanvasPosition(frac) {
			var fromIdx = Math.floor(frac);
			var toIdx = Math.min(fromIdx + 1, positionTargets.length - 1);
			var t = frac - fromIdx;

			var fromPos = positionTargets[Math.min(fromIdx, positionTargets.length - 1)];
			var toPos = positionTargets[toIdx];

			var rightPct = fromPos.right + (toPos.right - fromPos.right) * t;
			var vOff = fromPos.vOff + (toPos.vOff - fromPos.vOff) * t;

			canvas.style.right = rightPct + '%';
			canvas.style.top = 'calc(50% + ' + vOff + 'vh)';
		}

		function rotateY(v, a) {
			var c = Math.cos(a), s = Math.sin(a);
			return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
		}

		function rotateX(v, a) {
			var c = Math.cos(a), s = Math.sin(a);
			return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
		}

		function easeInOut(t) {
			return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
		}

		function draw() {
			var radius = cssSize * 0.35;
			var cx = cssSize / 2;
			var cy = cssSize / 2;

			ctx.clearRect(0, 0, cssSize, cssSize);

			// Scroll-driven morph — continuous fractional index
			var frac = getScrollFraction();
			updateCanvasPosition(frac);
			var fromIdx = Math.floor(frac);
			var toIdx = Math.min(fromIdx + 1, shapes.length - 1);
			var t = easeInOut(frac - fromIdx);

			var fromVerts = shapes[fromIdx].verts;
			var toVerts = shapes[toIdx].verts;

			// Interpolate vertices
			for (var i = 0; i < POINT_COUNT; i++) {
				currentVerts[i][0] = fromVerts[i][0] + (toVerts[i][0] - fromVerts[i][0]) * t;
				currentVerts[i][1] = fromVerts[i][1] + (toVerts[i][1] - fromVerts[i][1]) * t;
				currentVerts[i][2] = fromVerts[i][2] + (toVerts[i][2] - fromVerts[i][2]) * t;
			}

			// Edge blending
			var fromEdges = shapes[fromIdx].edges;
			var toEdges = shapes[toIdx].edges;

			// Rotate and project
			var projected = [];
			for (var i = 0; i < POINT_COUNT; i++) {
				var r = rotateY(currentVerts[i], angleY);
				r = rotateX(r, angleX);
				projected.push([cx + r[0] * radius, cy + r[1] * radius]);
			}

			// Edge lookup sets
			var toEdgeSet = {};
			for (var e = 0; e < toEdges.length; e++) {
				toEdgeSet[toEdges[e][0] + ',' + toEdges[e][1]] = true;
			}
			var fromEdgeSet = {};
			for (var e = 0; e < fromEdges.length; e++) {
				fromEdgeSet[fromEdges[e][0] + ',' + fromEdges[e][1]] = true;
			}

			ctx.lineWidth = 0.8;

			// Old edges not in target — fade out
			if (t < 1) {
				ctx.strokeStyle = 'rgba(34, 211, 238, ' + (0.5 * (1 - t)) + ')';
				for (var e = 0; e < fromEdges.length; e++) {
					var key = fromEdges[e][0] + ',' + fromEdges[e][1];
					if (!toEdgeSet[key]) {
						var a = projected[fromEdges[e][0]];
						var b = projected[fromEdges[e][1]];
						ctx.beginPath();
						ctx.moveTo(a[0], a[1]);
						ctx.lineTo(b[0], b[1]);
						ctx.stroke();
					}
				}
			}

			// Target edges — shared stay full, new fade in
			for (var e = 0; e < toEdges.length; e++) {
				var a = projected[toEdges[e][0]];
				var b = projected[toEdges[e][1]];
				if (!a || !b) continue;
				var shared = fromEdgeSet[toEdges[e][0] + ',' + toEdges[e][1]];
				var alpha = shared ? 0.5 : 0.5 * t;
				ctx.strokeStyle = 'rgba(34, 211, 238, ' + alpha + ')';
				ctx.beginPath();
				ctx.moveTo(a[0], a[1]);
				ctx.lineTo(b[0], b[1]);
				ctx.stroke();
			}

			// Vertices — only originals, not padding
			var visibleCount = Math.max(shapes[fromIdx].origCount, shapes[toIdx].origCount);
			ctx.save();
			ctx.shadowBlur = 6;
			ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
			ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
			for (var j = 0; j < visibleCount; j++) {
				ctx.beginPath();
				ctx.arc(projected[j][0], projected[j][1], 1.8, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();

			angleY += 0.003;
			angleX += 0.001;
			rafId = requestAnimationFrame(draw);
		}

		// Pause the loop when the tab is hidden; resume on return.
		var rafId = null;
		function start() {
			if (rafId === null) rafId = requestAnimationFrame(draw);
		}
		function stop() {
			if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
		}
		document.addEventListener('visibilitychange', function () {
			if (document.hidden) stop(); else start();
		});

		start();
	}

	// --- Card Tilt on Hover ---
	function initCardTilt() {
		if (window.matchMedia('(hover: none)').matches) return;

		var cards = document.querySelectorAll('.project-card');
		var maxTilt = 4; // degrees

		cards.forEach(function (card) {
			card.addEventListener('mousemove', function (e) {
				var rect = card.getBoundingClientRect();
				var x = (e.clientX - rect.left) / rect.width;
				var y = (e.clientY - rect.top) / rect.height;
				var tiltX = (0.5 - y) * maxTilt;
				var tiltY = (x - 0.5) * maxTilt;
				card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
			});

			card.addEventListener('mouseleave', function () {
				card.style.transform = '';
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
		initWireframe();
		initCardTilt();
	});

})();
