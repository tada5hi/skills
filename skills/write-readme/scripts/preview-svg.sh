#!/usr/bin/env bash
# Render an SVG the way a README shows it (as an <img>) in four combinations:
#
#   light.png     light colour scheme on a light page  (GitHub light)
#   dark.png      dark colour scheme on a dark page    (GitHub dark)
#   mismatch.png  dark colour scheme on a light page   (npm, which is always light, viewed on a dark OS)
#   inverse.png   light colour scheme on a dark page
#
# An SVG with SMIL animations is captured at its first frame. For those it also writes
#
#   settled-light.png, settled-dark.png   the same SVG with every animation element removed (the static attributes,
#                                         i.e. what renderers without SMIL show and, if they hold it, the settled state)
#
# Usage: preview-svg.sh <file.svg> [out-dir] [width] [height]
#   width/height default to the SVG's own width/height attributes.
#   Set CHROME to a Chrome/Chromium binary to override detection.

set -euo pipefail

svg="${1:?usage: preview-svg.sh <file.svg> [out-dir] [width] [height]}"
out="${2:-.}"

[ -f "$svg" ] || { echo "error: $svg not found" >&2; exit 1; }
svg="$(cd "$(dirname "$svg")" && pwd)/$(basename "$svg")"
mkdir -p "$out"
out="$(cd "$out" && pwd)"

# A stray <placeholder> or & in the markup makes the browser show a broken image, so fail loudly first.
if command -v xmllint >/dev/null 2>&1; then
    xmllint --noout "$svg" || { echo "error: $svg is not well-formed XML" >&2; exit 1; }
fi

attr() { sed -n "s/.*<svg[^>]* $1=\"\([0-9.]*\)\".*/\1/p" "$svg" | head -n 1; }
width="${3:-$(attr width)}"
height="${4:-$(attr height)}"
[ -n "$width" ] && [ -n "$height" ] || { echo "error: pass width and height, the SVG has no width/height attributes" >&2; exit 1; }

find_chrome() {
    if [ -n "${CHROME:-}" ]; then echo "$CHROME"; return; fi
    for bin in google-chrome google-chrome-stable chromium chromium-browser chrome; do
        if command -v "$bin" >/dev/null 2>&1; then command -v "$bin"; return; fi
    done
    for app in \
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
        "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
        if [ -x "$app" ]; then echo "$app"; return; fi
    done
    return 1
}
chrome="$(find_chrome)" || { echo "error: no Chrome or Chromium found; install one or set CHROME=/path/to/binary" >&2; exit 1; }

tmp="$(mktemp -d "${TMPDIR:-/tmp}/preview-svg.XXXXXX")"
trap 'rm -rf "$tmp"' EXIT

# preferredColorScheme: 0 = dark, 1 = light. Set explicitly: headless Chrome otherwise follows the OS.
render() { # <name> <page background> <scheme> [svg]
    printf '<body style="margin:0;background:%s"><img src="file://%s" width="%s" height="%s">' \
        "$2" "${4:-$svg}" "$width" "$height" > "$tmp/$1.html"
    "$chrome" --headless=new --disable-gpu --hide-scrollbars \
        --window-size="$width,$height" \
        --blink-settings=preferredColorScheme="$3" \
        --screenshot="$out/$1.png" "file://$tmp/$1.html" >/dev/null 2>&1
    echo "$out/$1.png"
}

render light '#ffffff' 1
render dark '#0d1117' 0
render mismatch '#ffffff' 0
render inverse '#0d1117' 1

# Animated: also render the static attributes, without animate, animateMotion, animateTransform and set elements.
if grep -qE '<(animate|animateMotion|animateTransform|set)[ >/]' "$svg"; then
    settled="$tmp/settled.svg"
    perl -0pe 's{<(animate|animateMotion|animateTransform|set)\b[^>]*/>}{}g; s{<(animate|animateMotion|animateTransform|set)\b[^>]*>.*?</\1>}{}gs' \
        "$svg" > "$settled"
    render settled-light '#ffffff' 1 "$settled"
    render settled-dark '#0d1117' 0 "$settled"
fi
