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
VISIBLE_NAVIGATION_SIGNAL
+
EXPLICIT_USER_ACTION
```

The attractor field is not an epistemic or cognitive signal:

```text
PORTAL_ATTRACTOR
!=
COGNITIVE_MODEL

TOUCH / POINTER
-> VISUAL_RESPONSE

TOUCH / POINTER
!=
HIDDEN_INTEREST_INFERENCE
```

The field must not use pointer or touch trajectories to choose content, infer interests, build a behavioural profile, or change pedagogical or documentary ranking.

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

The reference deployment model is now the immersive field pioneered by Muze-X Open Learning Commons.

The swarm occupies the viewport as an independent visual layer rather than a content block.

```text
DOCUMENT_LAYOUT
+
FIXED_SWARM_LAYER

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

Navigation links are lightweight overlay controls. They do not reserve layout space and therefore must not alter the dimensions, order or responsive geometry of the underlying page.

## Layout invariant

```text
ATTRACTOR_PRESENT
!=
CONTENT_REFLOW
```

A participating page should retain the same document geometry whether the visual attractor field is active or absent.

## Privacy boundary

The portal requires no account and no user profile.

The reference implementation stores no pointer path, touch path, preference, identifier or behavioural event.

```text
LOCAL_VISUAL_STATE
-> discarded with page lifecycle
```

Navigation remains an ordinary explicit hyperlink action.

## Deployment requirement

Every public HTML surface of a participating deployment should expose the full-screen attractor assets unless a documented accessibility or technical reason requires a reduced alternative.

Muze-X Lab should expose the currently active annexes through lightweight overlay navigation while preserving the common immersive field.

CI should verify the presence of the attractor assets and their references so future interface changes do not silently break the public knowledge mesh.

## Epistemic boundary

The visual attractor is design language and exploratory interface R&D.

```text
VISUAL_METAPHOR != SCIENTIFIC_PROOF
INTERACTION_EFFECT != COGNITIVE_MEASUREMENT
```

No scientific validation is claimed by its use.
