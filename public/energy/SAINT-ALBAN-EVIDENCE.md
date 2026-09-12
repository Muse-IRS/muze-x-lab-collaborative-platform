# Saint-Alban — registre de preuves du modèle thermique

Ce registre accompagne la page publique `/energy/`. Son rôle est de remplacer progressivement les hypothèses de simulation par des données vérifiables sans confondre **fait documenté**, **donnée partielle** et **variable encore ouverte**.

## Règle de lecture

- **Prouvé** : la donnée est portée par une source publique identifiable et peut être utilisée comme contrainte du modèle.
- **Partiel** : une partie de la chaîne est documentée, mais la donnée spécifique nécessaire au scénario Saint-Alban manque encore.
- **Ouvert** : aucune valeur locale n'est attribuée ; l'hypothèse reste pédagogique ou nulle.

## Matrice

| ID | Variable | État | Preuve / source | Conséquence pour le modèle |
| --- | --- | --- | --- | --- |
| E-01 | Mode de refroidissement et hydraulique 2025 | **Prouvé** | [EDF — Rapport environnemental annuel Saint-Alban 2025](https://www.edf.fr/sites/groupe/files/2026-06/Rapport%20Environnemental%20Annuel%20SAL%202025_0.pdf) | Circuit ouvert ; ≈3,583 milliards de m³ prélevés en 2025 ; débit instantané maximal observé ≈134 m³/s pour une limite de 140 m³/s. |
| E-02 | Rejets thermiques et limites Rhône | **Prouvé** | [EDF 2025](https://www.edf.fr/sites/groupe/files/2026-06/Rapport%20Environnemental%20Annuel%20SAL%202025_0.pdf) ; [ASNR — rejets thermiques](https://www.asnr.fr/rejets-thermiques-des-centrales-nucleaires-pendant-les-periodes-estivales) | Mesures continues ; échauffement max 2025 : 3,29 °C période froide et 2,07 °C période chaude. Limites permanentes : 4 °C / 26 °C puis 3 °C / 28 °C selon saison. |
| E-03 | Intérêt territorial d'une récupération de chaleur de Saint-Alban | **Prouvé** | [MRAe Auvergne-Rhône-Alpes — cadrage Rhône-Varèze, 24 mars 2026](https://www.mrae.developpement-durable.gouv.fr/IMG/pdf/20260324_apara2018_cadrage_zaerhonevareze_saintmauricelexilclonassurvareze_38_delibere.pdf) | L'autorité demande d'approfondir la faisabilité d'un réseau de chaleur/froid utilisant des énergies de récupération, notamment la centrale de Saint-Alban. |
| E-04 | Demande industrielle existante | **Prouvé** | [France Chaleur Urbaine — réseau OSIRIS 3823C](https://france-chaleur-urbaine.beta.gouv.fr/reseaux/3823C) | 909 GWh livrés à l'industrie en 2024, 6 points de livraison, 125 MW installés. Référence réelle, sans présumer que 100 % sont substituables. |
| E-05 | Qualité thermique industrielle | **Prouvé pour OSIRIS / partiel pour Saint-Alban** | [GIE OSIRIS — services](https://www.osiris-gie.com/nos-services) ; [IRSN — conception REP 1 300 MWe](https://www.irsn.fr/sites/default/files/documents/larecherche/publications-documentation/collection-ouvrages-irsn/6_LAG_chap02.pdf) | OSIRIS distribue de la vapeur 32 bar / 6 bar. Le palier 1 300 MWe est documenté génériquement autour de 65 bar abs / 281 °C à la sortie des GV. Aucun point de soutirage Saint-Alban n'est pour autant établi. |
| E-06 | Besoin résidentiel mesuré | **Partiel** | [INSEE — Saint-Maurice-l'Exil, RP2023](https://www.insee.fr/fr/statistiques/2011101?geo=COM-38425) | Parc et combustible principal connus ; profil horaire et besoin thermique utile local restent à documenter. |
| E-07 | Emprises, servitudes, réseaux enterrés | **Ouvert** | À obtenir auprès des gestionnaires / collectivités / exploitants concernés | La géométrie actuelle reste un corridor de pré-étude, pas une emprise de travaux. |
| E-08 | Devis et CAPEX Saint-Alban | **Ouvert** | Devis, bordereaux de prix, marchés comparables ou estimation d'ingénierie à collecter | Les M€/km et coûts d'équipements restent des hypothèses pédagogiques. |
| E-09 | Contrat, financement, tarification et propriété du futur réseau | **Ouvert** | Délibérations, convention de DSP/concession, statuts de régie/SEM/SPL, contrat de fourniture ou montage à obtenir | Les scénarios régie/concession/mixte restent illustratifs. Les données OSIRIS ne sont pas transférées au futur réseau par analogie. |
| E-10 | Règles réelles de soutirage nucléaire | **Ouvert** | Étude EDF/ASNR à obtenir : point de soutirage, P/T, MWth, disponibilité, transitoires, modifications de sûreté, coût d'opportunité | Aucune puissance thermique nucléaire locale ne doit être présentée comme disponible ou autorisée tant que cette pièce manque. |

## Falsification déjà acquise

Le réseau industriel OSIRIS documente une demande de **vapeur** à 32/6 bar. La boucle territoriale pédagogique à 90/50 °C ne peut donc pas représenter à elle seule les usages résidentiels et industriels. Le modèle doit conserver au minimum deux branches :

`source nucléaire → branche basse/moyenne température → bâtiments`

`source nucléaire → branche haute température / vapeur → industrie`

La question centrale devient :

> **Quel soutirage nucléaire, à quel niveau thermodynamique, par quel corridor, sous quel contrat et à quel coût ?**

## Prochaines pièces à fermer

1. Profils thermiques mesurés ou séries suffisamment fines des consommateurs industriels et résidentiels.
2. Devis / barèmes traçables pour conduites, génie civil, échangeurs, pompes, sous-stations et franchissements.
3. Emprises, servitudes, sous-sol et compatibilité avec les réseaux existants.
4. Contrats et montage financier : propriétaire, maître d'ouvrage, exploitant, tarification et allocation du risque.
5. Étude EDF/ASNR de soutirage de chaleur spécifique à Saint-Alban.

Aucune donnée manquante n'est remplacée par une affirmation. Tant qu'une pièce n'est pas obtenue, elle reste **ouverte**.