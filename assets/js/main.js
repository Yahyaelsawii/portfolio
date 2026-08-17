/**
 * Inject navbar/footer components.
 * IMPORTANT: This requires serving files over http(s) (e.g. VS Code Live Server).
 * Opening the HTML as file:// may block fetch(), which makes the navbar/footer "disappear".
 */

async function injectComponent(targetId, url) {
  const mount = document.getElementById(targetId);
  if (!mount) {
    console.warn(`[Component Injection] Target element #${targetId} not found`);
    return;
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      method: "GET",
      headers: { "Accept": "text/html" }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    if (!html || html.trim().length === 0) {
      throw new Error("Empty response received");
    }

    mount.innerHTML = html;

    // Re-initialize any scripts or event listeners in the injected component
    const scripts = mount.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

  } catch (err) {
    const errorMsg = err instanceof TypeError && err.message.includes("Failed to fetch")
      ? "Network error: Unable to fetch component. Ensure you're using a local server (e.g., VS Code Live Server)."
      : err.message || "Unknown error occurred";

    mount.innerHTML = `
      <div class="max-w-[1280px] mx-auto px-6 py-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
        <strong>Component failed to load:</strong> ${url}<br/>
        <span class="text-xs mt-1 block">${errorMsg}</span>
        <span class="text-xs mt-2 block text-gray-600">If opening directly (file://), use a local server.</span>
      </div>`;
    console.error("[Component Injection] Failed to load:", url, err);

    // Dispatch custom event for error tracking
    window.dispatchEvent(new CustomEvent("componentLoadError", {
      detail: { targetId, url, error: err.message }
    }));
  }
}

function setActiveNav() {
  const page = document.body?.dataset?.page;
  if (!page) return;

  const activeClasses = ["font-bold", "text-primary"];
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const key = a.getAttribute("data-nav");
    if (key === page) {
      a.classList.add(...activeClasses);
      a.setAttribute("aria-current", "page");
    } else {
      a.classList.remove(...activeClasses);
      a.removeAttribute("aria-current");
    }
  });
}

function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

/**
 * Mobile menu (slide down/up) for the navbar version that uses:
 * #mobileMenuBtn, #mobileMenuIcon, #mobileMenuPanel
 */
function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const icon = document.getElementById("mobileMenuIcon");
  const panel = document.getElementById("mobileMenuPanel");

  if (!btn || !panel) return;

  const open = () => {
    panel.classList.remove("max-h-0", "opacity-0");
    panel.classList.add("max-h-screen", "opacity-100");

    btn.setAttribute("aria-expanded", "true");
    if (icon) icon.textContent = "close";
  };

  const close = () => {
    panel.classList.add("max-h-0", "opacity-0");
    panel.classList.remove("max-h-screen", "opacity-100");

    btn.setAttribute("aria-expanded", "false");
    if (icon) icon.textContent = "menu";
  };

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? close() : open();
  });

  // links close menu
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // resize safety
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) close();
  });
}

function initScrollTopButton() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  const show = () => {
    btn.classList.remove("opacity-0", "pointer-events-none", "translate-y-3", "scale-95");
    btn.classList.add("opacity-100", "translate-y-0", "scale-100");
  };

  const hide = () => {
    btn.classList.add("opacity-0", "pointer-events-none", "translate-y-3", "scale-95");
    btn.classList.remove("opacity-100", "translate-y-0", "scale-100");
  };

  const onScroll = () => {
    if (window.scrollY > 350) show();
    else hide();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
function initImageLightbox() {
  const box = document.getElementById("imgLightbox");
  const img = document.getElementById("imgLightboxImg");
  const title = document.getElementById("imgLightboxTitle");
  const openNew = document.getElementById("imgLightboxOpenNew");

  // If the lightbox markup isn't on this page, do nothing safely.
  if (!box || !img || !title || !openNew) return;

  function openLightbox(src, altText) {
    img.src = src;
    img.alt = altText || "Expanded image";
    title.textContent = altText || "Preview";
    openNew.href = src;

    box.classList.remove("hidden");
    box.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
  }

  function closeLightbox() {
    box.classList.add("hidden");
    box.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");

    img.src = "";
    img.alt = "";
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-expand-img]");
    if (btn) {
      const src = btn.getAttribute("data-src");
      const altText = btn.getAttribute("data-alt") || "Preview";
      if (src) openLightbox(src, altText);
      return;
    }

    if (e.target.closest("[data-close]")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.classList.contains("hidden")) {
      closeLightbox();
    }
  });
}
function initProjectsAutoScroll() {
  const track = document.getElementById("projectsTrack");
  const dotsWrap = document.getElementById("projectsDots");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".projectCard"));
  if (cards.length < 3) return; // needs at least 3 cards to do 1+2 then 2+3

  let index = 0;
  let timer = null;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const getGap = () => {
    const cs = getComputedStyle(track);
    // On mobile it's flex, so `gap` is the one we want
    return parseFloat(cs.gap || "0") || 0;
  };

  // Build dots = (cards - 1) positions => [0,1] for 3 cards
  dotsWrap.innerHTML = "";
  for (let i = 0; i < cards.length - 1; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "h-2.5 w-2.5 rounded-full transition-all " +
      (i === 0 ? "bg-primary w-6" : "bg-gray-300/70");

    btn.addEventListener("click", () => {
      index = i;
      render();
      restart();
    });

    dotsWrap.appendChild(btn);
  }

  const render = () => {
    if (!isMobile()) {
      // desktop: grid, no translate
      track.style.transform = "translateX(0px)";
      return;
    }

    // recalc each time (safer on load/resize)
    const step = cards[0].offsetWidth + getGap();
    track.style.transform = `translateX(-${index * step}px)`;

    [...dotsWrap.children].forEach((dot, i) => {
      dot.className =
        "h-2.5 w-2.5 rounded-full transition-all " +
        (i === index ? "bg-primary w-6" : "bg-gray-300/70");
    });
  };

  const next = () => {
    if (!isMobile()) return;
    index = (index + 1) % (cards.length - 1); // for 3 cards => toggles 0 <-> 1
    render();
  };

  const prev = () => {
    if (!isMobile()) return;
    index = (index - 1 + (cards.length - 1)) % (cards.length - 1);
    render();
  };

  const start = () => (timer = setInterval(next, 6000));
  const stop = () => timer && clearInterval(timer);
  const restart = () => {
    stop();
    start();
  };

  // Touch gesture support
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isDragging = true;
    stop();
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
  }, { passive: false });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
    isDragging = false;
    restart();
  }, { passive: true });

  window.addEventListener("resize", () => {
    // keep current slide if still mobile; otherwise reset visual
    if (!isMobile()) index = 0;
    render();
    restart();
  });

  render();
  start();
}

function initFinalUiCarousel() {
  const track = document.getElementById("finalUiTrack");
  const dotsWrap = document.getElementById("finalUiDots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll(".finalUiSlide"));
  if (slides.length < 2) return;

  let index = 0;
  let timer = null;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const getGap = () => {
    const cs = getComputedStyle(track);
    return parseFloat(cs.gap || cs.columnGap || "0") || 0;
  };

  const getStep = () => slides[0].offsetWidth + getGap();

  // Build dots = one per slide (1-at-a-time)
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "h-2.5 w-2.5 rounded-full transition-all " +
      (i === 0 ? "bg-primary w-6" : "bg-gray-300/70");

    btn.addEventListener("click", () => {
      index = i;
      render();
      restart();
    });

    dotsWrap.appendChild(btn);
  });

  const render = () => {
    if (!isMobile()) {
      track.style.transform = "translateX(0px)";
      return;
    }

    const moveX = index * getStep();
    track.style.transform = `translateX(-${moveX}px)`;

    [...dotsWrap.children].forEach((dot, i) => {
      dot.className =
        "h-2.5 w-2.5 rounded-full transition-all " +
        (i === index ? "bg-primary w-6" : "bg-gray-300/70");
    });
  };

  const next = () => {
    if (!isMobile()) return;
    index = (index + 1) % slides.length;
    render();
  };

  const prev = () => {
    if (!isMobile()) return;
    index = (index - 1 + slides.length) % slides.length;
    render();
  };

  const start = () => (timer = setInterval(next, 6000));
  const stop = () => timer && clearInterval(timer);
  const restart = () => {
    stop();
    start();
  };

  // Touch gesture support
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isDragging = true;
    stop();
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
  }, { passive: false });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
    isDragging = false;
    restart();
  }, { passive: true });

  window.addEventListener("resize", () => {
    index = 0;
    render();
    restart();
  });

  render();
  start();
}

function initEmailsCarousel() {
  const track = document.getElementById("emailsTrack");
  const dotsWrap = document.getElementById("emailsDots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll(".emailSlide"));
  if (slides.length < 2) return;

  let index = 0;
  let timer = null;
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const getGap = () => {
    const cs = getComputedStyle(track);
    return parseFloat(cs.gap || cs.columnGap || "0") || 0;
  };

  const getStep = () => slides[0].offsetWidth + getGap();

  // Dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "h-2.5 w-2.5 rounded-full transition-all " +
      (i === 0 ? "bg-primary w-6" : "bg-gray-300/70");

    btn.addEventListener("click", () => {
      index = i;
      render();
      restart();
    });

    dotsWrap.appendChild(btn);
  });

  const render = () => {
    // Desktop: leave as-is
    if (!isMobile()) {
      track.style.transform = "translateX(0px)";
      return;
    }

    const moveX = index * getStep();
    track.style.transform = `translateX(-${moveX}px)`;

    [...dotsWrap.children].forEach((dot, i) => {
      dot.className =
        "h-2.5 w-2.5 rounded-full transition-all " +
        (i === index ? "bg-primary w-6" : "bg-gray-300/70");
    });
  };

  const next = () => {
    if (!isMobile()) return;
    index = (index + 1) % slides.length;
    render();
  };

  const prev = () => {
    if (!isMobile()) return;
    index = (index - 1 + slides.length) % slides.length;
    render();
  };

  const start = () => (timer = setInterval(next, 6000));
  const stop = () => timer && clearInterval(timer);
  const restart = () => { stop(); start(); };

  // Touch gesture support
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isDragging = true;
    stop();
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
  }, { passive: false });

  track.addEventListener("touchend", (e) => {
    if (!isDragging) return;
    touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
    isDragging = false;
    restart();
  }, { passive: true });

  window.addEventListener("resize", () => {
    index = 0;
    render();
    restart();
  });

  render();
  start();
}




document.addEventListener("DOMContentLoaded", async () => {
  await injectComponent("site-navbar", "components/navbar.html");
  await injectComponent("site-footer", "components/footer.html");

  setActiveNav();
  setYear();

  initMobileMenu();
  initScrollTopButton();
  initImageLightbox();

  initProjectsAutoScroll(); // ✅ call it
  initFinalUiCarousel();
  initEmailsCarousel();

});
