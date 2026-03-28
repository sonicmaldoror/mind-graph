# CLAUDE.md — Mind Graph

## Contexte

Application web monopage présentant une cartographie interactive des grandes dimensions conceptuelles de la philosophie de l'esprit contemporaine (depuis le milieu du XXe siècle). Le graphe de réseau permet d'explorer les filiations, oppositions et reformulations entre concepts et auteurs.

Ce projet est un instrument de médiation intellectuelle entre David Lechermeier (EdTech, innovation pédagogique, co-fondateur de MAIEUTIS) et son père Gilbert Lechermeier (docteur en philosophie des sciences et en physique, auteur de *Le vivant : la singularité et l'universel*, Éditions Matériologiques, 2019). Il est conçu pour évoluer par expérimentations successives — on ne sait pas encore où il va nous mener.

Déployé sur GitHub Pages : `sonicmaldoror.github.io/mind-graph/`

---

## Architecture technique

- **SPA vanilla** : HTML/CSS/JS, pas de framework (React, Vue, etc.), pas de build step
- **Graphe** : D3.js v7 (force-directed layout), chargé depuis CDN
- **Données** : fichier unique `data/graph-data.json` — source de vérité exclusive
- **Hébergement** : GitHub Pages (statique)
- **Dark mode** : `prefers-color-scheme` + toggle manuel — obligatoire, tout doit être lisible sur fond sombre
- **Responsive** : viewBox SVG adaptatif. Desktop (1200px+) : graphe + panneau latéral. Tablette (768px+) : graphe + drawer bas. Mobile : graphe simplifié

---

## Arborescence

```
mind-graph/
├── index.html
├── CLAUDE.md                  ← ce fichier
├── styles/
│   └── main.css
├── scripts/
│   ├── app.js                 # Point d'entrée, initialisation
│   ├── graph.js               # Layout D3, rendu SVG, simulation
│   ├── interactions.js        # Clic, survol, filtre, recherche
│   ├── panel.js               # Panneau latéral détail
│   └── parcours.js            # Navigation des parcours épistémiques
├── data/
│   └── graph-data.json        # TOUTES les données — ne jamais hardcoder ailleurs
├── assets/
│   └── favicon.svg
└── README.md
```

---

## Source de vérité : `graph-data.json`

Ce fichier contient TOUT : familles, nœuds, liens, références bibliographiques, URLs SEP, et parcours épistémiques. Aucune donnée de contenu ne doit exister dans le JS — le JS ne fait que lire et rendre le JSON.

### Schéma d'un nœud

```json
{
  "id": "fonc",                          // identifiant unique, snake_case
  "label": "Fonctionnalisme",            // label affiché, en français
  "family": "mat",                       // ID de la famille (mat|arc|exp|sem|per)
  "type": "concept",                     // "concept" ou "author"
  "weight": 13,                          // rayon du nœud (4-14)
  "period": "1967-",                     // période d'émergence (optionnel)
  "description": "Le mental défini...",  // texte descriptif, 1-3 phrases
  "references": [                        // tableau de références bibliographiques
    {
      "author": "Putnam, H.",
      "year": 1967,
      "title": "Psychological Predicates",
      "in": "Art, Mind, and Religion",   // optionnel
      "journal": "",                     // optionnel
      "volume": "",                      // optionnel
      "pages": "",                       // optionnel
      "publisher": ""                    // optionnel
    }
  ],
  "sep_url": "https://plato.stanford.edu/entries/functionalism/"  // optionnel
}
```

### Schéma d'un lien

```json
{
  "source": "phys_red",                  // ID du nœud source
  "target": "fonc",                      // ID du nœud cible
  "type": "filiation",                   // "filiation" | "opposition" | "reformulation"
  "description": "Le fonctionnalisme..." // justification du lien (obligatoire pour inter-familles)
}
```

### Schéma d'un parcours épistémique

```json
{
  "id": "effectivite_emergence",
  "title": "De l'effectivité à l'émergence",
  "subtitle": "Le mental agit-il, et si oui, comment ?",
  "description": "Parcours traversant la question de...",
  "color": "#D4537E",
  "steps": [
    {
      "node": "fonc",                    // ID du nœud — DOIT exister dans nodes[]
      "text": "Point de départ : ...",   // texte de transition vers/depuis ce nœud
      "period": "1967"                   // optionnel, pour affichage chronologique
    }
  ]
}
```

---

## Les 5 familles — terminologie canonique

| ID | Nom (INVARIABLE) | Couleur | Question directrice |
|----|-------------------|---------|---------------------|
| `mat` | Matérialités | #534AB7 (violet) | De quoi les états mentaux sont-ils faits ? |
| `arc` | Architectures | #0F6E56 (teal) | Comment l'esprit est-il organisé ? |
| `exp` | Expériences | #D85A30 (corail) | Quel est le statut de l'expérience subjective ? |
| `sem` | Sémantiques | #185FA5 (bleu) | Comment les états mentaux acquièrent-ils leur signification ? |
| `per` | Performations | #D4537E (rose) | Comment le mental agit-il sur le monde ? |

Ne jamais utiliser d'autre formulation pour les noms de famille. Pas de majuscules internes, pas de sous-titres alternatifs.

---

## Les 3 types de liens — rendu visuel

| Type | Sémantique | Rendu |
|------|-----------|-------|
| `filiation` | A engendre ou influence B | Trait plein gris, 0.7px |
| `opposition` | A contredit frontalement B | Trait pointillé rouge (#A32D2D), 1px, dash 4-3 |
| `reformulation` | A reprend le problème de B dans un nouveau cadre | Trait tireté bleu (#185FA5), 0.7px, dash 8-4 |

---

## Les 2 types de nœuds

| Type | Rendu |
|------|-------|
| `concept` | Cercle plein, rayon = weight, fill = famille.lightFill, stroke = famille.color |
| `author` | Cercle stroke-dasharray 2-2, rayon 4-5px, fill transparent, masquable par toggle |

---

## Les 5 parcours épistémiques (v1.2)

| ID | Titre | Étapes | Couleur | Familles traversées |
|----|-------|--------|---------|---------------------|
| `chronologie` | Une chronologie de l'esprit | 15 | #888780 (gris) | toutes |
| `effectivite_emergence` | De l'effectivité à l'émergence | 10 | #D4537E (rose) | per → mat → exp |
| `phenomenologie_computationnalisme` | De la phénoménologie au computationnalisme | 11 | #D85A30 (corail) | exp → arc → sem |
| `normativite` | Vers et depuis la normativité | 8 | #185FA5 (bleu) | sem → arc → mat |
| `chemins_information` | Les chemins de l'information | 10 | #0F6E56 (teal) | arc → mat → exp |

---

## Implémentation des parcours épistémiques

### Principes UX

Un parcours épistémique n'est PAS un simple filtre. C'est une navigation séquentielle guidée à travers le graphe, avec un texte d'accompagnement à chaque étape qui explique POURQUOI on passe d'un nœud au suivant.

L'utilisateur doit pouvoir :
1. Choisir un parcours dans une liste (drawer latéral ou menu)
2. Naviguer étape par étape (boutons précédent/suivant ou flèches clavier)
3. Voir à chaque étape : le nœud courant mis en évidence, les nœuds déjà visités en semi-opacité, les nœuds à venir estompés, et le texte de transition dans le panneau de détail
4. Voir la progression (indicateur d'étape : 3/10)
5. Quitter le parcours à tout moment pour revenir en mode libre

### Comportement du graphe en mode parcours

- Le nœud courant est mis en évidence (stroke épais, pleine opacité, éventuellement léger pulse d'animation)
- Les nœuds déjà parcourus restent visibles à opacité réduite (~0.5), avec les liens entre eux visibles
- Les nœuds à venir sont très estompés (~0.1)
- Tous les nœuds hors parcours sont quasi-invisibles (~0.05)
- À chaque transition, le viewBox SVG se recentre doucement (transition CSS ou D3 transition) sur le nœud courant
- Les liens entre nœuds consécutifs du parcours sont mis en évidence avec la couleur du parcours

### Comportement du panneau de détail en mode parcours

Le panneau affiche :
- Le titre du parcours et l'indicateur d'étape
- Le label du nœud courant
- Le texte de transition (champ `text` du step)
- La période (si présente)
- Les références du nœud
- Le lien SEP (si présent)
- Les boutons précédent/suivant

### Implémentation suggérée

```javascript
// parcours.js — squelette

class ParcourNavigator {
  constructor(parcours, graphRenderer, panelRenderer) {
    this.parcours = parcours;
    this.currentStep = 0;
    this.graph = graphRenderer;
    this.panel = panelRenderer;
  }

  enter() {
    // Activer le mode parcours
    // Estomper tous les nœuds hors parcours
    // Mettre en évidence le premier nœud
    this.renderStep(0);
  }

  next() {
    if (this.currentStep < this.parcours.steps.length - 1) {
      this.currentStep++;
      this.renderStep(this.currentStep);
    }
  }

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep(this.currentStep);
    }
  }

  exit() {
    // Restaurer le mode libre
    // Réinitialiser toutes les opacités
    this.currentStep = 0;
  }

  renderStep(index) {
    const step = this.parcours.steps[index];
    const nodeId = step.node;

    // 1. Mettre à jour les opacités des nœuds
    const visited = this.parcours.steps.slice(0, index).map(s => s.node);
    const upcoming = this.parcours.steps.slice(index + 1).map(s => s.node);
    const allInParcours = this.parcours.steps.map(s => s.node);

    this.graph.setNodeStates({
      highlighted: [nodeId],
      visited: visited,
      upcoming: upcoming,
      hidden: /* tous les nœuds sauf allInParcours */
    });

    // 2. Recentrer le graphe sur le nœud courant
    this.graph.panTo(nodeId, { duration: 600 });

    // 3. Mettre à jour le panneau
    this.panel.showParcourStep({
      parcoursTitle: this.parcours.title,
      stepIndex: index,
      totalSteps: this.parcours.steps.length,
      nodeId: nodeId,
      transitionText: step.text,
      period: step.period
    });
  }
}
```

### Navigation clavier

- Flèche droite / Flèche bas : étape suivante
- Flèche gauche / Flèche haut : étape précédente
- Escape : quitter le parcours

---

## Intégration des URLs SEP

Chaque nœud concept possédant un champ `sep_url` doit afficher un lien discret dans le panneau de détail. Format suggéré :

```html
<a href="{sep_url}" target="_blank" rel="noopener" class="sep-link">
  Approfondir sur SEP →
</a>
```

Style : petit, discret, couleur secondaire, en bas de la fiche après les références. Ne pas rendre ce lien trop proéminent — c'est une porte de sortie vers l'approfondissement, pas le contenu principal.

---

## Accessibilité

Contexte important : l'un des utilisateurs principaux (Gilbert Lechermeier) a une vue fragile. L'accessibilité n'est pas un nice-to-have.

- **Contrastes** : WCAG AA minimum sur tous les labels et textes
- **Épaisseur des liens** : les 3 types de liens doivent être distinguables non seulement par la couleur mais par le pattern de trait (plein/pointillé/tireté) — ET au survol/sélection, les liens doivent s'épaissir significativement (passer à 2-3px)
- **Mode contraste fort** : prévoir un toggle qui augmente toutes les épaisseurs et opacités
- **Focus clavier** : tous les nœuds navigables au clavier (tabindex, focus ring visible)
- **Labels** : `aria-label` sur les éléments interactifs
- **Tailles de texte** : minimum 11px, préférer 12-13px pour les labels secondaires
- **Filtrage par type de lien** : permettre d'afficher uniquement les filiations, ou uniquement les oppositions, pour réduire la charge visuelle

---

## Conventions de code

- **Langue de l'interface** : français
- **Noms de variables/fonctions** : anglais
- **Pas de dépendances NPM**, pas de bundler — les fichiers sont servis directement
- **D3.js** chargé depuis CDN (cdnjs.cloudflare.com)
- **Pas de localStorage** pour les préférences utilisateur (pas nécessaire à ce stade)
- **Indentation** : 2 espaces
- **Commentaires** : en français pour le code métier, en anglais pour le code technique

---

## Principes de design

### Le graphe privilégie la lisibilité sur l'exhaustivité
Si un concept n'a pas au moins 2 liens, il n'a probablement pas sa place. Mieux vaut un graphe lisible de 60 nœuds qu'un graphe illisible de 120.

### Les liens inter-familles sont les plus précieux et les plus fragiles
Chaque lien inter-familles doit être justifiable par au moins un texte de la littérature. Le champ `description` est obligatoire pour ces liens. C'est ce qui distingue notre carte d'un simple index thématique.

### Les parcours épistémiques ne sont pas des résumés
Chaque texte de transition (`steps[].text`) doit dire POURQUOI on passe d'un nœud au suivant — pas simplement décrire le nœud d'arrivée. C'est la logique argumentative du parcours qui fait sa valeur, pas la juxtaposition des fiches.

### La carte est un instrument de dialogue, pas un produit fini
L'architecture doit faciliter l'ajout de nœuds, liens et parcours sans toucher au code. Tout passe par le JSON.

---

## Évolutions prévues (roadmap)

### v1.2 (en cours)
- [ ] Intégration des `sep_url` dans le panneau de détail
- [ ] Implémentation du composant `ParcourNavigator`
- [ ] Menu de sélection des parcours (drawer latéral ou dropdown)
- [ ] Navigation étape par étape avec recentrage
- [ ] Indicateur de progression
- [ ] Navigation clavier (flèches + Escape)

### v1.3 (à planifier)
- [ ] Recherche texte (filtre par nom ou description)
- [ ] Zoom sémantique (labels secondaires au zoom)
- [ ] Mode contraste fort
- [ ] Filtrage par type de lien
- [ ] Export SVG/PNG de l'état courant

### v2.0 (à discuter)
- [ ] Données éditables (mode admin)
- [ ] Citations en format BibTeX/APA
- [ ] Interface bilingue FR/EN
- [ ] Annotations partagées

---

## Références de projet

- **Backlog complet** : `backlog_cartographie_philosophie_esprit.md` (spécifications détaillées, inventaire exhaustif des nœuds et liens avec justifications)
- **Données** : `data/graph-data.json` v1.2 (78 nœuds, 109 liens, 51 URLs SEP, 5 parcours / 54 étapes)
- **Patch v1.2** : `patch-v1.2-sep-parcours.json` (si application incrémentale préférée)

---

*CLAUDE.md — v1.2 — 28 mars 2026*
