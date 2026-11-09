(() => {
  const LIVE_START = 15; // 3:00 pm Wolverhampton / UK
  const LIVE_END = 22; // 10:00 pm Wolverhampton / UK

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const yearEl = document.querySelector("[data-year]");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuToggle && mobileNav && header) {
    const setMenuOpen = (open) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mobileNav.hidden = !open;
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };

    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
  }

  const noteEl = document.querySelector("[data-countdown-note]");
  const statusBox = document.querySelector("[data-live-status]");

  const getLondonParts = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const map = Object.fromEntries(
      parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value])
    );

    return {
      year: Number(map.year),
      month: Number(map.month),
      day: Number(map.day),
      hour: Number(map.hour === "24" ? "0" : map.hour),
      minute: Number(map.minute),
      second: Number(map.second),
    };
  };

  const updateLiveStatus = () => {
    if (!noteEl) return;
    const london = getLondonParts();
    const mins = london.hour * 60 + london.minute;
    const start = LIVE_START * 60;
    const end = LIVE_END * 60;
    const inWindow = mins >= start && mins < end;

    if (statusBox) {
      statusBox.classList.toggle("is-live-window", inWindow);
    }

    noteEl.textContent = inWindow
      ? "Live window is open now · Wolverhampton time (UK) — follow TikTok & turn on notifications"
      : "Lives around 3pm–10pm · Wolverhampton time (UK) — follow & turn on notifications";
  };

  updateLiveStatus();
  setInterval(updateLiveStatus, 30_000);

  const revealTargets = [
    ...document.querySelectorAll(
      ".live-copy, .live-card, .steps li, .piece, .feed-card, .social-panel, .place-inner > *"
    ),
  ];
  revealTargets.forEach((el) => el.setAttribute("data-reveal", ""));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }
})();
