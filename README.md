# Muze-X Lab Collaborative Platform

Plateforme publique collaborative multi-domaines : des interfaces claires, vérifiables et respectueuses de la vie privée.

**Vers l’infini des possibles — et au-delà.**

## Modules publics

- **DPE / Logement** — retrouver un DPE à partir de son numéro ADEME et lire ses informations essentielles sans transformer la donnée source en verdict.
- **Énergie** — comprendre une consommation annuelle, une puissance souscrite et, lorsque les prix sont fournis, obtenir une estimation simple du coût annuel.

## Contrat public

Ce dépôt contient uniquement la couche publique nécessaire à l’utilisation des interfaces : présentation, traitements navigateur indispensables, limites, sources externes et confidentialité.

Il ne contient aucune donnée personnelle, aucun PRM/PDL, aucune pièce de dossier, aucun secret ou credential. Les travaux de conception et d’exploration ne font pas partie de ce dépôt public.

## Confidentialité

Aucun compte utilisateur, aucune publicité, aucun profilage comportemental et aucun outil d’analytics n’est intégré à la plateforme.

Le module Énergie calcule localement dans le navigateur. Le module DPE interroge directement les jeux de données publics ADEME depuis le navigateur. L’infrastructure d’hébergement et les services externes consultés peuvent traiter les données techniques nécessaires à la connexion, notamment l’adresse IP.

## Déploiement

GitHub Pages publie exclusivement le répertoire `public/` via `.github/workflows/pages.yml`.

## Licence

Apache License 2.0. Voir `LICENSE` et `NOTICE`.
