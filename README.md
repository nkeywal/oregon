# La Piste de l’Oregon

Jeu de survie et de gestion inspiré du voyage historique vers l’Oregon. L’application est entièrement statique : aucun serveur applicatif, compte ou service distant n’est nécessaire.

## Jouer en ligne

Le jeu est publié sur GitHub Pages : **https://nkeywal.github.io/oregon/**

## Lancer le jeu

Depuis ce dossier :

```bash
python3 -m http.server 8000
```

Ouvrez ensuite `http://localhost:8000`. Le dossier peut aussi être déployé tel quel sur n’importe quel hébergement statique.

## Commandes

- Choisissez le groupe, le métier, le mois de départ et les provisions.
- Ajustez le rythme et les rations avant chaque tranche de cinq jours.
- À la chasse, utilisez la souris ou les flèches pour viser, puis le clic ou `Espace` pour tirer.
- Pour tester l’attaque du convoi, appuyez sur `&` pendant le voyage.
- La progression est sauvegardée localement dans le navigateur après chaque étape.

Les illustrations originales se trouvent dans `assets/`. Elles suivent une direction artistique commune inspirée des affiches WPA et de la gouache sérigraphiée des années 1930.
