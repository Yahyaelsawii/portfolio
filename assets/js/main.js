/**
 * Inject navbar/footer components.
 * IMPORTANT: This requires serving files over http(s) (e.g. VS Code Live Server).
 * Opening the HTML as file:// may block fetch(), which makes the navbar/footer "disappear".
 */

async function injectComponent(targetId, url) {
  const mount = document.getElementById(targetId);
  if (!mount) return;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    mount.innerHTML = await res.text();
  } catch (err) {
    // graceful fallback so you immediately know why it's missing
    mount.innerHTML = `
      <div class="max-w-[1280px] mx-auto px-6 py-4 text-sm text-red-600">
        Component failed to load: <b>${url}</b>.<br/>
        If you're opening the file directly (file://), use a local server (VS Code "Live Server").
      </div>`;
    console.error("Component load failed:", url, err);
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

document.addEventListener("DOMContentLoaded", async () => {
  await injectComponent("site-navbar", "components/navbar.html");
  await injectComponent("site-footer", "components/footer.html");
  setActiveNav();
  setYear();
});
