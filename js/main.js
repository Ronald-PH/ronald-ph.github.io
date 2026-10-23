/* ==========================================================================
   Ronald Soberano — Portfolio
   Vanilla JavaScript. No libraries, no build step.
   ========================================================================== */
(function () {
    "use strict";

    window.__portfolioReady = true;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ----------------------------------------------------------------------
       Splash screen — capped so it never blocks the page for long.
       ---------------------------------------------------------------------- */
    var splash = document.getElementById("splash");

    function hideSplash() {
        if (!splash || splash.classList.contains("is-hidden")) return;
        splash.classList.add("is-hidden");
        window.setTimeout(function () {
            if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
        }, 600);
    }

    if (splash) {
        if (reduceMotion) {
            hideSplash();
        } else {
            // Hide shortly after load, but never wait longer than 1.2s.
            window.addEventListener("load", function () {
                window.setTimeout(hideSplash, 350);
            });
            window.setTimeout(hideSplash, 1200);
        }
    }

    /* ----------------------------------------------------------------------
       Mobile navigation
       ---------------------------------------------------------------------- */
    var menuButton = document.getElementById("menu-button");
    var mobileMenu = document.getElementById("mobile-menu");

    function setMenu(open) {
        if (!menuButton || !mobileMenu) return;
        mobileMenu.classList.toggle("open", open);
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    }

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            setMenu(!mobileMenu.classList.contains("open"));
        });

        mobileMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () { setMenu(false); });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
                setMenu(false);
                menuButton.focus();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth >= 900) setMenu(false);
        });
    }

    /* ----------------------------------------------------------------------
       Navbar background + active section highlighting
       ---------------------------------------------------------------------- */
    var navbar = document.getElementById("navbar");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));

    var sections = navLinks.map(function (link) {
        var id = link.getAttribute("href").slice(1);
        return { link: link, target: document.getElementById(id) };
    }).filter(function (item) { return item.target; });

    var ticking = false;

    function updateActiveSection() {
        var offset = (navbar ? navbar.offsetHeight : 76) + 40;
        var current = null;

        sections.forEach(function (item) {
            var top = item.target.getBoundingClientRect().top;
            if (top - offset <= 0) current = item;
        });

        // At the very bottom of the page, the last section wins.
        var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom && sections.length) current = sections[sections.length - 1];

        sections.forEach(function (item) {
            var isActive = item === current;
            item.link.classList.toggle("is-active", isActive);
            if (isActive) item.link.setAttribute("aria-current", "location");
            else item.link.removeAttribute("aria-current");
        });
    }

    function onScroll() {
        if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 20);
        updateActiveSection();
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", function () {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });

    onScroll();

    /* ----------------------------------------------------------------------
       Scroll reveal (lightweight replacement for AOS)
       ---------------------------------------------------------------------- */
    var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

    if (!("IntersectionObserver" in window) || reduceMotion) {
        revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);

                // Clear the reveal delay so it doesn't slow down hover effects later.
                var delay = parseInt(entry.target.getAttribute("data-reveal-delay") || "0", 10);
                window.setTimeout(function () {
                    entry.target.style.transitionDelay = "";
                }, delay + 950);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        revealItems.forEach(function (el) {
            var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
            if (delay) el.style.transitionDelay = delay + "ms";
            observer.observe(el);
        });
    }

    /* ----------------------------------------------------------------------
       Copy email to clipboard
       ---------------------------------------------------------------------- */
    var copyButton = document.getElementById("copy-email");
    var copyFeedback = document.getElementById("copy-feedback");

    function legacyCopy(text) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "-1000px";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        field.setSelectionRange(0, text.length);

        var copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }

        document.body.removeChild(field);
        return copied;
    }

    if (copyButton) {
        var email = copyButton.getAttribute("data-email") || "";
        var feedbackTimer;

        copyButton.addEventListener("click", function () {
            if (!email) return;

            function done(ok) {
                if (!copyFeedback) return;
                copyFeedback.textContent = ok
                    ? "Email copied to clipboard."
                    : "Copy failed — the email is " + email;
                window.clearTimeout(feedbackTimer);
                feedbackTimer = window.setTimeout(function () {
                    copyFeedback.textContent = "";
                }, 4000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(function () {
                    done(true);
                }).catch(function () {
                    done(legacyCopy(email));
                });
            } else {
                done(legacyCopy(email));
            }
        });
    }

    /* ----------------------------------------------------------------------
       Footer year
       ---------------------------------------------------------------------- */
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
})();
