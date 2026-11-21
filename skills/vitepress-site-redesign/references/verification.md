# Verification toolkit

Copy-paste checks for a VitePress redesign. Each one exists because the corresponding defect shipped
past a build, a lint run and a reading of the diff on a real project.

The rule behind all of them: **a diff shows you what a file looks like, not what it contains or renders.**
Verify bytes and computed values, not appearance.

## Viewport widths (window resizing does not work)

Browser automation often cannot set the viewport to an arbitrary width — it clamps to the window's own
limits, so a "390px check" silently becomes a 606px check. Render the page into same-origin iframes instead:

```js
window.kFrames = async (path, widths = [390, 1200]) => {
    document.body.innerHTML = '';
    const out = [];
    for (const w of widths) {
        const f = document.createElement('iframe');
        f.width = String(w); f.height = '900'; f.src = path;
        document.body.append(f);
        await new Promise((r) => { f.onload = r; });
        await new Promise((r) => { setTimeout(r, 900); });
        out.push({
            width: w,
            overflow: f.contentDocument.documentElement.scrollWidth > f.contentWindow.innerWidth,
            doc: f.contentDocument,
        });
    }
    return out;
};

const r = await kFrames('/');         // every entry must have overflow === false
getComputedStyle(r[1].doc.querySelector('.k-research-grid')).gridTemplateColumns; // breakpoints really fired
```

## Codepoints, not glyphs

Editors and write tools silently flatten `\uXXXX` escape text into the character it denotes — and flatten
typographic characters into ASCII lookalikes. A diff renders all three identically. This ate two fix rounds
on one project: a slug function's character class lost its curly quotes (`“ ” ‘ ’` → `" "`), and the fix
report claimed a second line had been corrected when it had never been touched.

```js
// what does this line actually contain?
node -e 'const l=require("node:fs").readFileSync(PATH,"utf8").split("\n").find((x)=>x.includes(IDENT));
console.log(JSON.stringify(l), [...l].filter((c)=>c.codePointAt(0)>127).map((c)=>"U+"+c.codePointAt(0).toString(16).toUpperCase()))'
```

When a value must match an upstream algorithm (a slugifier, a formatter), do not eyeball it — run both and
diff the outputs over a list of inputs, and prove the test fails against a deliberately mutated copy.

## Rendered class attributes

A static `class="..."` whose value wraps across two source lines embeds a newline plus the source indentation
into the rendered attribute. Browsers tolerate it, so nothing fails — it just leaves garbage in the DOM and
tempts the next person to copy the pattern.

```js
node -e 'const fs=require("node:fs");for (const f of FILES) {
  const s=fs.readFileSync(f,"utf8");
  console.log(f, [...s.matchAll(/class="[^"]*\n[^"]*"/g)].length);  // must be 0
}'
```

Fix by hoisting the string to a module-level constant bound with `:class`, or a `:class="[...]"` array. Keep
the tokens identical — a hoist that quietly drops one changes the rendering, so compare token by token.

## Hydration

Anything time-dependent evaluated in `setup()` runs twice: at build (SSR) and again when a visitor hydrates,
possibly weeks later. Load the page fresh in dev and read the console — a mismatch logs `Hydration ... mismatch`
and shows up as a flash of the stale content.

## Content migrations

When metadata moves from prose into frontmatter, prove the rendered text is unchanged rather than arguing it:

```bash
# before the change, and again after — then diff
node -e 'const fs=require("node:fs");for (const f of fs.readdirSync(DIR).filter((x)=>x.endsWith(".html")).sort()) {
  const m=fs.readFileSync(DIR+"/"+f,"utf8").match(PATTERN); console.log(f,"|",m?m[1]:"MISSING");
}' > .temp/before.txt
diff .temp/before.txt .temp/after.txt && echo IDENTICAL
```

## Chrome

```js
// nav at the top of the landing page vs. scrolled
const bar = document.querySelector('.VPNavBar');
({ top: bar.classList.contains('top'), bg: getComputedStyle(bar).backgroundColor });
// → transparent at scrollY 0, opaque after window.scrollTo(0, 900)

// brand variables really point at your scale
getComputedStyle(document.documentElement).getPropertyValue('--vp-c-brand-1').trim()
    === getComputedStyle(document.documentElement).getPropertyValue('--your-primary-600').trim();

// footer band reaches both edges on a docs page — and is actually the thing painted there.
// Geometry alone passes even when the fixed sidebar covers the footer's left part, so sample the pixel:
const f = document.querySelector('.k-footer');
scrollTo(0, document.body.scrollHeight);
f.contains(document.elementFromPoint(40, f.getBoundingClientRect().bottom - 30));  // must be true

// the flyout trap: the overflow menu's button follows the hero, its dropdown does not.
// `.click()` does NOT engage CSS :hover, and VitePress's flyouts open on mouseenter and
// colour themselves from `.VPFlyout:hover` — so a scripted click passes with the bug present.
// Move the real cursor onto the trigger, leave it there, then read the open menu:
getComputedStyle(document.querySelector('.VPMenu .VPLink')).color;  // normal theme text, not hero text
```

Any `:hover`-driven behaviour needs a real pointer. This is a general browser-automation pitfall, not a
VitePress one: synthetic clicks and programmatic open-state toggles never satisfy `:hover`.

Check every page you touched in **both color modes** (`document.querySelector('.VPSwitchAppearance').click()`),
and check a page with a sidebar, not only the landing page.

## Utilities were generated at all

A wrong `@source` path produces no error and no utilities. After wiring Tailwind up, grep the built CSS for a
utility that only a scanned component uses — not a shared class like `.k-section`, which the token file defines
itself and which is emitted even when `@source` matches nothing:

```bash
# e.g. an arbitrary value or a utility no other file uses
grep -l "{{utility-only-used-in-a-component}}" src/.vitepress/dist/assets/*.css
```

## Deleting assets

Grep before removing an image or file the redesign made obsolete — and let the grep, not memory, decide:

```bash
grep -rn "abi.jpg\|tbi.jpg" src --include='*.vue' --include='*.md' --include='*.ts'
```
