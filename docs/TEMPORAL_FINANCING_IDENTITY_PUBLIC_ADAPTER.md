# Temporal financing identity — public adapter

## Purpose

This public adapter exposes one bounded arithmetic result from the private Muze-X fiat-money temporal research model without publishing the internal research method.

## Public relation

Using the official French State financing table for 2026, in EUR billions:

```text
178.3 + 124.4 + 3.0 = 305.7
310.0 - 2.3 - 2.0   = 305.7
```

Meaning of the first line:

- `178.3` = `175.8` medium/long-term debt amortisation + `2.5` assumed SNCF Réseau debt amortisation;
- `124.4` = deficit to finance in the 2026 State financing table;
- `3.0` = other treasury needs;
- `305.7` = total financing requirement.

Meaning of the second line:

- `310.0` = medium/long-term issuance net of buybacks;
- `-2.3` = net change in short-term State securities;
- `-2.0` = other treasury resources;
- `305.7` = total financing resources.

## Public qualification

```text
PUBLISHED_COMPONENTS
-> RECOMPOSITION
-> DELTA = 0.0 ON DISPLAYED VALUES
-> CONVERGENCE
```

`CONVERGENCE` means arithmetic reproduction of the displayed official total only.

It does not mean:

```text
financing-table convergence = proof of a globally closed monetary system
new issuance = one-to-one refinancing of old securities
new debt = automatic money creation
124.4 financing-table deficit = 134.627 LFI State budget balance
```

## Temporal reading allowed publicly

The public page may state that the 2026 financing need combines:

```text
PAST-CONTRACTED MATURITIES
+
CURRENT-YEAR FINANCING GAP
+
OTHER TREASURY NEEDS
=
PRESENT FINANCING NEED
```

and that new medium/long-term debt issuance is one major resource used to cover this present need, creating later maturities.

This is a bounded institutional reading of the published table, not a complete model of the monetary system.

## Sources

Consulted 2026-09-06:

- Agence France Trésor — State budget / 2026 financing requirement and resources: https://www.aft.gouv.fr/fr/budget-etat
- Projet de loi de finances pour 2026 — financing table: https://www.budget.gouv.fr/documentation/file-download/30589
- Agence France Trésor — indicative financing programme 2026: https://www.aft.gouv.fr/fr/programme-indicatif-financement-letat
- Direction du Budget — LFI 2026 key figures: https://www.budget.gouv.fr/reperes/loi_de_finances/articles/chiffres-cles-budget-etat-2026
