# Argent · temps · dette — public adapter

Public-facing assets for the bounded Muze-X Number & Information page.

## Published assets

- `index.html` — public explanation and official figures;
- `series-2007-2026.csv` — bounded annual State-financing series used by the public page;
- `maturity-ladder-2026-2032.csv` — bounded OAT/OAT€i/OATi face-value maturity ladder;
- `maturity-ladder-scope.md` — publication perimeter and settlement-date boundary for the maturity ladder;
- `oat-fr0014016g71-history.csv` — event-by-event history of OAT 2.40% 24 September 2029 through settlement on 24 August 2026;
- `fr0014016g71/index.html` — bounded public explanation following one OAT from creation through repeated reopenings to its current state and contractual maturity.

## Publication boundary

The adapter exposes dated official figures, explicit formulas, scope labels, descriptive ratios, rounding notes and primary-source links. The Muze-X shorthand `A^[A] = A` is presented only as a defined conceptual notation, not as an established economic law.

For the maturity ladder, published `encours` values are face / nominal outstanding amounts. Inflation-linked OAT values are not presented as exact future redemption cash amounts. Auction date and settlement date remain distinct.

For `FR0014016G71`, the public adapter separates the stable security identity (ISIN, EUR denomination, fixed coupon, maturity rule) from changing state variables (outstanding amount, auction price and auction yield). Current outstanding must not be presented as the immutable final principal at maturity because later reopenings or buybacks can change the line before 24 September 2029.
