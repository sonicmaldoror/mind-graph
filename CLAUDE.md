# Cartographie de la philosophie de l'esprit contemporaine

## Contexte
Application web monopage présentant un graphe de réseau interactif 
des grandes dimensions conceptuelles de la philosophie de l'esprit 
depuis le milieu du XXe siècle. Destinée à un public cultivé 
(philosophie des sciences, physique).

## Architecture
- SPA vanilla HTML/CSS/JS (pas de framework)
- D3.js v7 pour le graphe force-directed
- Données dans `data/graph-data.json` (source de vérité unique)
- Hébergement statique (GitHub Pages)

## Fichiers de référence
- `data/graph-data.json` : toutes les données (nœuds, liens, familles, 
  références bibliographiques). Ne jamais hardcoder de données graphe 
  ailleurs — tout vient de ce fichier.
- `backlog.md` : spécifications complètes, user stories, inventaire 
  des nœuds et liens avec justifications.

## Conventions
- Langue de l'interface : français
- Noms de variables/fonctions : anglais
- Les 5 familles sont : Matérialités, Architectures, Expériences, 
  Sémantiques, Performations (jamais d'autre formulation)
- Deux types de nœuds : "concept" (cercle plein) et "author" (cercle 
  pointillé)
- Trois types de liens : "filiation" (trait plein gris), "opposition" 
  (pointillé rouge), "reformulation" (tireté bleu)
- Dark mode obligatoire (prefers-color-scheme + toggle)
- Typographie : Inter ou système sans-serif
- Pas de dépendances NPM, pas de build step — fichiers servis 
  directement

## Qualité
- Le JSON est la source de vérité. Si un concept ou un lien manque, 
  l'ajouter dans graph-data.json, pas dans le JS.
- Chaque nœud DOIT avoir : id, label, family, type, weight, 
  description, references[]
- Chaque lien inter-familles DOIT avoir un champ "description" 
  justifiant le lien
- Les références bibliographiques suivent le format : 
  { author, year, title, [journal], [volume], [pages], [publisher], [in] }