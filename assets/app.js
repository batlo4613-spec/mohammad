const LOCALE_KEY = "horizonLocale";
const SAVED_KEY = "horizonSavedProperties";

let locale = "en";
try { if (localStorage.getItem(LOCALE_KEY) === "fa") locale = "fa"; } catch (e) {}

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const img = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;
const isRtl = () => locale === "fa";
const fmt = (n) => Number(n).toLocaleString(isRtl() ? "fa-IR" : "en-US");
const fmtYear = (n) => Number(n).toLocaleString(isRtl() ? "fa-IR" : "en-US", { useGrouping: false });
const typeName = (id) => ((TYPES.find((x) => x.id === id) || {})[locale] || id);

function t(key, vars) {
  let s = (I18N[locale] && I18N[locale][key]) || I18N.en[key] || "";
  if (vars) Object.keys(vars).forEach((k) => { s = s.split(`{${k}}`).join(vars[k]); });
  return s;
}

const header = $("#header"), nav = $("#navLinks"), menuToggle = $("#menuToggle"), homeView = $("#homeView"), propertiesView = $("#propertiesView"), footer = $("#siteFooter"), track = $("#featuredTrack"), propertyModal = $("#propertyModal"), contactModal = $("#contactModal"), toast = $("#toast");

let saved = new Set();
try { saved = new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]")); } catch (e) { saved = new Set(); }

let activeProperty = null, activeGalleryIndex = 0, lastFocused = null, toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ---- locale ---- */

function applyI18n() {
  $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  $$("[data-i18n-alt]").forEach((el) => el.setAttribute("alt", t(el.dataset.i18nAlt)));
  $$("[data-i18n-placeholder]").forEach((el) => el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder)));
  $$("[data-i18n-content]").forEach((el) => el.setAttribute("content", t(el.dataset.i18nContent)));
}

function renderLangSwitch() {
  $$(".lang-switch button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.lang === locale));
    b.setAttribute("aria-label", b.dataset.lang === "en" ? t("lang.switchEn") : t("lang.switchFa"));
  });
}

function setLocale(next) {
  locale = next === "fa" ? "fa" : "en";
  try { localStorage.setItem(LOCALE_KEY, locale); } catch (e) {}
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtl() ? "rtl" : "ltr";
  document.title = t("meta.title");
  $("#year").textContent = fmtYear(new Date().getFullYear());
  applyI18n();
  renderLangSwitch();
  renderFilters();
  renderFeatured();
  renderListings();
  if (activeProperty && propertyModal.classList.contains("open")) renderPropertyModal();
}

/* ---- filters ---- */

function readFilters() {
  return {
    q: $("#searchText").value.trim().toLowerCase(),
    city: $("#locationFilter").value,
    type: $("#typeFilter").value,
    max: Number($("#priceFilter").value) || Infinity,
    sort: $("#sortFilter").value
  };
}

function fillSelect(sel, items, placeholder, selected) {
  sel.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : "") +
    items.map((i) => `<option value="${i.id}">${i[locale]}</option>`).join("");
  if (selected && [...sel.options].some((o) => o.value === selected)) sel.value = selected;
}

function renderFilters() {
  const f = readFilters();
  fillSelect($("#locationFilter"), CITIES, t("properties.allLocations"), f.city);
  fillSelect($("#typeFilter"), TYPES, t("properties.allTypes"), f.type);
  fillSelect($("#priceFilter"), PRICE_STEPS, t("properties.anyPrice"), f.max === Infinity ? "" : String(f.max));
  fillSelect($("#sortFilter"), SORT_OPTIONS, "", f.sort || "featured");
}

/* ---- renders ---- */

function renderFeatured() {
  const ordered = PROPERTY_DATA.filter((p) => p.featured).concat(PROPERTY_DATA.filter((p) => !p.featured));
  track.innerHTML = ordered.map((p, i) => `<article class="property-card ${i === 0 ? "primary" : ""}"><img src="${img(p.image, 760)}" alt="${p.name}" loading="lazy"><div class="property-info"><div><h3>${p.name}</h3><p><span class="pin">⌖</span>${p.location[locale]}</p></div><span class="price">${p.priceLabel[locale]}</span></div><button class="property-open" data-open-property="${p.id}" aria-label="${t("featured.openAria", { name: p.name })}">${t("featured.open")}</button></article>`).join("");
}

function cardMarkup(p) {
  const isSaved = saved.has(p.id);
  return `<article class="listing-card"><div class="listing-image"><img loading="lazy" src="${img(p.image, 850)}" alt="${p.name}"><button class="favorite ${isSaved ? "saved" : ""}" data-favorite="${p.id}" aria-label="${isSaved ? t("favorite.removeAria") : t("favorite.saveAria")}" aria-pressed="${isSaved}">${isSaved ? "♥" : "♡"}</button></div><div class="listing-details"><h3>${p.name}</h3><p class="loc">⌖ ${p.location[locale]} · ${typeName(p.type)}</p><div class="listing-bottom"><strong>${p.priceLabel[locale]}</strong><button data-open-property="${p.id}"><span>${t("featured.viewDetails")}</span> <span class="arrow">${t("arrow.next")}</span></button></div><p class="loc" style="margin:11px 0 0">${fmt(p.beds)} ${t("detail.bedrooms")} &nbsp;·&nbsp; ${fmt(p.baths)} ${t("detail.bathrooms")} &nbsp;·&nbsp; ${fmt(p.sqft)} ${t("detail.sqft")}</p></div></article>`;
}

function searchHaystack(p) {
  return `${p.name} ${p.location.en} ${p.location.fa} ${p.city} ${p.type} ${typeName(p.type)}`.toLowerCase();
}

function renderListings() {
  const f = readFilters();
  let list = PROPERTY_DATA.filter((p) =>
    (!f.q || searchHaystack(p).includes(f.q)) &&
    (!f.city || p.city === f.city) &&
    (!f.type || p.type === f.type) &&
    p.price <= f.max
  );
  if (f.sort === "low") list.sort((a, b) => a.price - b.price);
  if (f.sort === "high") list.sort((a, b) => b.price - a.price);

  const key = list.length === 1 ? "properties.resultsOne" : "properties.results";
  $("#resultsCount").textContent = t(key, { count: fmt(list.length) });
  $("#listingGrid").innerHTML = list.length
    ? list.map(cardMarkup).join("")
    : `<div style="grid-column:1/-1;text-align:center;padding:55px 15px"><p class="eyebrow">${t("properties.emptyEyebrow")}</p><h2 class="section-title">${t("properties.emptyTitle")}</h2><p class="section-copy">${t("properties.emptyCopy")}</p><button class="btn" id="clearFilters">${t("properties.clear")}</button></div>`;
}

/* ---- views ---- */

function openProperties() {
  homeView.hidden = true;
  propertiesView.hidden = false;
  footer.style.display = "block";
  closeMenu();
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderFilters();
  renderListings();
  $$(".nav-links a").forEach((a) => a.classList.toggle("active", a.dataset.view === "properties"));
}

function openHome(hash = "#home") {
  propertiesView.hidden = true;
  homeView.hidden = false;
  footer.style.display = "block";
  closeMenu();
  $$(".nav-links a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === hash));
  setTimeout(() => {
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 20);
}

function closeMenu() {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", t("nav.menu.open"));
  menuToggle.textContent = "☰";
  document.body.classList.remove("menu-open");
}

/* ---- modals ---- */

function openContact() {
  lastFocused = document.activeElement;
  contactModal.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => contactModal.querySelector("input")?.focus(), 50);
}

function closeContact() {
  contactModal.classList.remove("open");
  document.body.style.overflow = "";
  lastFocused?.focus();
}

function openProperty(id) {
  const p = PROPERTY_DATA.find((x) => x.id === Number(id));
  if (!p) return;
  activeProperty = p;
  activeGalleryIndex = 0;
  lastFocused = document.activeElement;
  renderPropertyModal();
  propertyModal.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#modalContent .modal-close").focus();
}

function renderPropertyModal() {
  const p = activeProperty;
  const isSaved = saved.has(p.id);
  $("#modalContent").innerHTML = `<button class="modal-close" data-close-property aria-label="${t("detail.closeAria")}">×</button><div class="modal-gallery"><img id="galleryMain" src="${img(p.gallery[activeGalleryIndex], 1300)}" alt="${t("detail.photoAria", { name: p.name, n: fmt(activeGalleryIndex + 1) })}"><div class="gallery-nav"><button data-gallery-step="-1" aria-label="${t("detail.prevPhotoAria")}">${t("arrow.prev")}</button><button data-gallery-step="1" aria-label="${t("detail.nextPhotoAria")}">${t("arrow.next")}</button></div></div><div class="gallery-thumbs">${p.gallery.map((g, i) => `<button class="${i === activeGalleryIndex ? "active" : ""}" data-gallery-index="${i}" aria-label="${t("detail.thumbAria", { n: fmt(i + 1) })}"><img src="${img(g, 180)}" alt=""></button>`).join("")}</div><div class="modal-content"><div class="detail-top"><div><p class="eyebrow">${typeName(p.type)}</p><h2>${p.name}</h2><p class="detail-location">⌖ ${p.location[locale]}</p></div><div class="detail-price">${p.priceLabel[locale]}</div></div><div class="detail-stats"><span><strong>${fmt(p.beds)}</strong> ${t("detail.bedrooms")}</span><span><strong>${fmt(p.baths)}</strong> ${t("detail.bathrooms")}</span><span><strong>${fmt(p.sqft)}</strong> ${t("detail.sqft")}</span><span><strong>${t("detail.forSale")}</strong></span></div><div class="detail-body"><div><h3>${t("detail.about")}</h3><p>${p.desc[locale]}</p><h3>${t("detail.highlights")}</h3><div class="features">${p.features[locale].map((f) => `<span>${f}</span>`).join("")}</div><h3>${t("detail.viewing")}</h3><p>${t("detail.viewingCopy")}</p></div><aside class="agent-box"><h3>Horizon Properties</h3><p>${t("detail.agent")}<br>hello@horizonproperties.com</p><button class="btn" data-viewing="${p.id}">${t("detail.schedule")} <span class="arrow">${t("arrow.next")}</span></button><button class="btn btn-light" data-favorite="${p.id}" aria-pressed="${isSaved}">${isSaved ? t("detail.saved") : t("detail.save")}</button><a class="btn btn-light" href="tel:+15552467890"><span>${t("call.phoneLabel")}</span> <span dir="ltr">(555) 246-7890</span></a></aside></div></div>`;
}

function closeProperty() {
  propertyModal.classList.remove("open");
  document.body.style.overflow = "";
  lastFocused?.focus();
}

/* ---- favourites ---- */

function toggleFavorite(id) {
  id = Number(id);
  if (saved.has(id)) {
    saved.delete(id);
    showToast(t("toast.removed"));
  } else {
    saved.add(id);
    showToast(t("toast.saved"));
  }
  try { localStorage.setItem(SAVED_KEY, JSON.stringify([...saved])); } catch (e) {}
  if (!propertiesView.hidden) renderListings();
  if (activeProperty?.id === id && propertyModal.classList.contains("open")) renderPropertyModal();
}

/* ---- wiring ---- */

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 35);
  if (!propertiesView.hidden) return;
  let current = "#home";
  ["about", "featured", "services", "team", "contact"].forEach((id) => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 140) current = "#" + id;
  });
  $$(".nav-links a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === current));
}, { passive: true });

menuToggle.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? t("nav.menu.close") : t("nav.menu.open"));
  menuToggle.textContent = open ? "×" : "☰";
  document.body.classList.toggle("menu-open", open);
});

$$(".lang-switch button").forEach((b) => b.addEventListener("click", () => setLocale(b.dataset.lang)));

document.addEventListener("click", (e) => {
  const view = e.target.closest("[data-view='properties']");
  if (view) { e.preventDefault(); openProperties(); return; }
  const open = e.target.closest("[data-open-property]");
  if (open) { e.preventDefault(); openProperty(open.dataset.openProperty); return; }
  const fav = e.target.closest("[data-favorite]");
  if (fav) { e.preventDefault(); toggleFavorite(fav.dataset.favorite); return; }
  if (e.target.closest("[data-contact]")) { openContact(); return; }
  const viewing = e.target.closest("[data-viewing]");
  if (viewing) {
    const p = PROPERTY_DATA.find((x) => x.id === Number(viewing.dataset.viewing));
    closeProperty();
    openContact();
    contactModal.querySelector("select").value = "viewing";
    contactModal.querySelector("textarea").value = t("contact.viewingMessage", { name: p.name });
    return;
  }
  if (e.target.closest("[data-close-property]")) { closeProperty(); return; }
  if (e.target.closest("[data-close-contact]")) { closeContact(); return; }
  const step = e.target.closest("[data-gallery-step]");
  if (step) {
    activeGalleryIndex = (activeGalleryIndex + Number(step.dataset.galleryStep) + activeProperty.gallery.length) % activeProperty.gallery.length;
    renderPropertyModal();
    return;
  }
  const thumb = e.target.closest("[data-gallery-index]");
  if (thumb) { activeGalleryIndex = Number(thumb.dataset.galleryIndex); renderPropertyModal(); return; }
  if (e.target.id === "clearFilters") { $("#searchForm").reset(); renderListings(); }
});

propertyModal.addEventListener("click", (e) => { if (e.target === propertyModal) closeProperty(); });
contactModal.addEventListener("click", (e) => { if (e.target === contactModal) closeContact(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (propertyModal.classList.contains("open")) closeProperty();
    if (contactModal.classList.contains("open")) closeContact();
    closeMenu();
  }
  if (propertyModal.classList.contains("open") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    const forward = isRtl() ? e.key === "ArrowLeft" : e.key === "ArrowRight";
    activeGalleryIndex = (activeGalleryIndex + (forward ? 1 : -1) + activeProperty.gallery.length) % activeProperty.gallery.length;
    renderPropertyModal();
  }
});

/* carousel: one scroll direction, mirrored for right-to-left */
const stepPx = (amount) => (isRtl() ? -amount : amount);
$("#prevProperties").addEventListener("click", () => track.scrollBy({ left: stepPx(-track.clientWidth * 0.72), behavior: "smooth" }));
$("#nextProperties").addEventListener("click", () => track.scrollBy({ left: stepPx(track.clientWidth * 0.72), behavior: "smooth" }));

let dragStart = null;
track.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse") return;
  dragStart = { x: e.clientX, left: track.scrollLeft };
  track.classList.add("dragging");
});
window.addEventListener("pointerup", () => { dragStart = null; track.classList.remove("dragging"); });
track.addEventListener("pointermove", (e) => {
  if (!dragStart) return;
  const moved = e.clientX - dragStart.x;
  track.scrollLeft = dragStart.left + (isRtl() ? moved : -moved);
});
track.addEventListener("keydown", (e) => {
  const forward = isRtl() ? "ArrowLeft" : "ArrowRight";
  const back = isRtl() ? "ArrowRight" : "ArrowLeft";
  if (e.key === forward) track.scrollBy({ left: stepPx(240), behavior: "smooth" });
  if (e.key === back) track.scrollBy({ left: stepPx(-240), behavior: "smooth" });
});

$("#aboutNext").addEventListener("click", () => {
  const side = $(".about-side img");
  const srcs = ["photo-1600566753086-00f18fb6b3ea", "photo-1600607687644-c7171b42498f", "photo-1600566753190-17f0baa2a6c3"];
  let idx = Number(side.dataset.idx || 0);
  idx = (idx + 1) % srcs.length;
  side.dataset.idx = idx;
  side.src = img(srcs[idx], 500);
});

$("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); renderListings(); });
$("#backHome").addEventListener("click", () => openHome("#home"));
$$(".nav-links a[href^='#']:not([data-view])").forEach((a) => a.addEventListener("click", (e) => {
  if (!propertiesView.hidden) { e.preventDefault(); openHome(a.getAttribute("href")); }
}));

/* neither form has a backend yet, so both say so plainly instead of pretending */
$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#contactMessage").textContent = t("form.notSent");
  showToast(t("form.notSentToast"));
});
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#newsletterMessage").textContent = t("form.newsletterNotSent");
});

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
}), { threshold: 0.12 });
$$(".reveal").forEach((el) => observer.observe(el));

setLocale(locale);
