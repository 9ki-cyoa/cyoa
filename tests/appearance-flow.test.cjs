const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "dist/app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "dist/styles.css"), "utf8");

// A small DOM fixture for behavior tests. It does not render or launch a browser.
class Element {
  constructor(tag = "div") {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.style = {};
    this.listeners = {};
    this.className = "";
    this.hidden = false;
    this.scrollTop = 0;
    this.classList = {
      toggle: (name, force) => {
        const names = new Set(this.className.split(/\s+/).filter(Boolean));
        const enabled = force ?? !names.has(name);
        enabled ? names.add(name) : names.delete(name);
        this.className = [...names].join(" ");
      },
      add: (name) => this.classList.toggle(name, true),
      remove: (name) => this.classList.toggle(name, false),
    };
  }

  append(...children) {
    for (const child of children) {
      if (child.tagName === "fragment") this.append(...child.children);
      else {
        child.parentElement = this;
        this.children.push(child);
      }
    }
  }

  matches(selector) {
    if (selector.startsWith(".")) {
      return selector.slice(1).split(".").every((name) => this.className.split(/\s+/).includes(name));
    }
    if (selector.startsWith("#")) return this.attributes.id === selector.slice(1);
    if (selector.startsWith("[")) {
      const [, name, value] = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      return name in this.attributes && (value === undefined || this.attributes[name] === value);
    }
    return this.tagName === selector;
  }

  closest(selector) {
    for (let item = this; item; item = item.parentElement) {
      if (item.matches(selector)) return item;
    }
    return null;
  }

  querySelectorAll(selector) {
    const parts = selector.split(" ");
    const found = [];
    const visit = (parent) => {
      for (const child of parent.children) {
        if (child.matches(parts.at(-1)) && (parts.length === 1 || child.parentElement?.closest(parts[0]))) found.push(child);
        visit(child);
      }
    };
    visit(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); }
  removeEventListener(name, callback) { this.listeners[name] = (this.listeners[name] ?? []).filter((fn) => fn !== callback); }
  focus() { this.document.activeElement = this; }
}

function setup({ hostname = "", search = "" } = {}) {
  const document = new Element("document");
  document.createElement = (tag) => Object.assign(new Element(tag), { document });
  document.createDocumentFragment = () => document.createElement("fragment");
  // Parse only the static tags and attributes used by this site's fixture.
  const stack = [document];
  for (const token of html.matchAll(/<\/?[a-z][^>]*>/gi)) {
    const text = token[0];
    if (text.startsWith("</")) { stack.pop(); continue; }
    const tag = text.match(/^<([a-z0-9-]+)/i)[1];
    const element = document.createElement(tag);
    for (const attr of text.slice(tag.length + 1, -1).matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      const [, name, value = ""] = attr;
      element.setAttribute(name, value);
      if (name === "class") element.className = value;
      if (name === "hidden" || name === "disabled") element[name] = true;
      if (name.startsWith("data-")) element.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
    }
    stack.at(-1).append(element);
    if (!["meta", "link", "img", "input", "br", "hr"].includes(tag)) stack.push(element);
  }

  const audio = document.querySelector("#title-bgm");
  Object.assign(audio, {
    paused: true, readyState: 3,
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    load() {},
  });
  const window = {
    location: { hostname, search },
    matchMedia: () => ({ matches: true }),
    setTimeout: () => 1, clearTimeout() {},
    setInterval: () => 1, clearInterval() {},
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  };
  const context = vm.createContext({
    document, window, performance: { now: () => 0 },
    HTMLMediaElement: { HAVE_FUTURE_DATA: 3 },
    Image: class { addEventListener() {} }, URLSearchParams,
  });
  vm.runInContext(script, context);
  const query = (selector) => document.querySelector(selector);
  const click = (element) => {
    if (element.disabled) return;
    let stopped = false;
    const event = { target: element, stopPropagation() { stopped = true; } };
    for (let node = element; node; node = node.parentElement) {
      for (const callback of node.listeners.click ?? []) callback(event);
      if (stopped) break;
    }
  };
  const currentGroup = () => query(".choice-group.is-current");
  const begin = () => {
    click(query('[data-action="start"]'));
    for (let line = 1; line < 17; line++) click(query(".dialogue-panel"));
    assert.equal(query('[data-action="appearance"]').hidden, false);
    click(query('[data-action="appearance"]'));
  };
  return { document, query, click, currentGroup, begin, context };
}

test("prologue leads into 11 sequential categories; selection is required", () => {
  const { document, query, click, currentGroup, begin } = setup();
  begin();
  assert.equal(query('[data-screen="appearance"]').hidden, false);
  assert.equal(query('[data-screen="title"]').hidden, true);
  const expected = ["gender", "body-type", "height", "impression", "aura", "hair-length", "hair-color", "hair-mix", "eye-color", "pupil", "skin-color"];
  const next = query('[data-action="next-appearance"]');
  for (const [index, category] of expected.entries()) {
    const group = currentGroup();
    assert.equal(group.dataset.category, category);
    assert.equal(document.querySelectorAll(".choice-group").filter((item) => !item.hidden).length, 1);
    assert.equal(query("[data-selection-progress]").textContent, `${String(index + 1).padStart(2, "0")} / 11`);
    assert.equal(next.disabled, true);
    click(next);
    assert.equal(currentGroup(), group);
    click(group.querySelectorAll(".choice-option").at(-1));
    assert.equal(next.disabled, false);
    assert.equal(next.textContent, index === 10 ? "외형 확정" : "다음");
    query('[data-screen="appearance"]').scrollTop = 500;
    click(next);
    if (index < 10) {
      assert.equal(query('[data-screen="appearance"]').scrollTop, 0);
      assert.equal(document.activeElement, currentGroup().querySelector("legend"));
    }
  }
  assert.equal(query('[data-screen="race"]').hidden, false);
  assert.equal(query('[data-screen="appearance"]').hidden, true);
  assert.equal(document.activeElement, query("#race-title"));
});

test("gender image clicks, single selection, back navigation and re-entry preserve choices", () => {
  const { query, click, currentGroup, begin } = setup();
  begin();
  const gender = currentGroup();
  const [male, female] = gender.querySelectorAll(".choice-option");
  assert.equal(gender.querySelectorAll(".choice-option").length, 2);
  assert.equal(query('[data-action="previous-appearance"]').disabled, true);
  click(male.querySelector("img"));
  click(female.querySelector("img"));
  assert.equal(male.getAttribute("aria-pressed"), "false");
  assert.equal(female.getAttribute("aria-pressed"), "true");
  click(query('[data-action="next-appearance"]'));
  assert.equal(currentGroup().querySelectorAll(".choice-option").length, 8);
  click(currentGroup().querySelector(".choice-option"));
  click(query('[data-action="previous-appearance"]'));
  assert.equal(female.getAttribute("aria-pressed"), "true");
  assert.equal(query('[data-action="next-appearance"]').disabled, false);
  click(query('[data-action="return-title"]'));
  assert.equal(query('[data-screen="title"]').hidden, false);
  begin();
  assert.equal(currentGroup().dataset.category, "gender");
  assert.equal(female.getAttribute("aria-pressed"), "true");
  click(query('[data-action="next-appearance"]'));
  assert.equal(currentGroup().querySelector(".choice-option").getAttribute("aria-pressed"), "true");
});

test("aura, hair color and eye color each allow several choices and can be cleared", () => {
  const { query, click, currentGroup, begin } = setup();
  const next = query('[data-action="next-appearance"]');
  const previous = query('[data-action="previous-appearance"]');
  begin();

  for (const category of ["gender", "body-type", "height", "impression"]) {
    assert.equal(currentGroup().dataset.category, category);
    const options = currentGroup().querySelectorAll(".choice-option");
    click(options[0]);
    if (category === "body-type") {
      click(options[1]);
      assert.equal(options[0].getAttribute("aria-pressed"), "false");
      assert.equal(options[1].getAttribute("aria-pressed"), "true");
    }
    click(next);
  }

  for (const category of ["aura", "hair-color", "eye-color"]) {
    if (category === "hair-color") {
      click(currentGroup().querySelector(".choice-option")); // hair length
      click(next);
    }
    if (category === "eye-color") {
      click(currentGroup().querySelector(".choice-option")); // hair mix
      click(next);
    }

    const group = currentGroup();
    assert.equal(group.dataset.category, category);
    assert.equal(group.querySelector(".choice-multiple-hint").textContent, "여러 개 선택 가능");
    const [first, second, third] = group.querySelectorAll(".choice-option");
    for (const button of [first, second, third]) click(button);
    assert.equal(group.querySelectorAll(".choice-option.is-selected").length, 3);
    assert.equal(next.disabled, false);

    click(second);
    assert.equal(second.getAttribute("aria-pressed"), "false");
    assert.equal(group.querySelectorAll(".choice-option.is-selected").length, 2);
    click(first);
    click(third);
    assert.equal(next.disabled, true);
    click(next);
    assert.equal(currentGroup(), group);

    click(first);
    click(third);
    click(previous);
    click(next);
    assert.equal(currentGroup(), group);
    assert.equal(first.getAttribute("aria-pressed"), "true");
    assert.equal(third.getAttribute("aria-pressed"), "true");
    assert.equal(second.getAttribute("aria-pressed"), "false");
    click(next);
  }
});

test("eight race images follow the supplied order and a single race is selected", () => {
  const { query, click, currentGroup, begin, context } = setup();
  begin();
  for (let step = 0; step < 11; step++) {
    click(currentGroup().querySelector(".choice-option"));
    click(query('[data-action="next-appearance"]'));
  }

  const cards = query("[data-race-cards]").querySelectorAll(".race-card");
  assert.deepEqual(cards.map((card) => card.querySelector(".race-card-name").textContent),
    ["인간", "용인", "인어", "귀인", "묘인", "지저인", "천인", "마인"]);
  assert.equal(query('[data-action="confirm-race"]').disabled, true);
  for (const card of cards) {
    assert.ok(card.querySelector(".race-image"));
    assert.ok(card.querySelector(".race-card-description").textContent);
  }
  const required = Array.from(vm.runInContext("requiredImages", context));
  for (const card of cards) assert.ok(required.includes(card.querySelector(".race-image").src));

  click(cards[0].querySelector("img"));
  click(cards[6].querySelector("img"));
  assert.equal(cards[0].getAttribute("aria-pressed"), "false");
  assert.equal(cards[6].getAttribute("aria-pressed"), "true");
  assert.equal(query('[data-action="confirm-race"]').disabled, false);
  click(query('[data-action="return-appearance"]'));
  assert.equal(query('[data-screen="appearance"]').hidden, false);
  assert.equal(currentGroup().dataset.category, "skin-color");
  click(query('[data-action="next-appearance"]'));
  assert.equal(cards[6].getAttribute("aria-pressed"), "true");
  click(query('[data-action="confirm-race"]'));
  assert.equal(query(".status-message").textContent, "종족 기록을 확인했습니다. 적응 단계는 준비 중입니다.");
});

test("local race preview opens the gallery without changing the deployed start screen", () => {
  const local = setup({ hostname: "127.0.0.1", search: "?preview=race" });
  assert.equal(local.query('[data-screen="race"]').hidden, false);
  assert.equal(local.query('[data-screen="loading"]').hidden, true);
  assert.equal(local.query("[data-race-cards]").querySelectorAll(".race-card").length, 8);

  const deployed = setup({ hostname: "example.neocities.org", search: "?preview=race" });
  assert.equal(deployed.query('[data-screen="loading"]').hidden, false);
  assert.equal(deployed.query('[data-screen="race"]').hidden, true);
});

test("portraits are square and all local page assets exist", () => {
  for (const name of ["male", "female"]) {
    const png = fs.readFileSync(path.join(root, `dist/assets/images/appearance-${name}.png`));
    assert.equal(png.readUInt32BE(16), 1254);
    assert.equal(png.readUInt32BE(20), 1254);
  }
  for (const match of html.matchAll(/(?:src|href)="(\.\/[^"?]+)(?:\?[^"]*)?"/g)) {
    assert.ok(fs.existsSync(path.join(root, "dist", match[1])), match[1]);
  }
  for (const name of ["human", "dragon", "merfolk", "oni", "catfolk", "underground", "skyfolk", "demon"]) {
    const source = path.join(root, `assets/images/races/${name}.png`);
    const served = path.join(root, `dist/assets/images/races/${name}.webp`);
    assert.ok(fs.existsSync(source));
    const webp = fs.readFileSync(served);
    assert.equal(webp.toString("ascii", 0, 4), "RIFF");
    assert.equal(webp.toString("ascii", 8, 12), "WEBP");
    assert.ok(webp.length < fs.statSync(source).size);
  }
  assert.match(html, /styles\.css\?v=20261002-2/);
  assert.match(html, /app\.js\?v=20261002-3/);
});

test("appearance has one neutral theme, square borderless portraits and narrow-screen navigation", () => {
  assert.equal((css.match(/^\.appearance-screen \{/gm) ?? []).length, 1);
  const appearance = css.slice(css.indexOf("/* Appearance:"));
  assert.match(appearance, /color-scheme: light/);
  assert.match(appearance, /\.appearance-screen \{[^}]*background: #fff;/);
  assert.match(appearance, /\.choice-option-image \{[^}]*aspect-ratio: 1 \/ 1;[^}]*border: 0;/);
  assert.match(appearance, /repeat\(2, minmax\(0, 28rem\)\)/);
  assert.match(appearance, /\.choice-option--visual\.is-selected \{[^}]*box-shadow: none;/);
  assert.match(appearance, /@media \(max-width: 380px\)/);
  assert.match(appearance, /\.choice-actions > \.return-button \{\s*width: 100%;/);
  assert.match(appearance, /prefers-reduced-motion/);
  for (const [, hex] of appearance.matchAll(/#([a-f0-9]{3,6})\b/gi)) {
    const expanded = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    assert.equal(expanded.slice(0, 2), expanded.slice(2, 4), `Non-neutral color: #${hex}`);
    assert.equal(expanded.slice(2, 4), expanded.slice(4, 6), `Non-neutral color: #${hex}`);
  }
});
