(() => {
  const LIVE_HOUR = 19; // 7:00 pm Wolverhampton / UK (Europe/London)

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

  const hoursEl = document.querySelector("[data-hours]");
  const minutesEl = document.querySelector("[data-minutes]");
  const secondsEl = document.querySelector("[data-seconds]");
  const noteEl = document.querySelector("[data-countdown-note]");
  const pad = (n) => String(n).padStart(2, "0");

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

  const londonWallTimeToUtcMs = (year, month, day, hour, minute = 0, second = 0) => {
    let guess = Date.UTC(year, month - 1, day, hour, minute, second);
    for (let i = 0; i < 3; i += 1) {
      const asLondon = getLondonParts(new Date(guess));
      const asUtcLike = Date.UTC(
        asLondon.year,
        asLondon.month - 1,
        asLondon.day,
        asLondon.hour,
        asLondon.minute,
        asLondon.second
      );
      const target = Date.UTC(year, month - 1, day, hour, minute, second);
      guess += target - asUtcLike;
    }
    return guess;
  };

  const nextLiveUtcMs = () => {
    const now = new Date();
    const london = getLondonParts(now);
    let target = londonWallTimeToUtcMs(london.year, london.month, london.day, LIVE_HOUR);

    if (now.getTime() >= target) {
      const tomorrow = new Date(Date.UTC(london.year, london.month - 1, london.day + 1, 12));
      const t = getLondonParts(tomorrow);
      target = londonWallTimeToUtcMs(t.year, t.month, t.day, LIVE_HOUR);
    }
    return target;
  };

  const tickCountdown = () => {
    if (!hoursEl || !minutesEl || !secondsEl) return;

    let diff = Math.max(0, nextLiveUtcMs() - Date.now());
    const hours = Math.floor(diff / 3_600_000);
    diff %= 3_600_000;
    const minutes = Math.floor(diff / 60_000);
    diff %= 60_000;
    const seconds = Math.floor(diff / 1000);

    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);

    if (noteEl) {
      const londonNow = getLondonParts();
      const isLiveWindow = londonNow.hour === LIVE_HOUR && londonNow.minute < 45;
      noteEl.textContent = isLiveWindow
        ? "We're live now · Wolverhampton time (UK) — jump in on TikTok"
        : "Until tonight’s TikTok live · Wolverhampton time (UK)";
    }
  };

  tickCountdown();
  setInterval(tickCountdown, 1000);

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
