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
VISIBLE_NAVIGATION_SIGNAL
+
EXPLICIT_USER_ACTION
```

It is not an epistemic or cognitive signal:

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

The portal must not use pointer or touch trajectories to choose content, infer interests, build a behavioural profile, or change pedagogical ranking.

## Topology

The multi-domain platform exposes portals toward the currently active public annexes.

Each annex exposes a portal back toward the multi-domain platform.

```text
                 MUZE-X LAB
               /            \
     OPEN LEARNING          RGPD
          ↑                   ↑
          └──── explicit ─────┘
               navigation
```

Direct links between annexes may be added when they are useful, but they are not required for the basic topology.

## Visual behaviour

The compact portal uses a bounded local swarm with:

- two interleaved particle populations;
- cyan / violet Muze-X visual language;
- apparent depth through size, glow and motion;
- weak ambient attraction toward the portal centre;
- stronger attraction toward an explicit pointer or touch location;
- responsive sizing;
- `prefers-reduced-motion` support.

The immersive Open Learning implementation may use a full-screen field. The compact deployment portal is a navigation derivative, not a claim that every page must run the full immersive field.

## Privacy boundary

The portal requires no account and no user profile.

The reference implementation stores no pointer path, touch path, preference, identifier or behavioural event.

```text
LOCAL_VISUAL_STATE
-> discarded with page lifecycle
```

Navigation itself remains an ordinary explicit hyperlink action.

## Deployment requirement

Every public HTML surface of a participating annex should expose the portal unless a documented accessibility or technical reason requires an alternative visible return link.

Muze-X Lab should expose the currently active annexes through the same visual language.

CI should verify the presence of the portal assets and their references so that future interface changes do not silently break the public knowledge mesh.

## Epistemic boundary

The visual attractor is design language and exploratory interface R&D.

```text
VISUAL_METAPHOR != SCIENTIFIC_PROOF
INTERACTION_EFFECT != COGNITIVE_MEASUREMENT
```

No scientific validation is claimed by its use.