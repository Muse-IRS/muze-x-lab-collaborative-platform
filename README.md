# Muze-X Lab Collaborative Platform

Plateforme publique collaborative multi-domaines : des interfaces claires, vérifiables et respectueuses de la vie privée.

**Vers l’infini des possibles — et au-delà.**

## Couche transversale de traitement informationnel

La plateforme ne vise pas seulement à rendre des données accessibles. Elle vise aussi à rendre visible ce qui permet de les comprendre : provenance, temporalité, relations, limites, incertitude et possibilité de requalification.

```text
SOURCE
→ PROVENANCE
→ TEMPS
→ RELATIONS
→ QUALIFICATION
→ COMPRÉHENSION
```

Le terme **« déchets informationnels »** désigne ici des informations qui nécessitent encore un traitement avant de pouvoir être comprises, reliées, réutilisées ou écartées avec justification.

```text
DÉCHET INFORMATIONNEL != INFORMATION FAUSSE
DÉCHET INFORMATIONNEL != INFORMATION À SUPPRIMER
UNKNOWN = RÉSULTAT VALIDE
```

Une information peut être un doublon, être devenue obsolète relativement à un usage, avoir perdu sa provenance, n’être qu’un fragment, diverger d’une autre version ou être accompagnée d’un niveau de certitude excessif. Le traitement cherche d’abord à conserver la source, la dater, la relier et qualifier ce qui peut réellement être affirmé.

La page publique `public/information/` présente ce cadre transversal en langage accessible.

Des conférences d’Idriss Aberkane ont nourri l’intuition ayant conduit à employer l’expression « déchets informationnels » dans ce travail. Cette mention décrit une inspiration ; elle n’implique ni affiliation, ni participation au projet, ni attribution d’une paternité scientifique sur le cadre développé ici.

## Modules publics

- **DPE / Logement** — retrouver un DPE à partir de son numéro ADEME et lire ses informations essentielles sans transformer la donnée source en verdict.
- **Énergie** — comprendre une consommation annuelle, une puissance souscrite et, lorsque les prix sont fournis, obtenir une estimation simple du coût annuel.

Le traitement informationnel reste transversal : il n’est pas présenté comme un domaine métier supplémentaire.

## RGPD transversal

Le site autonome **RGPD Data Journey Audit** constitue la référence publique pour la compréhension du parcours des données, des droits, des traces locales et des incohérences documentaires.

Muze-X Lab conserve cette séparation : le site RGPD n’est pas dupliqué dans un sous-répertoire local de la plateforme.

## Finalité égalitaire

L’accès à l’information ne suffit pas si la capacité à la trier, la dater, la relier et comprendre ses limites reste inégalement distribuée.

```text
ACCÈS
+
TRAITEMENT
+
COMPRÉHENSION
+
TRAÇABILITÉ
=
CAPACITÉ INFORMATIONNELLE
```

La plateforme cherche donc à réduire le coût individuel de mise en intelligibilité sans imposer une conclusion unique et sans produire davantage de certitude que les sources n’en contiennent.

## Contrat public

Ce dépôt contient uniquement la couche publique nécessaire à l’utilisation des interfaces : présentation, traitements navigateur indispensables, limites, sources externes et confidentialité.

Il ne contient aucune donnée personnelle, aucun PRM/PDL, aucune pièce de dossier, aucun secret ou credential. Les travaux de conception et d’exploration non destinés au public ne font pas partie de ce dépôt public.

## Confidentialité

Aucun compte utilisateur, aucune publicité, aucun profilage comportemental et aucun outil d’analytics n’est intégré à la plateforme.

Le module Énergie calcule localement dans le navigateur. Le module DPE interroge directement les jeux de données publics ADEME depuis le navigateur. L’infrastructure d’hébergement et les services externes consultés peuvent traiter les données techniques nécessaires à la connexion, notamment l’adresse IP.

## Déploiement

GitHub Pages publie exclusivement le répertoire `public/` via `.github/workflows/pages.yml`.

Le workflow de validation de la frontière publique vérifie aussi la présence de la page transversale `public/information/index.html`.

## Licence

Apache License 2.0. Voir `LICENSE` et `NOTICE`.
