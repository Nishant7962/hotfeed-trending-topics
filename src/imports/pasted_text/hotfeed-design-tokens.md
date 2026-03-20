Design a social media "Hot Topics" trending feed called HotFeed.
Full responsive UI — Desktop + Tablet + Mobile.
Liquid Glass / Deep Ocean aesthetic. NOT generic glassmorphism.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨  DESIGN IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aesthetic: Melted glacier meets deep ocean floor. Light refracts
through water, not just blurs behind it. Cards have DEPTH —
inner shadow, top-edge highlight, subtle refraction border.
NOT synthwave. NOT purple gradients. NOT neon outlines.

COLORS
  Page background:      #060D12  (obsidian-teal, deep ocean)
  Background blobs:     #0A2233 and #071A25  (radial, 20% opacity)
  Grid overlay:         1px lines, rgba(0,200,180,0.03)
  Glass surface:        rgba(8,28,44,0.55)
  Accent glass:         rgba(0,180,160,0.12)  bioluminescent teal
  Trending hot:         #FF5C35  volcanic orange (NOT yellow, NOT red)
  Score gradient:       #FF5C35 → #FF8C42
  Active/selected:      rgba(0,220,190,0.18)
  Text primary:         #E8F4F0  glacier white
  Text secondary:       #7BADB0  arctic teal
  Border glow:          rgba(0,200,180,0.15)
  Live pulse dot:       #00C8B4

TYPOGRAPHY
  Display / headings:   "Syne"       (Google Font) — geometric editorial
  Body / UI labels:     "DM Sans"    — clean, not boring
  Numbers / scores:     "Syne Mono"  — raw monospace energy

GLASS CARD FORMULA  (apply to ALL cards, panels, dropdowns)
  background:           rgba(8,28,44,0.55)
  backdrop-filter:      blur(24px) saturate(160%)
  border:               1px solid rgba(0,200,180,0.10)
  border-top:           1px solid rgba(255,255,255,0.08)  ← highlight edge
  box-shadow:           0 8px 32px rgba(0,0,0,0.4),
                        inset 0 1px 0 rgba(255,255,255,0.06)
  border-radius:        16px cards / 12px chips / 999px pills

SCORE BAR  (liquid fill bar, bottom of every card)
  Height: 3px, full card width
  Filled:   gradient left→right  #FF5C35 → #FF8C42, rounded right cap
  Unfilled: rgba(255,255,255,0.06)
  Hover shimmer: white semi-transparent gleam slides left→right

TRENDING BADGE  (top-right chip on every card)
  Score > 80k:  gradient pill  #FF5C35 → #FF8C42  "🔥 HOT"
  Score > 40k:  teal pill      rgba(0,200,180,0.20)  text #00C8B4
  Score < 40k:  gray pill      rgba(255,255,255,0.06)  text #7BADB0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️  DESKTOP LAYOUT  (>1024px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVBAR  (floating, not full-width, centered max-width 1280px)
  Left:    Logo "HotFeed" in Syne — liquid-drop SVG icon in #FF5C35
           + pulsing live dot (2px, #00C8B4, slow 2s pulse, NOT blink)
  Center:  CategoryBar pill tabs — Tech · Sports · Gaming · Music ·
           Science · Culture
           Active tab: liquid-fill animation + rgba(0,220,190,0.18) bg
           Inactive: ghost pill, rgba(0,200,180,0.10) border
  Right:   SearchBar — no box, just bottom-glow on focus
           + user avatar circle (glass surface)
  Top edge: 30s cache refresh bar — 1px, #FF5C35 at 40% opacity,
            fills left→right over 30 seconds then resets

HERO SECTION
  Left 60%: Featured PostCard — rank #01, OVERSIZED
    · Category chip top-left  (glass chip, Syne 11px all-caps)
    · Rank "01" top-right     (Syne Mono 48px, #FF5C35, 20% opacity bg)
    · Post title              (Syne 32px, #E8F4F0, 2 lines max)
    · Score fill bar          (full width, 4px height, #FF5C35→#FF8C42)
    · Score "94,302 pts"      (Syne Mono 13px, #7BADB0, below bar)
    · Engagement row          (views · likes · shares — glass chips)
    · TrendingBadge           (top-right, HOT tier)
    · Card height: ~320px

  Right 40%: Stacked cards for rank #02 and #03
    · Same structure, scaled down, height ~148px each, gap 16px
    · Rank numbers "02" "03" in Syne Mono 28px, #FF5C35 30% opacity

TRENDING GRID  (below hero, posts #04–#20)
  Header: "TRENDING NOW" — Syne 11px, letter-spacing 4px, #7BADB0
          + 1px teal line extending full width to the right
  Layout: 4-column CSS grid, gap 16px
  Card heights: VARY — alternate between 160px and 200px per column
                to create masonry-like rhythm (NOT uniform rows)
  Each card:
    · Rank number   top-left  Syne Mono 11px #7BADB0
    · TrendingBadge top-right
    · Post title    DM Sans 14px #E8F4F0
    · Category chip bottom-left  11px
    · Score bar     3px at card bottom
    · Hover: translateY(-4px), border glow intensifies,
             score bar shimmer animates

SEARCH RESULTS DROPDOWN
  Appears below SearchBar on input (debounced 300ms)
  Glass card formula, max 5 results, max-width matches SearchBar
  Each row: [category chip] [post title] [score Syne Mono right-align]
  Matched term in title: color #FF5C35 (no bold, just color change)
  Empty: "Nothing matched" in #7BADB0, centered
  Press Enter or click: navigate to CategoryPage

SCORE TOOLTIP  (on PostCard hover, desktop only)
  Small glass panel below score bar, appears on hover
  Content:
    "❤ 8,420 × 3 = 25,260   👁 43,782 × 1 = 43,782   ⏱ −4,740"
  Font: Syne Mono 11px, #7BADB0 labels, #E8F4F0 numbers
  Makes scoring formula visible to users

CATEGORY PAGE  (CategoryPage.jsx — desktop)
  Same navbar
  Category header replaces hero:
    · Category name Syne 48px #E8F4F0
    · "X posts trending" DM Sans 14px #7BADB0
    · 2px #00C8B4 underline, 60px wide
    · Breadcrumb "Hot Topics / Tech" top-left, 12px #7BADB0
  3-column uniform grid (vs landing's 4-col masonry)
  All PostCards are "medium" size — no hero variant

INFINITE SCROLL TRIGGER
  After post #20, a wave-like SVG indicator — 3 subtle arcs
  in rgba(0,200,180,0.15), animating a gentle rise
  "Loading more" in DM Sans 12px #7BADB0 centered below

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱  TABLET LAYOUT  (768px–1024px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVBAR
  Left:  Logo + live dot (same as desktop)
  Right: Search icon (opens full-width bar on tap) + avatar
  CategoryBar: moves BELOW navbar as a full-width
               horizontally-scrollable pill row, no wrap,
               hide scrollbar, fade edges left/right with
               rgba(6,13,18,0.8) gradient mask

HERO SECTION  (stacked, not side-by-side)
  Top: Featured card (#01) — full width, height ~240px
  Bottom row: Cards #02 and #03 — side by side, equal width,
              height ~180px, gap 16px

TRENDING GRID
  2-column grid, gap 14px
  All cards uniform height 180px
  Rank numbers, badges, score bars — same as desktop

SEARCH
  On search icon tap: SearchBar expands full-width below navbar
  Same dropdown as desktop, full-width

SCORE TOOLTIP
  On tap: tooltip appears below card (not hover)
  Dismisses on tap outside

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📲  MOBILE LAYOUT  (<768px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVBAR  (sticky, full-width, compact 56px height)
  Left:   Logo "HotFeed" — icon + wordmark, Syne 16px
          Live dot stays (same pulse, 2px #00C8B4)
  Right:  Search icon + hamburger menu icon
          Both are 24px SVG line icons, #7BADB0
  NO category tabs visible in navbar on mobile
  Cache refresh bar stays at very top (1px, same behavior)

CATEGORY BAR  (separate row below navbar on mobile)
  Full-width horizontal scroll pill row
  Height 44px, padding 0 16px
  Active pill: rgba(0,220,190,0.18) fill, #00C8B4 text
  Scrollable, fade mask on right edge only
  Snap scroll behavior on pills

HERO SECTION  (mobile)
  ONLY the #01 featured post — full width
  Rank "01" Syne Mono 36px, #FF5C35 20% opacity, top-right
  Title Syne 22px, 2 lines
  Score bar full width 4px
  Engagement chips — compact, smaller text
  Cards #02 and #03 are HIDDEN on mobile
  (They appear starting at tablet breakpoint)

TRENDING GRID  (mobile)
  1-column, full-width cards
  All cards same height: 120px (compact)
  Each card:
    · Rank + TrendingBadge on same row (space-between)
    · Title DM Sans 14px, 1 line, truncated with ellipsis
    · Score bar at bottom 3px
    · Category chip bottom-left 10px

SEARCH  (mobile)
  Tap search icon: full-screen overlay slides down
  Glass surface background, full-screen
  Input top of overlay, large 18px placeholder
  Results below, full-width rows
  Close X top-right

HAMBURGER MENU  (mobile)
  Slides in from right, full-height panel, 280px wide
  Glass surface, blurred background
  Items: Home · Categories · Trending · Settings
  Each item: DM Sans 16px, #E8F4F0, 52px tap target
  Active item: left 3px border #FF5C35 + rgba(255,92,53,0.06) bg

SCORE TOOLTIP  (mobile)
  Long-press on any card → bottom sheet slides up
  Shows full score breakdown:
    "❤ likes × 3   👁 views × 1   ⏱ recency decay"
  Glass surface bottom sheet, 180px height, handle bar at top
  Drag down to dismiss

INFINITE SCROLL  (mobile)
  Same wave SVG indicator, centered
  Triggered automatically at 200px from bottom
  Show skeleton cards during load (see below)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡  LIVE & REAL-TIME UI  (all breakpoints)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SOCKET.IO RANK UPDATE ANIMATIONS
  Card moving UP:
    · Left border flash: 2px solid #00C8B4, fades in 600ms
    · Rank number: flip-count animation downward (01→ old rank)
    · Subtle green shimmer sweeps card top-to-bottom

  Card moving DOWN:
    · Left border flash: 2px solid #FF5C35, fades in 600ms
    · Rank number: flip-count animation upward
    · No shimmer (visual de-emphasis)

  New post entering top 20:
    · Card slides in from bottom of grid section
    · "NEW" chip appears top-left: #00C8B4 bg, Syne 10px all-caps
    · Chip fades out after 5 seconds
    · Other cards shift position with smooth transition

CACHE REFRESH BAR  (top of page, all breakpoints)
  1px progress line at absolute top of viewport
  Color: #FF5C35, opacity 40%
  Fills left→right over exactly 30 seconds
  Resets instantly, starts again
  Subtle pulse at completion moment before reset

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💀  SKELETON / LOADING STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

On initial page load and after InfiniteScroll trigger:
  Show skeleton PostCards — exact same dimensions as real cards
  Content replaced with shimmer bars:
    · Title area: 2 bars, 80% width + 60% width
    · Badge area: small rounded rect top-right
    · Score bar: full width at bottom (3px, pulsing)
  Shimmer animation:
    rgba(0,200,180,0.04) → rgba(0,200,180,0.10) → rgba(0,200,180,0.04)
    left-to-right sweep, 1.8s loop
  NO layout shift — skeletons must match real card dimensions exactly
  Show 20 skeletons on initial load, 8 on infinite scroll trigger

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
😶  EMPTY & ERROR STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEARCH NO RESULTS
  Centered SVG illustration: 3 concentric ripple arcs
  in rgba(0,200,180,0.15), growing outward
  "Nothing trending here" — Syne 20px #E8F4F0
  "Try a different search or browse categories" — DM Sans 13px #7BADB0
  Ghost button "Clear search" — 1px rgba(0,200,180,0.20) border

CATEGORY EMPTY
  Same ripple illustration
  "No hot topics in [Category] yet" — Syne 20px #E8F4F0
  "Check back soon" — DM Sans 13px #7BADB0

API / NETWORK ERROR
  Glass card, centered
  "Feed unavailable" — Syne 18px #E8F4F0
  "Could not connect to live feed" — DM Sans 13px #7BADB0
  Retry button: #FF5C35 background, Syne 13px white

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐  COMPONENTS TO DESIGN  (all 3 breakpoints each)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PostCard       — hero / medium / compact × desktop+tablet+mobile
2. TrendingBadge  — hot / warm / cold  ×  all sizes
3. CategoryBar    — desktop tab row / tablet+mobile scroll row
4. SearchBar      — desktop inline / tablet expand / mobile fullscreen
5. Navbar         — desktop / tablet / mobile  (3 separate designs)
6. ScoreBar       — fill states + shimmer + skeleton variant
7. ScoreTooltip   — desktop hover panel / mobile bottom sheet
8. SkeletonCard   — matching PostCard dimensions exactly
9. EmptyState     — search / category / error  variants
10. HamburgerMenu — mobile slide-in panel
11. LiveDot       — navbar indicator, pulsing
12. CacheBar      — top-of-page 30s progress bar
13. RankBadge     — up / down / new  animation states
14. InfiniteScroll trigger — wave SVG loader

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛔  ABSOLUTE DO-NOTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ No white or light backgrounds anywhere on any breakpoint
✗ No purple gradients — deep ocean, not synthwave
✗ No Inter, Roboto, or system fonts
✗ No flat colored drop-shadows — only dark rgba shadows
✗ No emoji in final UI — clean SVG line icons only
✗ No generic glassmorphism — cards must have depth, not just blur
✗ No uniform card heights in the desktop 4-col grid
✗ No neon outlines — glow must be subtle and purposeful
✗ No hamburger menu on desktop or tablet
✗ Do not reduce blur on desktop — only reduce on mobile (<768px)
   where backdrop-filter: blur drops to blur(12px) for performance
✗ No bottom navigation bar — this is not a native app
✗ Score tooltip must NEVER appear as a modal on desktop — hover only