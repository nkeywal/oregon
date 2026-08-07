# Oregon Vibe

Jeu de survie et de gestion inspiré du voyage historique vers l’Oregon. L’application est entièrement statique : aucun serveur applicatif, compte ou service distant n’est nécessaire.

L’interface est disponible en français et en anglais. Le sélecteur FR/EN adapte immédiatement les écrans, les événements et le journal de bord.

## Jouer en ligne

Le jeu est publié sur GitHub Pages : **https://nkeywal.github.io/oregon/**

Chaque modification de la branche principale fait l’objet d’un contrôle automatique (syntaxe JavaScript, fichiers statiques et illustrations requises).

## Lancer le jeu

Depuis ce dossier :

```bash
python3 -m http.server 8000
```

Ouvrez ensuite `http://localhost:8000`. Le dossier peut aussi être déployé tel quel sur n’importe quel hébergement statique.

## Commandes

- Choisissez le groupe, le métier, le mois de départ et les provisions.
- Consultez le « Guide du pionnier » avant les achats ou depuis la piste.
- Ajustez le rythme et les rations avant chaque tranche de cinq jours : une allure épuisante consomme davantage et augmente fortement les incidents.
- À la chasse, utilisez la souris ou les flèches pour viser, puis le clic ou `Espace` pour tirer.
- Pour tester l’attaque du convoi, appuyez sur `&` pendant le voyage.

Une partie se joue d’une traite : le jeu n’enregistre aucune progression dans le navigateur.

Les illustrations du jeu se trouvent dans `assets/`. Chaque étape possède ses paysages doux, froids, chauds et pluvieux, dans une direction artistique commune inspirée des affiches WPA et de la gouache sérigraphiée des années 1930.

Les fichiers servis sont compressés en WebP pour conserver leur qualité tout en limitant le téléchargement sur mobile.
