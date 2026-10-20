/* Scroll-driven hero video.
 *
 * The hero clip is SCRUBBED, never played: it stays paused and muted, and the
 * reader's scroll position drives its timeline — 0% scroll = first frame,
 * 100% scroll = last frame, in both directions.
 *
 * How it works
 *  - the <video> is a plain paused element (no autoplay, no loop, no controls)
 *  - a single passive scroll listener only flags that the position moved
 *  - one requestAnimationFrame loop reads the scroll position per frame,
 *    interpolates towards the target time and writes video.currentTime only when
 *    the new time is meaningfully different from the last one written
 *  - no layout is read or written per scroll event, and no state is pushed back
 *    into the page's own code
 *
 * Encoding notes for the hero clip (assets/media/hero-scrub.mp4)
 *  - the supplied clip had only 2 keyframes across 5s, so every backward seek
 *    had to decode the whole clip. It is re-encoded with a keyframe every
 *    3 frames (125ms, 41 keyframes), which is what makes random-access seeking
 *    cheap. Frequent keyframes + H.264 High/yuv420p + no audio (-an) + no
 *    B-frames + moov at the front (+faststart) is the shape to keep for any
 *    replacement clip; the native 640x336 is deliberately not upscaled, so the
 *    file stays small enough to be held in memory instead of streamed.
 *  - the clip is fetched once and handed to the element from memory (blob URL)
 *    so scrubbing never waits on a network round trip; if that fetch fails the
 *    element streams the same file from the server instead.
 *
 * Scroll distance lives in CSS (.hero height): 300vh desktop, 240vh phones.
 */
(() => {
  "use strict";

  const hero = document.getElementById("home");
  const stage = hero && hero.querySelector(".hero-stage");
  const video = document.getElementById("heroVideo");
  const content = hero && hero.querySelector(".hero-content");
  const cue = hero && hero.querySelector(".hero-scroll");
  const progressEl = document.getElementById("heroProgress");
  const bar = progressEl && progressEl.querySelector("span");
  if (!hero || !stage || !video) return;

  const SMOOTHING = 0.26;    // share of the remaining distance caught up per 60fps frame
  const MAX_LAG = 0.35;      // seconds: never trail the scroll further than this
  const SEEK_STEP = 1 / 48;  // half a frame at 24fps — finer steps are wasted work
  const SETTLE = 0.002;      // seconds: close enough to stop the loop
  const TEXT_FADE = 0.45;    // progress at which the hero copy has faded fully
  const CUE_FADE = 0.12;     // the "discover" cue leaves early
  const END_MARGIN = 0.02;   // keeps the final seek inside the clip

  const scrub = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let duration = 0;
  let ready = false;
  let current = 0;
  let written = -1;
  let painted = -1;
  let lastFrameTime = 0;
  let frameId = 0;
  let failTimer = 0;

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  /* ---- hero copy motion (subtle: it steps back as the scene moves) ---- */

  function paint(progress) {
    if (!content || Math.abs(progress - painted) < 0.0008) return;
    painted = progress;
    const f = clamp01(progress / TEXT_FADE);
    const eased = f * f * (3 - 2 * f);
    content.style.opacity = (1 - 0.5 * eased).toFixed(3);
    content.style.transform = "translate3d(0," + (-26 * eased).toFixed(1) + "px,0)";
    if (cue) cue.style.opacity = (1 - clamp01(progress / CUE_FADE)).toFixed(3);
  }

  /* the entrance animation owns opacity/transform while it runs, so it is
     dropped once it has played out and the inline values above take over */
  if (content && scrub) {
    content.addEventListener("animationend", () => content.classList.add("live"), { once: true });
    setTimeout(() => content.classList.add("live"), 1500);
  }

  /* ---- readiness ---- */

  function fail() {
    clearTimeout(failTimer);
    ready = false;
    hero.classList.remove("is-loading");
    // keep the hero image, and drop the long scroll track so a failed clip
    // leaves the section behaving like the original static hero
    hero.classList.add("video-fallback", "video-static");
    video.style.display = "none";
  }

  function onReady() {
    if (ready) return;
    const value = video.duration;
    if (!value || !isFinite(value)) { fail(); return; }
    clearTimeout(failTimer);
    duration = value;
    current = 0;
    written = 0;
    ready = true;
    hero.classList.remove("is-loading");
    hero.classList.add("video-ready");
    if (bar) bar.style.width = "100%";
    // paint the first frame without ever starting playback
    try { video.currentTime = 0; } catch (e) {}
    if (scrub) requestFrame();
  }

  /* ---- media: hold the clip in memory so seeking is local ---- */

  async function loadClip(url) {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const type = res.headers.get("Content-Type") || "video/mp4";
    const total = Number(res.headers.get("Content-Length")) || 0;
    const reader = res.body && res.body.getReader ? res.body.getReader() : null;
    if (!reader) return res.blob();
    if (!total && progressEl) progressEl.classList.add("creep"); // length unknown behind a proxy
    const chunks = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (total && bar) bar.style.width = Math.round((loaded / total) * 100) + "%";
    }
    return new Blob(chunks, { type });
  }

  const sourceEl = video.querySelector("source");
  const sourceUrl = (sourceEl && sourceEl.getAttribute("src")) || video.getAttribute("src") || "";

  async function prepare() {
    if (sourceUrl) {
      try {
        const blob = await loadClip(sourceUrl);
        video.src = URL.createObjectURL(blob);
        video.load();
        return;
      } catch (e) {
        /* fall through: stream the same file from the server */
      }
      video.src = sourceUrl;
      video.load();
      return;
    }
    fail();
  }

  /* ---- the animation loop ---- */

  function requestFrame() {
    if (!frameId) frameId = requestAnimationFrame(frame);
  }

  function frame() {
    frameId = 0;
    const span = hero.offsetHeight - window.innerHeight;
    const rect = span > 0 ? hero.getBoundingClientRect() : null;
    const progress = rect ? clamp01(-rect.top / span) : 0;

    paint(progress);

    if (!ready || !scrub || !rect) return;

    const max = Math.max(duration - END_MARGIN, 0);
    const target = progress * max;
    const now = performance.now();
    const step = lastFrameTime ? Math.min(now - lastFrameTime, 64) / (1000 / 60) : 1;
    lastFrameTime = now;

    const gap = target - current;
    if (Math.abs(gap) > MAX_LAG) current = target - Math.sign(gap) * MAX_LAG; // fast scrolls stay attached
    current += (target - current) * (1 - Math.pow(1 - SMOOTHING, step));
    if (Math.abs(target - current) <= SETTLE) current = target;

    if (video.readyState >= 2 && (Math.abs(current - written) >= SEEK_STEP || (current === target && written !== target))) {
      written = current;
      try { video.currentTime = current; } catch (e) {}
    }

    if (current === target) {
      lastFrameTime = 0;
      return;
    }
    requestFrame();
  }

  /* ---- wiring ---- */

  if (scrub) hero.classList.add("is-loading");
  else hero.classList.add("video-static");

  video.muted = true;      // no audio path at all
  video.loop = false;      // the clip ends where the scroll ends
  video.autoplay = false;

  video.addEventListener("loadeddata", onReady);
  video.addEventListener("error", fail);
  if (sourceEl) sourceEl.addEventListener("error", fail);
  video.addEventListener("play", () => video.pause()); // this hero only ever scrubs

  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", () => { lastFrameTime = 0; requestFrame(); }, { passive: true });

  failTimer = setTimeout(() => { if (!ready) fail(); }, 20000);

  prepare();
  requestFrame();
})();
