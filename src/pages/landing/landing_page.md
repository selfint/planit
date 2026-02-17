# Landing Page

## Overview

The landing page is the `/` route. It introduces Planit and routes users into
core planner flows.

## Page Contents

- `LandingNav` header component with desktop links and mobile menu toggle.
- `LandingHero` section with headline, summary, and primary/secondary CTAs.
- Hero video placeholder block with skeleton state and four FTUX variants
  (desktop/mobile x light/dark) controlled by Tailwind visibility classes.
- Feature grid composed from five `LandingFeatureCard` instances.
- Final CTA section linking to `/plan` and `/catalog`.

## Data Flow

1. `LandingPage()` clones the template and mounts `LandingNav` and `LandingHero`.
2. Feature hosts (`data-landing-feature-card`) are replaced with
   `LandingFeatureCard(...)` instances using local static feature data.
3. Landing demo video elements are rendered in HTML and shown/hidden by
   Tailwind `md:` + `dark:` classes to match user device and theme.
4. `setupLandingDemoVideo(...)` assigns each video source by its
   `data-landing-demo-video` variant key and reveals the section once a video is
   ready.
5. Media containers are marked with `data-video-ready="false"` for future lazy
   media loading behavior.

## Unit Tests

### `renders mounted page regions`

WHAT: Verifies page composition mounts navigation and hero subcomponents.
WHY: Protects route-shell rendering from breakage when composition code changes.
HOW: Mocks `LandingNav` and `LandingHero`, renders `LandingPage()`, then checks component markers.

```python
mock(LandingNav).returns(marker('LandingNav'))
mock(LandingHero).returns(marker('LandingHero'))
page = LandingPage()
assert page.query('[data-component="LandingNav"]') is not None
assert page.query('[data-component="LandingHero"]') is not None
```

### `replaces feature hosts with five feature cards`

WHAT: Verifies all feature placeholders are replaced by real cards.
WHY: Ensures CTA routing coverage across all promoted landing flows.
HOW: Mocks `LandingFeatureCard` to expose `href`, renders page, then asserts five cards and expected link targets.

```python
mock(LandingFeatureCard).returns(card_with_href_metadata)
page = LandingPage()
cards = page.query_all('[data-component="LandingFeatureCard"]')
assert len(cards) == 5
assert hrefs(cards) == ['/plan', '/catalog', '/search', '/semester', '/course']
```

## Integration Tests

### `renders hero and navigation actions`

WHAT: Verifies the landing route shows core top-of-page content and CTAs.
WHY: Confirms users can immediately navigate into main planner flows from `/`.
HOW: Navigates to root, asserts nav/hero containers are visible, then checks visible CTA anchors.

```python
page.goto('/')
assert page.locator('[data-component="LandingNav"]').is_visible()
assert page.locator('[data-component="LandingHero"]').is_visible()
assert page.locator('a[href="/plan"]').first().is_visible()
assert page.locator('a[href="/catalog"]').first().is_visible()
```

### `shows matching demo video for light and dark modes`

WHAT: Verifies landing shows the correct demo variant for the current device
viewport when switching between light and dark color schemes.
WHY: Protects responsive + theme-driven video visibility behavior used by the
FTUX showcase.
HOW: Reads current viewport bucket (mobile/desktop), emulates light then dark
mode, reloads route, and asserts matching `data-landing-demo-video` visibility.

```python
page.goto('/')
device = 'mobile' if viewport_width(page) < 768 else 'desktop'
page.emulate_media(color_scheme='light')
page.reload()
assert page.locator(f'[data-landing-demo-video="{device}-light"]').is_visible()
page.emulate_media(color_scheme='dark')
page.reload()
assert page.locator(f'[data-landing-demo-video="{device}-dark"]').is_visible()
```
