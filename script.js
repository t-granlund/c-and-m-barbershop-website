/* =========================================================
   C & M Barbershop — tiny, honest JS
   Two jobs:
     1. Set the current year in the footer.
     2. Show a live "Open Now" / "Closed" indicator based on
        the shop's actual hours.
   Shop hours (Central Time, America/Chicago):
     Mon–Fri  08:00–17:00
     Sat      08:00–12:00
     Sun      closed
   ========================================================= */

(() => {
  // ---- Floating mock-up notice ----------------------------------------
  const MOCK_BANNER_KEY = "cm-mock-banner-dismissed";
  const mockBanner = document.querySelector("[data-mock-banner]");
  const mockBannerClose = document.querySelector("[data-mock-banner-close]");

  const dismissMockBanner = () => {
    if (!mockBanner) return;
    mockBanner.hidden = true;
    try {
      localStorage.setItem(MOCK_BANNER_KEY, "true");
    } catch (error) {
      // Storage can fail in privacy modes. Banner still dismisses for this session.
    }
  };

  if (mockBanner) {
    try {
      if (localStorage.getItem(MOCK_BANNER_KEY) === "true") {
        mockBanner.hidden = true;
      }
    } catch (error) {
      // Ignore storage read errors. YAGNI for a more dramatic fallback.
    }
  }

  if (mockBanner && mockBannerClose) {
    mockBannerClose.addEventListener("click", dismissMockBanner);
  }

  // ---- Footer year -----------------------------------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Live open/closed status ----------------------------------------
  // [open, close] in hours (decimal). null = closed that day.
  // Index matches Date#getDay(): 0=Sunday … 6=Saturday.
  const HOURS = [
    null,         // Sun
    [8, 17],      // Mon
    [8, 17],      // Tue
    [8, 17],      // Wed
    [8, 17],      // Thu
    [8, 17],      // Fri
    [8, 12],      // Sat
  ];
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday",
                     "Thursday", "Friday", "Saturday"];

  const formatHour = (h) => {
    const hr = Math.floor(h);
    const min = Math.round((h - hr) * 60);
    const period = hr >= 12 ? "PM" : "AM";
    const h12 = ((hr + 11) % 12) + 1;
    return min === 0
      ? `${h12} ${period}`
      : `${h12}:${min.toString().padStart(2, "0")} ${period}`;
  };

  // Get "now" in America/Chicago so it's accurate no matter where the
  // visitor is. Intl.DateTimeFormat is the honest way to do this.
  const nowInChicago = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: weekdayMap[lookup.weekday],
      hourDecimal: Number(lookup.hour) + Number(lookup.minute) / 60,
    };
  };

  const computeStatus = () => {
    const { day, hourDecimal } = nowInChicago();
    const today = HOURS[day];

    if (today && hourDecimal >= today[0] && hourDecimal < today[1]) {
      return {
        open: true,
        text: `Open now · closes ${formatHour(today[1])}`,
      };
    }

    // Figure out the next opening.
    // Opening later today?
    if (today && hourDecimal < today[0]) {
      return {
        open: false,
        text: `Closed · opens today at ${formatHour(today[0])}`,
      };
    }
    // Otherwise find the next open day.
    for (let i = 1; i <= 7; i++) {
      const next = HOURS[(day + i) % 7];
      if (next) {
        const nextName = DAY_NAMES[(day + i) % 7];
        const label = i === 1 ? "tomorrow" : nextName;
        return {
          open: false,
          text: `Closed · opens ${label} at ${formatHour(next[0])}`,
        };
      }
    }
    return { open: false, text: "Closed" };
  };

  const applyStatus = () => {
    const status = computeStatus();
    document.querySelectorAll("[data-live-status]").forEach((el) => {
      el.classList.toggle("is-open", status.open);
      el.classList.toggle("is-closed", !status.open);
      const textEl = el.querySelector("[data-status-text]");
      if (textEl) textEl.textContent = status.text;
    });
  };

  applyStatus();
  // Re-check every minute so the indicator stays honest.
  setInterval(applyStatus, 60 * 1000);
})();
