# Muze-X Portal Attractor Protocol

Status: `PUBLIC / EXPLORATORY VISUAL NAVIGATION`

## Purpose

The portal attractor is the common visual language used to move between autonomous Muze-X public deployments.

```text
MUZE-X LAB
  ↕
PUBLIC ANNEX DEPLOYMENTS
```

Current public annexes:

- Muze-X Open Learning Commons;
- RGPD Data Journey Audit.

The list may grow over time. A new public deployment should remain autonomous while exposing an explicit return path to Muze-X Lab.

## Navigation invariant

```text
PORTAL_ATTRACTOR
=
FULL_VIEWPORT_SWARM_FIELD
+
BOTTOM_NAVIGATION_ANCHOR
+
VISIBLE_NAVIGATION_SIGNAL
+
EXPLICIT_USER_ACTION
```

The attractor field is not an epistemic or cognitive signal:

```text
PORTAL_ATTRACTOR
!=
COGNITIVE_MODEL

TOUCH / POINTER / SCROLL_VISIBILITY
-> VISUAL_RESPONSE

TOUCH / POINTER / SCROLL_VISIBILITY
!=
HIDDEN_INTEREST_INFERENCE
```

The field must not use pointer, touch or scroll trajectories to choose content, infer interests, build a behavioural profile, or change pedagogical or documentary ranking.

## Topology

The multi-domain platform exposes links toward the currently active public annexes.

Each annex exposes an explicit return path toward the multi-domain platform.

```text
                 MUZE-X LAB
               /            \
     OPEN LEARNING          RGPD
          ↑                   ↑
          └──── explicit ─────┘
               navigation
```

Direct links between annexes may be added when useful, but they are not required for the basic topology.

## Visual behaviour

The reference deployment model is the immersive field pioneered by Muze-X Open Learning Commons.

The swarm occupies the viewport as an independent visual layer rather than a content block.

```text
DOCUMENT_LAYOUT
+
FIXED_SWARM_LAYER
+
BOTTOM_ANCHOR_SECTION
```

The bottom anchor section is intentionally part of the document flow. The swarm field itself is not.

```text
FIXED_SWARM_LAYER
!=
DOCUMENT_FLOW_BLOCK
```

The field uses:

- two interleaved particle populations;
- cyan / violet Muze-X visual language;
- apparent depth through size, glow and motion;
- horizontal and vertical movement across the complete viewport;
- edge wrapping so particles may leave one side and re-enter from the opposite side;
- slowly drifting attractor centres;
- stronger attraction toward an explicit pointer or touch location;
- responsive sizing;
- `prefers-reduced-motion` support.

## Bottom anchor behaviour

A circular navigation anchor is placed immediately before the footer of every participating public page.

When the circle enters the viewport, the existing full-screen particle populations converge locally toward it. No separate particle population is created.

```text
ANCHOR_VISIBLE
-> LOCAL_SWARM_GATHERING

ANCHOR_HIDDEN
-> BASE_FIELD_DYNAMICS
```

The circle remains an ordinary explicit hyperlink. On annex deployments it returns to Muze-X Lab. On Muze-X Lab it opens Open Learning Commons, while the floating mesh navigation continues to expose the other active annexes.

The current tablet/desktop anchor target is approximately `292 CSS px`, calibrated from interior text rather than from the page grid; the small-screen target is reduced further.

Directly below the circle, the interface exposes:

- current technique: Canvas 2D, two cyan/violet swarms, full-viewport field and anchor attractor;
- rendered effect: emergent perceptual depth and dynamic gathering;
- status: exploratory R&D, with explicit separation between visual metaphor and scientific model.

## Layout invariant

```text
ATTRACTOR_PRESENT
!=
CONTENT_REFLOW
```

This invariant refers to the fixed swarm layer: enabling or disabling the background field must not change the geometry of existing content. The bottom anchor is a deliberate shared navigation section and therefore does occupy its own documented place immediately before the footer.

## Privacy boundary

The portal requires no account and no user profile.

The reference implementation stores no pointer path, touch path, scroll path, preference, identifier or behavioural event.

```text
LOCAL_VISUAL_STATE
-> discarded with page lifecycle
```

Navigation remains an ordinary explicit hyperlink action.

## Deployment requirement

Every public HTML surface of a participating deployment should expose the full-screen attractor assets and the bottom anchor unless a documented accessibility or technical reason requires a reduced alternative.

Muze-X Lab should expose the currently active annexes through lightweight overlay navigation while preserving the common immersive field and the bottom anchor.

CI should verify the presence of the attractor assets, anchor implementation and conceptual-interface qualification so future interface changes do not silently break the public knowledge mesh.

## Epistemic boundary

The visual attractor is design language and exploratory interface R&D.

```text
VISUAL_METAPHOR != SCIENTIFIC_PROOF
INTERACTION_EFFECT != COGNITIVE_MEASUREMENT
PERCEIVED_DEPTH != GEOMETRIC_3D
```

No scientific validation is claimed by its use.
