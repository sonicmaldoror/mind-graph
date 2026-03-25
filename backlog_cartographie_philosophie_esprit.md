# Cartographie de la philosophie de l'esprit contemporaine

## Application web autonome — Backlog et spécifications

---

## 1. Vision produit

Une application web monopage (SPA) qui présente une cartographie interactive des grandes dimensions conceptuelles de la philosophie de l'esprit depuis le milieu du XXe siècle. Le graphe de réseau permet d'explorer les filiations, oppositions et reformulations entre concepts et auteurs, organisés selon cinq familles structurantes :

| Famille | Couleur | Question directrice |
|---------|---------|---------------------|
| **Matérialités** | Violet (#534AB7) | De quoi les états mentaux sont-ils faits ? |
| **Architectures** | Teal (#0F6E56) | Comment l'esprit est-il organisé ? |
| **Expériences** | Corail (#D85A30) | Quel est le statut de l'expérience subjective ? |
| **Sémantiques** | Bleu (#185FA5) | Comment les états mentaux acquièrent-ils leur signification ? |
| **Performations** | Rose (#D4537E) | Comment le mental agit-il sur le monde ? |

---

## 2. Stack technique recommandé

- **Framework** : HTML/CSS/JS vanilla (pas de framework React/Vue nécessaire pour ce scope) — ou Astro/Vite si on veut un pipeline de build propre
- **Graphe** : D3.js v7 (force-directed layout)
- **Données** : fichier JSON séparé (`graph-data.json`) pour faciliter l'édition
- **Hébergement** : GitHub Pages, Netlify ou Vercel (statique)
- **Dark mode** : `prefers-color-scheme` + toggle manuel
- **Responsive** : viewBox SVG adaptatif, contrôles repliables sur mobile

---

## 3. Architecture des données

### 3.1 Fichier `graph-data.json`

```json
{
  "families": [
    {
      "id": "mat",
      "name": "Matérialités",
      "color": "#534AB7",
      "lightFill": "#EEEDFE",
      "description": "De quoi les états mentaux sont-ils faits ?"
    }
  ],
  "nodes": [
    {
      "id": "fonc",
      "label": "Fonctionnalisme",
      "family": "mat",
      "type": "concept",
      "description": "Le mental défini par son rôle fonctionnel, indépendamment du substrat",
      "references": [
        { "author": "Putnam, H.", "year": 1967, "title": "Psychological Predicates", "in": "Art, Mind, and Religion" },
        { "author": "Fodor, J.", "year": 1974, "title": "Special Sciences", "journal": "Synthese", "vol": "28" },
        { "author": "Lewis, D.", "year": 1972, "title": "Psychophysical and Theoretical Identifications", "journal": "Australasian Journal of Philosophy", "vol": "50(3)" },
        { "author": "Block, N.", "year": 1978, "title": "Troubles with Functionalism", "in": "Minnesota Studies in the Philosophy of Science, 9" }
      ],
      "weight": 13
    },
    {
      "id": "a_putnam",
      "label": "Putnam",
      "family": "mat",
      "type": "author",
      "description": "Fonctionnalisme, réalisabilité multiple, externalisme sémantique",
      "references": [
        { "author": "Putnam, H.", "year": 1967, "title": "Psychological Predicates" },
        { "author": "Putnam, H.", "year": 1975, "title": "The Meaning of 'Meaning'", "journal": "Minnesota Studies in the Philosophy of Science, 7" }
      ],
      "weight": 5
    }
  ],
  "links": [
    {
      "source": "phys_red",
      "target": "fonc",
      "type": "filiation",
      "description": "Le fonctionnalisme succède au physicalisme réductif en abandonnant l'identité type-type"
    },
    {
      "source": "fonc",
      "target": "qualia",
      "type": "opposition",
      "description": "Les qualia résistent à la caractérisation fonctionnelle (Block 1978)"
    },
    {
      "source": "iit",
      "target": "mon_ru",
      "type": "reformulation",
      "description": "L'IIT reformule l'intuition du monisme russellien en termes mathématiques (Φ)"
    }
  ]
}
```

### 3.2 Types de liens

| Type | Sémantique | Rendu visuel |
|------|-----------|--------------|
| `filiation` | A engendre ou influence B | Trait plein gris |
| `opposition` | A contredit frontalement B | Trait pointillé rouge |
| `reformulation` | A reprend le problème de B dans un nouveau cadre | Trait tiret bleu |

### 3.3 Types de nœuds

| Type | Sémantique | Rendu visuel |
|------|-----------|--------------|
| `concept` | Position théorique ou problème | Cercle plein, couleur de la famille |
| `author` | Penseur associé à un ou plusieurs concepts | Cercle pointillé, plus petit |

---

## 4. Inventaire complet des nœuds (v1)

### 4.1 Matérialités (10 concepts + 4 auteurs)

| ID | Label | Type | Description | Références clés |
|----|-------|------|-------------|-----------------|
| behaviorisme | Behaviorisme logique | concept | Les états mentaux comme dispositions comportementales | Ryle 1949 |
| phys_red | Physicalisme réductif | concept | Identité type-type entre états mentaux et cérébraux | Smart 1959; Place 1956 |
| fonc | Fonctionnalisme | concept | Le mental défini par son rôle fonctionnel | Putnam 1967; Fodor 1974; Lewis 1972; Block 1978 |
| mon_an | Monisme anomal | concept | Identité des tokens sans lois psychophysiques | Davidson 1970 |
| phys_nr | Physicalisme non réductif | concept | Survenance sans réduction | Kim 1993 |
| panpsy | Panpsychisme | concept | Proto-expérience à tous niveaux | Strawson 2006; Goff 2017, 2019; Chalmers 2015 |
| mon_ru | Monisme russellien | concept | Nature intrinsèque phénoménale | Russell 1927; Alter & Nagasawa 2015 |
| dual_p | Dualisme des propriétés | concept | Propriétés phénoménales irréductibles | Chalmers 1996 |
| emerg | Émergentisme | concept | Propriétés de niveau supérieur causalement efficaces | O'Connor & Wong 2005; Broad 1925 |
| eliminat | Éliminativisme | concept | Remplacement de la psychologie populaire | Churchland P.M. 1981; Churchland P.S. 1986 |
| a_kim | Kim | author | Survenance, exclusion causale | Kim 1993, 1998, 2005 |
| a_davidson | Davidson | author | Monisme anomal, interprétation radicale | Davidson 1970, 1984 |
| a_putnam | Putnam | author | Fonctionnalisme, réalisabilité multiple, externalisme | Putnam 1967, 1975 |
| a_goff | Goff | author | Panpsychisme contemporain | Goff 2017, 2019 |

### 4.2 Architectures (11 concepts + 4 auteurs)

| ID | Label | Type | Description | Références clés |
|----|-------|------|-------------|-----------------|
| comp | Computationnalisme | concept | L'esprit comme système de traitement symbolique | Fodor 1975; Pylyshyn 1984; Marr 1982 |
| conn | Connexionnisme | concept | Réseaux de neurones et traitement distribué | Rumelhart & McClelland 1986 |
| embod | Cognition incarnée | concept | Le corps constitutif de la cognition | Lakoff & Johnson 1999; Shapiro 2011 |
| embed | Cognition située | concept | Niche écologique et affordances | Gibson 1979 |
| ext | Esprit étendu | concept | Les processus cognitifs débordent le crâne | Clark & Chalmers 1998; Kirchhoff & Kiverstein 2019 |
| enact | Énactivisme | concept | Enaction d'un monde signifiant | Varela, Thompson & Rosch 1991; Gallagher 2017 |
| enact_auto | Énactivisme autopoïétique | concept | Cognition enracinée dans l'autopoïèse | Thompson 2007; Di Paolo et al. 2017; Maturana & Varela 1980 |
| enact_sm | Énactivisme sensorimoteur | concept | Percevoir = explorer activement | O'Regan & Noë 2001; Noë 2004 |
| enact_rad | Énactivisme radical | concept | Cognition sans contenu représentationnel | Hutto & Myin 2013 |
| pp | Traitement prédictif | concept | Cerveau bayésien hiérarchique | Clark 2013, 2016; Hohwy 2013; Friston 2010 |
| eco_psy | Psychologie écologique | concept | Perception directe, affordances | Gibson 1979 |
| a_clark | Clark | author | Esprit étendu, predictive processing | Clark & Chalmers 1998; Clark 2013, 2016 |
| a_varela | Varela | author | Enactivisme, autopoïèse | Varela, Thompson & Rosch 1991; Maturana & Varela 1980 |
| a_gallagher | Gallagher | author | Synthèse enactiviste, cognition sociale | Gallagher 2017, 2024 |
| a_friston | Friston | author | Énergie libre, inférence active | Friston 2010 |

### 4.3 Expériences (13 concepts + 6 auteurs)

| ID | Label | Type | Description | Références clés |
|----|-------|------|-------------|-----------------|
| hp | Problème difficile | concept | Pourquoi y a-t-il expérience subjective ? | Chalmers 1995, 1996 |
| gap | Fossé explicatif | concept | Déficit entre physique et phénoménal | Levine 1983 |
| qualia | Qualia | concept | Propriétés qualitatives privées de l'expérience | Nagel 1974; Jackson 1982; Block 1978 |
| zombie | Zombies philosophiques | concept | Monde identique mais sans conscience | Chalmers 1996; Kripke 1972 |
| mary | Argument de Mary | concept | Apprendre en voyant le rouge | Jackson 1982 |
| bat | Argument de la chauve-souris | concept | Subjectivité irréductible | Nagel 1974 |
| hetpheno | Hétérophénoménologie | concept | Étude en 3e personne des rapports subjectifs | Dennett 1991, 2005 |
| md | Ébauches multiples | concept | Révisions narratives sans théâtre cartésien | Dennett 1991 |
| myst | Mystérianisme | concept | Clôture cognitive constitutive | McGinn 1989 |
| iit | Information intégrée (IIT) | concept | Conscience = Φ | Tononi 2004; Tononi & Koch 2015; Mørch 2018 |
| pcs | Concepts phénoménaux | concept | Sauver le physicalisme via la structure conceptuelle | Loar 1997; Papineau 2002; Chalmers 2007 |
| gwt | Espace de travail global | concept | Conscience = diffusion dans un workspace neuronal | Baars 1988; Dehaene & Naccache 2001 |
| hot | Théories d'ordre supérieur | concept | Conscience = représentation d'une représentation | Rosenthal 2005; Lau & Rosenthal 2011 |
| a_chalmers | Chalmers | author | Problème difficile, naturalisme dualiste | Chalmers 1995, 1996, 2007, 2015 |
| a_dennett | Dennett | author | Ébauches multiples, Quining Qualia | Dennett 1988, 1991, 2005 |
| a_nagel | Nagel | author | Subjectivité irréductible, Mind and Cosmos | Nagel 1974, 2012 |
| a_tononi | Tononi | author | IIT, mesure Φ | Tononi 2004; Tononi & Koch 2015 |
| a_jackson | Jackson | author | Argument de la connaissance (puis rétraction) | Jackson 1982, 1998 |
| a_levine | Levine | author | Fossé explicatif, Purple Haze | Levine 1983, 2001 |

### 4.4 Sémantiques (8 concepts + 3 auteurs)

| ID | Label | Type | Description | Références clés |
|----|-------|------|-------------|-----------------|
| lot | Langage de la pensée | concept | Mentalais à syntaxe combinatoire | Fodor 1975, 1987 |
| extern | Externalisme | concept | Le contenu dépend de l'environnement | Putnam 1975; Burge 1979 |
| intern | Internalisme | concept | Contenu étroit, indépendant du contexte | Fodor 1987 |
| teleo | Téléosémantique | concept | Fonctions biologiques et normativité | Millikan 1984; Papineau 1993 |
| anti_rep | Anti-représentationnalisme | concept | Cognition sans contenu | Hutto & Myin 2013; Chemero 2009 |
| norm | Normativité du contenu | concept | D'où vient la règle ? | Kripke 1982; Wittgenstein 1953 |
| represent | Représentationnalisme | concept | Expérience = contenu représentationnel | Dretske 1995; Tye 1995 |
| disjoncti | Disjonctivisme | concept | Perception et hallucination de nature différente | Martin 2004; Brewer 2011 |
| a_fodor | Fodor | author | LOT, modularité, contenu étroit | Fodor 1975, 1983, 1987, 1990 |
| a_millikan | Millikan | author | Téléosémantique, fonctions propres | Millikan 1984 |
| a_burge | Burge | author | Externalisme social | Burge 1979, 1986 |

### 4.5 Performations (8 concepts + 2 auteurs)

| ID | Label | Type | Description | Références clés |
|----|-------|------|-------------|-----------------|
| excl | Exclusion causale | concept | Si clôture physique, le mental est inerte | Kim 1998, 2005 |
| interv | Interventionnisme | concept | Causalité contrefactuelle multi-niveaux | Woodward 2003; List & Menzies 2009 |
| epiph | Épiphénoménalisme | concept | Le mental sans pouvoir causal | Jackson 1982; Huxley 1874 |
| caus_desc | Causalité descendante | concept | Le tout agit sur les parties | O'Connor & Wong 2005; Sperry 1969 |
| chambre | Chambre chinoise | concept | Syntaxe sans sémantique | Searle 1980 |
| neuroex | Neuro-existentialisme | concept | Signification dans un cerveau matériel | Flanagan & Caruso 2018 |
| libre_arb | Libre arbitre et déterminisme | concept | Compatibilisme, illusion du contrôle | Dennett 1984, 2003; Libet 1983 |
| agentivite | Agentivité | concept | Sens de l'agir, phénoménologie de l'action | Gallagher 2000; Pacherie 2008 |
| a_searle | Searle | author | Chambre chinoise, naturalisme biologique | Searle 1980, 1992 |
| a_kim2 | Kim | author | Exclusion causale, réductionnisme fonctionnel | Kim 1998, 2005 |

---

## 5. Inventaire complet des liens (v1)

### 5.1 Intra-famille

**Matérialités** :
- behaviorisme → phys_red (filiation)
- phys_red → fonc (filiation)
- fonc → phys_nr (filiation)
- mon_an → phys_nr (filiation)
- panpsy ↔ mon_ru (filiation)
- dual_p → panpsy (reformulation)
- emerg → phys_nr (filiation)
- eliminat → phys_red (filiation)

**Architectures** :
- comp → conn (filiation)
- embod → embed (filiation)
- embed → ext (filiation)
- enact → enact_auto (filiation)
- enact → enact_sm (filiation)
- enact → enact_rad (filiation)
- embod → enact (filiation)
- pp ↔ enact_auto (reformulation)
- comp → pp (reformulation)
- eco_psy → embed (filiation)
- eco_psy → enact_sm (filiation)

**Expériences** :
- gap → hp (filiation)
- hp → qualia (filiation)
- hp → zombie (filiation)
- hp → mary (filiation)
- hp → bat (filiation)
- md → hetpheno (filiation)
- iit → panpsy (reformulation, inter-famille)
- pcs → gap (reformulation)
- gwt → hp (reformulation)
- hot → gwt (filiation)

**Sémantiques** :
- lot → intern (filiation)
- extern ↔ intern (opposition)
- teleo → norm (reformulation)
- anti_rep → enact_rad (filiation, inter-famille)
- represent ↔ disjoncti (opposition)

**Performations** :
- excl → epiph (filiation)
- interv ↔ excl (opposition)
- caus_desc → emerg (filiation, inter-famille)
- libre_arb → neuroex (filiation)
- agentivite → enact (reformulation, inter-famille)

### 5.2 Inter-familles (ponts structurants)

| Source | Cible | Type | Justification |
|--------|-------|------|---------------|
| fonc | comp | filiation | Le computationnalisme est le fonctionnalisme réalisé |
| fonc | chambre | opposition | Searle attaque le fonctionnalisme |
| fonc | qualia | opposition | Les qualia résistent au rôle fonctionnel |
| hp | dual_p | filiation | Chalmers tire le dualisme du problème difficile |
| phys_nr | excl | filiation | Kim montre la tension interne du physicalisme NR |
| comp | lot | filiation | Fodor unifie computationnalisme et LOT |
| md | fonc | filiation | Les ébauches multiples prolongent le fonctionnalisme |
| iit | mon_ru | reformulation | IIT mathématise l'intuition russellienne |
| pp | ext | reformulation | Le predictive processing reformule l'extension |
| chambre | comp | opposition | Searle vs. Strong AI |
| panpsy | hp | reformulation | Le panpsychisme comme réponse au hard problem |
| neuroex | hp | reformulation | Flanagan prolonge le hard problem vers le sens |
| extern | ext | filiation | L'externalisme sémantique préfigure l'esprit étendu |
| myst | hp | filiation | McGinn accepte le problème, nie la solution |
| hetpheno | qualia | opposition | Dennett nie la réalité métaphysique des qualia |
| eliminat | md | filiation | L'éliminativisme nourrit le modèle dennettien |
| gwt | fonc | reformulation | L'espace de travail reformule le fonctionnalisme |
| hot | fonc | reformulation | Idem pour les théories d'ordre supérieur |

---

## 6. Fonctionnalités (user stories)

### 6.1 MVP (v1.0)

- [ ] **Graphe force-directed D3** : nœuds positionnés par proximité théorique, liens typés
- [ ] **Survol** : tooltip avec label, famille, description, références bibliographiques
- [ ] **Clic sur un nœud** : isole le réseau de connexions directes, affiche un panneau détail
- [ ] **Filtre par famille** : clic sur la légende pour isoler une famille
- [ ] **Toggle auteurs** : afficher/masquer les nœuds auteur
- [ ] **Légende interactive** : familles (couleurs) + types de liens (traits)
- [ ] **Dark mode** : suit `prefers-color-scheme` + toggle manuel
- [ ] **Responsive** : lisible sur desktop (1200px+) et tablette (768px+)
- [ ] **Panneau latéral** : au clic, affiche fiche concept avec description + bibliographie complète

### 6.2 v1.1 — Enrichissements

- [ ] **Recherche texte** : champ de recherche filtrant les nœuds par nom ou description
- [ ] **Zoom sémantique** : au zoom, les labels secondaires apparaissent progressivement
- [ ] **Chronologie** : slider temporel filtrant les concepts par décennie d'apparition
- [ ] **Liens vers SEP** : chaque concept renvoie vers l'entrée correspondante de la Stanford Encyclopedia of Philosophy
- [ ] **Mode « parcours »** : parcours guidés thématiques (ex. « du behaviorisme au problème difficile »)
- [ ] **Export SVG/PNG** : bouton d'export de l'état courant du graphe

### 6.3 v2.0 — Extensions possibles

- [ ] **Données éditables** : interface d'ajout/modification de nœuds et liens (mode admin)
- [ ] **Citations complètes** : format BibTeX/APA dans les fiches
- [ ] **Couverture multilingue** : labels en FR et EN avec bascule
- [ ] **Collaboration** : annotations partagées (commentaires sur les nœuds)

---

## 7. Spécifications techniques du graphe

### 7.1 Layout D3

```javascript
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links)
    .id(d => d.id)
    .distance(d => d.type === 'author' ? 30 : 55)
    .strength(d => d.type === 'author' ? 0.6 : 0.25))
  .force("charge", d3.forceManyBody()
    .strength(d => d.type === 'author' ? -40 : -100))
  .force("x", d3.forceX(d => familyCenters[d.family].x).strength(0.1))
  .force("y", d3.forceY(d => familyCenters[d.family].y).strength(0.1))
  .force("collide", d3.forceCollide(d => d.weight + 8));
```

### 7.2 Rendu visuel

| Élément | Spécification |
|---------|--------------|
| Nœud concept | Cercle plein, rayon proportionnel au `weight`, fill = famille.lightFill, stroke = famille.color |
| Nœud auteur | Cercle stroke-dasharray, rayon fixe 4-5px, fill transparent |
| Lien filiation | Ligne pleine grise, 0.7px, opacité 0.15 |
| Lien opposition | Ligne pointillée rouge (#A32D2D), 1px, dash 4-3 |
| Lien reformulation | Ligne tiretée bleue (#185FA5), 0.7px, dash 8-4 |
| Label concept | 10-11px, police sans-serif, centré sous le nœud |
| Label auteur | 9.5px, italique, couleur secondaire |
| Label famille | 13px, medium weight, couleur secondaire, opacité 0.4, suit le barycentre des nœuds |

### 7.3 Interactions

| Action | Effet |
|--------|-------|
| Survol nœud | Tooltip avec description + refs |
| Clic nœud | Isolement du réseau de connexions directes, panneau détail |
| Clic famille (légende) | Filtre : seuls les nœuds de cette famille restent visibles |
| Double-clic espace vide | Reset de tous les filtres |
| Toggle auteurs | Affiche/masque les nœuds de type `author` et leurs liens |
| Drag nœud | Repositionnement manuel (optionnel, D3 drag behavior) |

---

## 8. Arborescence projet suggérée

```
philosophy-of-mind-map/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── app.js              # Point d'entrée, initialisation
│   ├── graph.js             # Layout D3, rendu SVG, simulation
│   ├── interactions.js      # Clic, survol, filtre, recherche
│   └── panel.js             # Panneau latéral détail
├── data/
│   └── graph-data.json      # Toutes les données du graphe
├── assets/
│   └── favicon.svg
└── README.md
```

---

## 9. Références bibliographiques complètes

### Ouvrages et anthologies

- Alter, T. & Nagasawa, Y. (dir.) (2015). *Consciousness in the Physical World: Essays on Russellian Monism*. Oxford University Press.
- Block, N., Flanagan, O. & Güzeldere, G. (dir.) (1997). *The Nature of Consciousness*. MIT Press.
- Brüntrup, G. & Jaskolla, L. (dir.) (2016). *Panpsychism: Contemporary Perspectives*. Oxford University Press.
- Chalmers, D.J. (dir.) (2002). *Philosophy of Mind: Classical and Contemporary Readings*. Oxford University Press.
- Kind, A. (dir.) (2019). *Philosophy of Mind in the Twentieth and Twenty-First Centuries*. Routledge.
- McLaughlin, B.P. & Cohen, J. (dir.) (2e éd., à paraître). *Contemporary Debates in Philosophy of Mind*. Wiley-Blackwell.
- Newen, A., De Bruin, L. & Gallagher, S. (dir.) (2018). *The Oxford Handbook of 4E Cognition*. Oxford University Press.

### Matérialités

- Broad, C.D. (1925). *The Mind and Its Place in Nature*. Routledge & Kegan Paul.
- Churchland, P.M. (1981). "Eliminative Materialism and the Propositional Attitudes". *Journal of Philosophy*, 78(2), 67-90.
- Churchland, P.S. (1986). *Neurophilosophy*. MIT Press.
- Davidson, D. (1970). "Mental Events". In *Experience and Theory*. Clarendon Press.
- Kim, J. (1993). *Supervenience and Mind*. Cambridge University Press.
- Kim, J. (1998). *Mind in a Physical World*. MIT Press.
- Kim, J. (2005). *Physicalism, or Something Near Enough*. Princeton University Press.
- Lewis, D. (1972). "Psychophysical and Theoretical Identifications". *Australasian Journal of Philosophy*, 50(3).
- O'Connor, T. & Wong, H.Y. (2005). "The Metaphysics of Emergence". *Noûs*, 39(4), 658-678.
- Place, U.T. (1956). "Is Consciousness a Brain Process?". *British Journal of Psychology*, 47(1).
- Putnam, H. (1967). "Psychological Predicates". In *Art, Mind, and Religion*.
- Ryle, G. (1949). *The Concept of Mind*. Hutchinson.
- Smart, J.J.C. (1959). "Sensations and Brain Processes". *Philosophical Review*, 68(2).
- Strawson, G. (2006). "Realistic Monism". *Journal of Consciousness Studies*, 13(10-11).

### Architectures

- Clark, A. (2013). "Whatever Next?". *Behavioral and Brain Sciences*, 36(3).
- Clark, A. (2016). *Surfing Uncertainty*. Oxford University Press.
- Clark, A. & Chalmers, D. (1998). "The Extended Mind". *Analysis*, 58(1), 7-19.
- Di Paolo, E., Buhrmann, T. & Barandiaran, X. (2017). *Sensorimotor Life*. Oxford University Press.
- Fodor, J. (1975). *The Language of Thought*. Harvard University Press.
- Friston, K. (2010). "The Free-Energy Principle". *Nature Reviews Neuroscience*, 11(2).
- Gallagher, S. (2017). *Enactivist Interventions*. Oxford University Press.
- Gallagher, S. (2024). *Embodied and Enactive Approaches to Cognition*. Cambridge Elements.
- Gibson, J.J. (1979). *The Ecological Approach to Visual Perception*. Houghton Mifflin.
- Hohwy, J. (2013). *The Predictive Mind*. Oxford University Press.
- Hutto, D. & Myin, E. (2013). *Radicalizing Enactivism*. MIT Press.
- Kirchhoff, M. & Kiverstein, J. (2019). *Extended Consciousness and Predictive Processing*. Routledge.
- Lakoff, G. & Johnson, M. (1999). *Philosophy in the Flesh*. Basic Books.
- Marr, D. (1982). *Vision*. W.H. Freeman.
- Maturana, H. & Varela, F. (1980). *Autopoiesis and Cognition*. D. Reidel.
- Noë, A. (2004). *Action in Perception*. MIT Press.
- O'Regan, K. & Noë, A. (2001). "A Sensorimotor Account of Vision". *BBS*, 24(5).
- Pylyshyn, Z. (1984). *Computation and Cognition*. MIT Press.
- Rumelhart, D.E. & McClelland, J.L. (1986). *Parallel Distributed Processing*. MIT Press.
- Shapiro, L. (2011). *Embodied Cognition*. Routledge.
- Thompson, E. (2007). *Mind in Life*. Harvard University Press.
- Varela, F., Thompson, E. & Rosch, E. (1991). *The Embodied Mind*. MIT Press.

### Expériences

- Baars, B.J. (1988). *A Cognitive Theory of Consciousness*. Cambridge University Press.
- Chalmers, D.J. (1995). "Facing Up to the Problem of Consciousness". *JCS*, 2(3), 200-219.
- Chalmers, D.J. (1996). *The Conscious Mind*. Oxford University Press.
- Chalmers, D.J. (2007). "Phenomenal Concepts and the Explanatory Gap". In *Phenomenal Knowledge and Phenomenal Concepts*.
- Chalmers, D.J. (2015). "Panpsychism and Panprotopsychism". In *Consciousness in the Physical World*.
- Dehaene, S. & Naccache, L. (2001). "Towards a Cognitive Neuroscience of Consciousness". *Cognition*, 79(1-2).
- Dennett, D.C. (1988). "Quining Qualia". In *Consciousness in Contemporary Science*. Oxford University Press.
- Dennett, D.C. (1991). *Consciousness Explained*. Little, Brown.
- Dennett, D.C. (2005). *Sweet Dreams*. MIT Press.
- Goff, P. (2017). *Consciousness and Fundamental Reality*. Oxford University Press.
- Goff, P. (2019). *Galileo's Error*. Pantheon.
- Jackson, F. (1982). "Epiphenomenal Qualia". *Philosophical Quarterly*, 32.
- Lau, H. & Rosenthal, D. (2011). "Empirical Support for Higher-Order Theories". *Trends in Cognitive Sciences*, 15(8).
- Levine, J. (1983). "Materialism and Qualia: The Explanatory Gap". *Pacific Philosophical Quarterly*, 64.
- Levine, J. (2001). *Purple Haze*. MIT Press.
- Loar, B. (1997). "Phenomenal States". In *The Nature of Consciousness*. MIT Press.
- McGinn, C. (1989). "Can We Solve the Mind-Body Problem?". *Mind*, 98(391).
- Mørch, H.H. (2018). "Is IIT Compatible with Russellian Panpsychism?". *Erkenntnis*, 84(5).
- Nagel, T. (1974). "What Is It Like to Be a Bat?". *Philosophical Review*, 83(4).
- Nagel, T. (2012). *Mind and Cosmos*. Oxford University Press.
- Papineau, D. (2002). *Thinking about Consciousness*. Oxford University Press.
- Rosenthal, D. (2005). *Consciousness and Mind*. Oxford University Press.
- Tononi, G. (2004). "An Information Integration Theory of Consciousness". *BMC Neuroscience*, 5, 42.
- Tononi, G. & Koch, C. (2015). "Consciousness: Here, There and Everywhere?". *Phil. Trans. R. Soc. B*, 370(1668).

### Sémantiques

- Brewer, B. (2011). *Perception and Its Objects*. Oxford University Press.
- Burge, T. (1979). "Individualism and the Mental". *Midwest Studies in Philosophy*, 4(1).
- Chemero, A. (2009). *Radical Embodied Cognitive Science*. MIT Press.
- Dretske, F. (1981). *Knowledge and the Flow of Information*. MIT Press.
- Dretske, F. (1995). *Naturalizing the Mind*. MIT Press.
- Fodor, J. (1983). *The Modularity of Mind*. MIT Press.
- Fodor, J. (1987). *Psychosemantics*. MIT Press.
- Fodor, J. (1990). *A Theory of Content and Other Essays*. MIT Press.
- Kripke, S. (1982). *Wittgenstein on Rules and Private Language*. Harvard University Press.
- Martin, M.G.F. (2004). "The Limits of Self-Awareness". *Philosophical Studies*, 120(1-3).
- Millikan, R.G. (1984). *Language, Thought, and Other Biological Categories*. MIT Press.
- Papineau, D. (1993). *Philosophical Naturalism*. Blackwell.
- Putnam, H. (1975). "The Meaning of 'Meaning'". *Minnesota Studies in the Philosophy of Science*, 7.
- Tye, M. (1995). *Ten Problems of Consciousness*. MIT Press.
- Wittgenstein, L. (1953). *Philosophical Investigations*. Blackwell.

### Performations

- Dennett, D.C. (1984). *Elbow Room*. MIT Press.
- Dennett, D.C. (2003). *Freedom Evolves*. Viking.
- Flanagan, O. & Caruso, G. (dir.) (2018). *Neuroexistentialism*. Oxford University Press.
- Gallagher, S. (2000). "Philosophical Conceptions of the Self". *Trends in Cognitive Sciences*, 4(1).
- Libet, B. (1983). "Time of Conscious Intention to Act". *Brain*, 106(3).
- List, C. & Menzies, P. (2009). "Nonreductive Physicalism and the Limits of the Exclusion Principle". *Journal of Philosophy*, 106(9).
- Pacherie, E. (2008). "The Phenomenology of Action". *Cognition*, 107(1).
- Searle, J. (1980). "Minds, Brains, and Programs". *BBS*, 3(3).
- Searle, J. (1992). *The Rediscovery of the Mind*. MIT Press.
- Sperry, R.W. (1969). "A Modified Concept of Consciousness". *Psychological Review*, 76(6).
- Wegner, D. (2002). *The Illusion of Conscious Will*. MIT Press.
- Woodward, J. (2003). *Making Things Happen*. Oxford University Press.

---

## 10. Notes de design

### Typographie
- Titres : Inter ou système sans-serif, 500
- Corps : 14-16px, 400, line-height 1.6
- Références : 12-13px, italique pour les titres d'ouvrages
- Palette : les 5 couleurs famille + gris neutre + rouge opposition + bleu reformulation

### Responsive
- Desktop (1200px+) : graphe pleine largeur + panneau latéral
- Tablette (768-1199px) : graphe pleine largeur, panneau en drawer bas
- Mobile (< 768px) : graphe simplifié (concepts uniquement, pas d'auteurs), panneau modal

### Accessibilité
- Contrastes WCAG AA sur tous les labels
- Patterns de traits (plein/pointillé/tireté) en plus des couleurs pour les types de liens
- Focus visible sur les nœuds navigables au clavier
- `aria-label` sur les éléments interactifs

---

*Document de spécification — v1.0 — Mars 2026*
*Cartographie conçue par David Lechermeier avec l'assistance de Claude (Anthropic)*
