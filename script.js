/* =========================
   GLOBAL REFERENCES
========================= */
const root = document.documentElement;
const body = document.body;
const hero = document.getElementById("hero");

/* =========================
   UTILITY HELPERS
========================= */
function lockBodyScroll() {
  body.classList.add("modal-open");
}

function unlockBodyScroll() {
  body.classList.remove("modal-open");
}

function closeOnEscape(isOpen, onClose) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      onClose();
    }
  });
}

/* =========================
   ACTIVE NAV STATE
========================= */
function setActiveNav() {
  const currentPage = body?.dataset?.page;
  if (!currentPage) return;

  const navLinks = document.querySelectorAll(
    ".nav-links a, .mobile-menu a, .bottom-nav-right a"
  );

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";

    const isActive =
      (currentPage === "home" && href === "index.html") ||
      (currentPage === "about" && href === "about.html") ||
      (currentPage === "cyber" && href === "cyber.html") ||
      (currentPage === "art" && href === "art.html") ||
      (currentPage === "contact" && href === "contact.html");

    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

/* =========================
   EXTERNAL LINK SECURITY
========================= */
function hardenExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    const rel = link.getAttribute("rel") || "";
    const parts = new Set(rel.split(/\s+/).filter(Boolean));
    parts.add("noopener");
    parts.add("noreferrer");
    link.setAttribute("rel", Array.from(parts).join(" "));
  });
}

/* =========================
   PAGE READY / LEAVING
========================= */
function initPageState() {
  function enterPage() {
    body.classList.remove("page-leaving");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.add("page-ready");
      });
    });
  }

  window.addEventListener("load", enterPage);

  window.addEventListener("pageshow", (e) => {
    body.classList.remove("page-leaving");

    if (e.persisted) {
      body.classList.add("page-ready");
    } else {
      enterPage();
    }
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.hasAttribute("target")
    ) {
      return;
    }

    const url = new URL(link.href, window.location.href);

    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash === window.location.hash) return;

    link.addEventListener("click", (e) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return;
      }

      body.classList.remove("menu-open");
      body.classList.remove("page-ready");
      body.classList.add("page-leaving");

      e.preventDefault();

      window.setTimeout(() => {
        window.location.href = link.href;
      }, 450);
    });
  });
}

/* =========================
   MOBILE NAV MENU
========================= */
function initMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");

  if (!toggle || !menu) return;

  function closeMenu() {
    body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    const isOpen = body.classList.contains("menu-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) {
      closeMenu();
    }
  });
}

/* =========================
   LANDING PAGE INTRO
========================= */
function initLandingIntro() {
  if (!hero || body.dataset.page !== "home") return;

  root.style.setProperty("--split", "50%");

  requestAnimationFrame(() => {
    body.classList.add("intro-start");
  });

  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  if (isMobile) return;

  let targetSplit = 50;
  let currentSplit = 50;
  let rafId = null;
  let isTouching = false;
  let introComplete = false;

  function animateSplit() {
    currentSplit += (targetSplit - currentSplit) * 0.09;
    root.style.setProperty("--split", `${currentSplit}%`);

    if (Math.abs(targetSplit - currentSplit) > 0.05) {
      rafId = requestAnimationFrame(animateSplit);
    } else {
      currentSplit = targetSplit;
      root.style.setProperty("--split", `${currentSplit}%`);
      rafId = null;
    }
  }

  function startSplitAnimation() {
    if (!rafId) {
      rafId = requestAnimationFrame(animateSplit);
    }
  }

  function getInvertedSplit(x, width, min = 18, max = 82) {
    const percent = 100 - (x / width) * 100;
    return Math.max(min, Math.min(max, percent));
  }

  window.setTimeout(() => {
    introComplete = true;
  }, 1100);

  hero.addEventListener("mousemove", (e) => {
    if (!introComplete || isTouching) return;

    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;

    targetSplit = getInvertedSplit(x, rect.width, 18, 82);
    startSplitAnimation();
  });

  hero.addEventListener("mouseleave", () => {
    if (!introComplete) return;
    targetSplit = 50;
    startSplitAnimation();
  });

  hero.addEventListener("touchstart", () => {
    if (!introComplete) return;
    isTouching = true;
  });

  hero.addEventListener("touchmove", (e) => {
    if (!introComplete) return;

    const rect = hero.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;

    targetSplit = getInvertedSplit(x, rect.width, 15, 85);
    startSplitAnimation();
  });

  hero.addEventListener("touchend", () => {
    if (!introComplete) return;
    isTouching = false;
    targetSplit = 50;
    startSplitAnimation();
  });
}

/* =========================
   NAV HIDE / SHOW ON SCROLL
========================= */
function initNavScrollBehavior() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  let lastScrollY = window.scrollY;
  body.classList.add("nav-visible");

  window.addEventListener(
    "scroll",
    () => {
      const current = window.scrollY;

      if (body.classList.contains("menu-open")) return;

      if (current <= 10) {
        body.classList.remove("nav-hidden");
        body.classList.add("nav-visible");
        lastScrollY = current;
        return;
      }

      if (current > lastScrollY) {
        body.classList.add("nav-hidden");
        body.classList.remove("nav-visible");
      } else {
        body.classList.remove("nav-hidden");
        body.classList.add("nav-visible");
      }

      lastScrollY = current;
    },
    { passive: true }
  );
}

/* =========================
   PROJECT + ART FILTERS
========================= */
function initProjectFilters() {
  const filterGroups = document.querySelectorAll(".filter-pills");
  if (!filterGroups.length) return;

  filterGroups.forEach((group) => {
    const buttons = group.querySelectorAll(".filter-pill");
    if (!buttons.length) return;

    const cards = group.classList.contains("art-filter-pills")
      ? document.querySelectorAll(".art-card")
      : document.querySelectorAll(".project-card-simple");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = (button.dataset.filter || "all").toLowerCase();

        buttons.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        cards.forEach((card) => {
          const categories = (card.dataset.category || "")
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

          const shouldShow = filter === "all" || categories.includes(filter);
          card.style.display = shouldShow ? "block" : "none";
        });
      });
    });
  });
}

/* =========================
   PROJECT MODAL
========================= */
function initProjectModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;

  const modalImg = document.getElementById("projectModalImage");
  const modalTitle = document.getElementById("projectModalTitle");
  const modalDesc = document.getElementById("projectModalDesc");
  const modalLink = document.getElementById("projectModalLink");
  const closeBtn = modal.querySelector(".project-modal-close");
  const backdrop = modal.querySelector(".project-modal-backdrop");

  function openModal(card) {
    if (modalImg) {
      modalImg.src = card.dataset.img || "";
      modalImg.alt = card.dataset.title || "Project image";
    }
    if (modalTitle) modalTitle.textContent = card.dataset.title || "";
    if (modalDesc) modalDesc.textContent = card.dataset.desc || "";
    if (modalLink) modalLink.href = card.dataset.link || "#";

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    lockBodyScroll();
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
  }

  document.querySelectorAll(".project-card-simple").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".project-link")) return;
      openModal(card);
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  closeOnEscape(() => modal.classList.contains("active"), closeModal);
}

/* =========================
   CERT MODAL
========================= */
function initCertModal() {
  const modal = document.getElementById("certModal");
  if (!modal) return;

  const modalImage = document.getElementById("certModalImage");
  const modalTitle = document.getElementById("certModalTitle");
  const modalDesc = document.getElementById("certModalDesc");
  const modalBadgeLink =
    document.getElementById("certModalLink") ||
    document.getElementById("certModalCredly");
  const modalPDF = document.getElementById("certModalPDF");
  const closeButton = modal.querySelector(".cert-modal-close");
  const backdrop = modal.querySelector(".cert-modal-backdrop");
  const badgeItems = document.querySelectorAll(".badge-logo-item");

  function openModal(item) {
    const title = item.dataset.title || "Certification";
    const desc = item.dataset.desc || "";
    const img = item.dataset.img || "";
    const badgeHref =
      item.dataset.link || item.dataset.credly || item.getAttribute("href") || "#";
    const pdf = item.dataset.pdf || "#";

    if (modalImage) {
      modalImage.src = img;
      modalImage.alt = `${title} badge`;
    }

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalBadgeLink) modalBadgeLink.href = badgeHref;
    if (modalPDF) modalPDF.href = pdf;

    modal.classList.add("active", "is-open");
    modal.setAttribute("aria-hidden", "false");
    lockBodyScroll();
  }

  function closeModal() {
    modal.classList.remove("active", "is-open");
    modal.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
  }

  badgeItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(item);
    });
  });

  if (closeButton) closeButton.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  closeOnEscape(
    () => modal.classList.contains("active") || modal.classList.contains("is-open"),
    closeModal
  );
}

/* =========================
   ART MODAL
========================= */
function initArtModal() {
  const modal = document.getElementById("artModal");
  if (!modal) return;

  const modalImg = document.getElementById("artModalImage");
  const modalTitle = document.getElementById("artModalTitle");
  const modalDesc = document.getElementById("artModalDesc");
  const modalMedium = document.getElementById("artModalMedium");
  const closeBtn = modal.querySelector(".art-modal-close");
  const backdrop = modal.querySelector(".art-modal-backdrop");

  function openModal(card) {
    if (modalImg) {
      modalImg.src = card.dataset.img || "";
      modalImg.alt = card.dataset.title || "Artwork";
    }
    if (modalTitle) modalTitle.textContent = card.dataset.title || "";
    if (modalDesc) modalDesc.textContent = card.dataset.desc || "";
    if (modalMedium) modalMedium.textContent = card.dataset.medium || "";

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    lockBodyScroll();
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
  }

  document.querySelectorAll(".art-card").forEach((card) => {
    card.addEventListener("click", () => {
      openModal(card);
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  closeOnEscape(() => modal.classList.contains("active"), closeModal);

  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".art-gallery-section, .art-modal")) {
      e.preventDefault();
    }
  });
}

/* =========================
   APP INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  hardenExternalLinks();
  setActiveNav();
  initPageState();
  initMobileMenu();
  initLandingIntro();
  initNavScrollBehavior();
  initProjectFilters();
  initProjectModal();
  initCertModal();
  initArtModal();
});
