# Renfo Trail

Webapp iPhone (PWA, hors ligne) qui propose des séances de renforcement musculaire pour la course à pied et le trail.

- Choix du type de séance (complète, force maximale, pliométrie, spécial trail, prévention blessures, gainage), de la durée (15 à 60 min), du matériel (poids, machines, élastique) et du niveau.
- Chaque exercice a une animation 3D (mannequin Three.js, `rig3d.js`), des consignes, les erreurs fréquentes, le dosage et les études qui le justifient.
- Bloc Rééducation : 9 zones (tendon d'Achille, rotulien, TFL, fémoro-patellaire, aponévrose plantaire, périostite, ischios, moyen fessier, cheville) avec protocoles, dosages et règles de charge sourcés (`REHAB` dans `exercises.js`).
- Lecteur de séance avec chronos de travail et de repos, bip de fin de repos, écran maintenu allumé.
- Historique local (objectif 2 séances/semaine).

Publié sur GitHub Pages : https://dam-gth.github.io/renfo-trail/ (dépôt `dam-gth/renfo-trail`, ce dossier est la racine du dépôt).

## Fichiers

- `index.html`, `style.css` : coquille et styles (thème clair/sombre automatique, safe areas iPhone).
- `rig3d.js` + `vendor/three.module.min.js` : mannequin 3D (capsules, ombres, orbite au doigt). Une pose = angles en degrés (voir l'en-tête du fichier) ; la figure est posée automatiquement sur le sol. `rig.js` garde l'interpolation des poses et une version SVG 2D (page `_debug.html`).
- `exercises.js` : catalogue des exercices (`EXERCISES`) et références (`REFS`).
- `app.js` : générateur de séance (`SLOTS` = blocs par type de séance, `EXTRA` = blocs de complément, `REHAB` pour la rééducation), vues, lecteur.
- `sw.js`, `manifest.webmanifest`, icônes : installation sur l'écran d'accueil et cache hors ligne.
- `_debug.html` : grille de toutes les animations (`?w=240&only=id1,id2`), non publiée.

## Tester en local

```bash
python3 -m http.server 8765
```

Puis http://localhost:8765/ en mode responsive iPhone. Le service worker met les fichiers en cache : après une modification, désinscrire le SW dans les outils de développement ou recharger deux fois.

## Publier

```bash
sh deploy.sh "message de commit"
```

Renouvelle le nom du cache dans `sw.js`, commit tout et push sur `main`. GitHub Pages se met à jour en une à deux minutes.
