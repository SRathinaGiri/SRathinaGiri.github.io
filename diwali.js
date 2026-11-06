/*
 * Diwali Mega Gift Week 2026 — one app unwraps each day at 09:00 IST.
 * Edit GIFT_WEEK.gifts to change links or copy. Everything else is automatic.
 *
 * Testing:  ?giftweek=all            → show every gift unwrapped
 *           ?giftweek=2026-11-08T10:00 → pretend it is that IST time
 */
(() => {
  "use strict";

  const GIFT_WEEK = {
    unlockHourIST: 9,
    gifts: [
      {
        date: "2026-11-06",
        festival: "Dhanteras",
        title: "Calendar App",
        kind: "Productivity · Android & Windows",
        blurb:
          "A private, offline-first calendar and daily organiser. Your data stays on your device, encrypted at rest.",
        play: null,
        download: "https://github.com/SRathinaGiri/CalendarApp/releases",
        guide: "https://github.com/SRathinaGiri/CalendarApp/blob/main/docs/USER_GUIDE.md",
        repo: "https://github.com/SRathinaGiri/CalendarApp",
      },
      {
        date: "2026-11-07",
        festival: "Naraka Chaturdashi",
        title: "65536",
        kind: "Puzzle · Browser & installable",
        blurb:
          "2048 turned upside down. Start big, split smart, and see how far down you can go.",
        play: "https://srathinagiri.github.io/65536/",
        download: null,
        repo: "https://github.com/SRathinaGiri/65536",
      },
      {
        date: "2026-11-08",
        festival: "Lakshmi Puja",
        title: "3D Fortris",
        kind: "3D puzzle · Stereoscopic",
        blurb:
          "Falling blocks in a true 3D well. Play in 2D, or in cross-eye and parallel stereo 3D.",
        play: "https://srathinagiri.github.io/3D-Fortris/",
        download: null,
        repo: "https://github.com/SRathinaGiri/3D-Fortris",
      },
      {
        date: "2026-11-09",
        festival: "Govardhan Puja · New books",
        title: "FAME",
        kind: "Accounting · Android & Windows",
        blurb:
          "Financial Accounting under Modern Environment. Open fresh books this new year, stored in an encrypted file on your own device.",
        play: null,
        download: "https://github.com/SRathinaGiri/FAME/releases",
        repo: "https://github.com/SRathinaGiri/FAME",
      },
      {
        date: "2026-11-10",
        festival: "Bhai Dooj",
        title: "3D Tunnel Rush",
        kind: "Arcade · Stereoscopic",
        blurb:
          "A high-speed neon tunnel run in 2D, parallel, cross-eye or anaglyph 3D. Challenge your sibling.",
        play: "https://srathinagiri.github.io/3DTunnelRush/",
        download: null,
        repo: "https://github.com/SRathinaGiri/3DTunnelRush",
      },
      {
        date: "2026-11-11",
        festival: "After the lamps",
        title: "3D Labyrinth",
        kind: "Tilt maze · Stereoscopic",
        blurb:
          "Tilt your phone to roll the ball through procedural 3D mazes with sliding gates.",
        play: "https://srathinagiri.github.io/3DLabyrinth/",
        download: null,
        repo: "https://github.com/SRathinaGiri/3DLabyrinth",
      },
      {
        date: "2026-11-12",
        festival: "Grand finale",
        title: "3D Shape Putter",
        kind: "Physics puzzle",
        blurb:
          "Putt generated shapes past moving obstacles across progressive levels.",
        play: "https://srathinagiri.github.io/ShapePutter/",
        download: null,
        repo: "https://github.com/SRathinaGiri/ShapePutter",
      },
    ],
  };

  const root = document.querySelector("#gift-week-grid");
  if (!root) return;

  const IST_OFFSET_MIN = 330;
  const params = new URLSearchParams(location.search);
  const override = params.get("giftweek");

  // Returns a UTC timestamp for a wall-clock time in IST.
  function istToUtc(dateStr, hour = 0, minute = 0) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return Date.UTC(y, m - 1, d, hour, minute) - IST_OFFSET_MIN * 60000;
  }

  function nowUtc() {
    if (override && override !== "all") {
      const [d, t = "00:00"] = override.split("T");
      const [h, mi] = t.split(":").map(Number);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return istToUtc(d, h || 0, mi || 0);
    }
    return Date.now();
  }

  const unlockAt = (gift) => istToUtc(gift.date, GIFT_WEEK.unlockHourIST);

  function dayLabel(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  }

  function link(href, label, cls) {
    const a = document.createElement("a");
    a.href = href;
    a.className = cls;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = label;
    return a;
  }

  function render() {
    const now = nowUtc();
    const showAll = override === "all";
    root.textContent = "";

    let todayIndex = -1;
    GIFT_WEEK.gifts.forEach((gift, i) => {
      if (showAll || now >= unlockAt(gift)) todayIndex = i;
    });

    GIFT_WEEK.gifts.forEach((gift, i) => {
      const open = showAll || now >= unlockAt(gift);
      const card = document.createElement("article");
      card.className = "gift-card " + (open ? "is-open" : "is-wrapped");
      if (open && i === todayIndex && !showAll && now < unlockAt(gift) + 86400000) {
        card.classList.add("is-today");
      }

      const top = document.createElement("div");
      top.className = "gift-top";
      top.innerHTML = `<span class="gift-day">Day ${i + 1}</span><span class="gift-date">${dayLabel(gift.date)}</span>`;
      card.appendChild(top);

      const fest = document.createElement("p");
      fest.className = "gift-festival";
      fest.textContent = gift.festival;
      card.appendChild(fest);

      if (open) {
        const h = document.createElement("h3");
        h.textContent = gift.title;
        const kind = document.createElement("p");
        kind.className = "gift-kind";
        kind.textContent = gift.kind;
        const blurb = document.createElement("p");
        blurb.className = "gift-blurb";
        blurb.textContent = gift.blurb;
        const actions = document.createElement("div");
        actions.className = "gift-actions";
        if (gift.play) actions.appendChild(link(gift.play, "Play now", "gift-btn gift-btn-primary"));
        if (gift.download) actions.appendChild(link(gift.download, "Download", "gift-btn gift-btn-primary"));
        if (gift.guide) actions.appendChild(link(gift.guide, "📖 Guide", "gift-btn"));
        actions.appendChild(link(gift.repo, "Source", "gift-btn"));
        card.append(h, kind, blurb, actions);
      } else {
        const box = document.createElement("div");
        box.className = "gift-box";
        box.setAttribute("aria-hidden", "true");
        box.innerHTML = '<span class="gift-ribbon-v"></span><span class="gift-ribbon-h"></span><span class="gift-bow"></span>';
        const h = document.createElement("h3");
        h.className = "sr-only";
        h.textContent = `Gift ${i + 1}, still wrapped`;
        const when = document.createElement("p");
        when.className = "gift-when";
        when.textContent = "Unwraps at 9 AM IST";
        card.append(box, h, when);
      }
      root.appendChild(card);
    });

    // Status line and countdown to the next gift.
    const status = document.querySelector("#gift-week-status");
    if (status) {
      const next = GIFT_WEEK.gifts.find((g) => !showAll && now < unlockAt(g));
      if (!next) {
        status.textContent = "All seven gifts are unwrapped. Happy Deepavali!";
      } else {
        const ms = unlockAt(next) - now;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const opened = GIFT_WEEK.gifts.filter((g) => now >= unlockAt(g)).length;
        status.textContent =
          `${opened} of 7 unwrapped · next gift in ` +
          (h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`);
      }
    }
  }

  render();
  if (override !== "all") setInterval(render, 60000);
})();
