# Historique et évolution des demandes

## Objectif de l’expérience

Tester ce que produit une IA de développement logiciel lorsqu’on lui demande de coder un jeu complet. Pour ce projet, l’IA utilisée était Codex avec le modèle SOL 5.6 et un niveau de raisonnement « medium ».

## Quantification du périmètre

La demande initiale contenait cinq grandes exigences :

1. Refaire Oregon Trail en HTML.
2. Fonctionnement entièrement côté client.
3. Reprendre le gameplay classique.
4. Produire de meilleures illustrations avec une direction artistique homogène.
5. Utiliser plusieurs agents pour le code et les images.

Ensuite, il y a eu 29 messages substantiels de spécification, en excluant les simples messages opérationnels comme « j’ai fait ssh-add », « GitHub Pages est configuré » ou « continue ».

Avec un découpage où chaque comportement vérifiable compte comme une demande, on obtient environ 77 exigences supplémentaires :

| Domaine ajouté après la demande initiale | Nombre approximatif |
|---|---:|
| Images, interface et mobile | 17 |
| Gameplay, économie et équilibrage | 25 |
| Incidents, maladies et santé | 14 |
| Terminologie, textes et traduction | 11 |
| Aide, publication et préproduction | 10 |
| **Total** | **≈ 77** |

Ainsi, environ 94 % des exigences détaillées ont été formulées après la demande initiale. Le projet final est sensiblement plus large qu’un simple Oregon Trail classique illustré.

## Illustrations et interface

Les demandes successives ont ajouté :

- Une illustration différente pour chaque étape.
- Quatre variantes climatiques par étape : doux, chaud, froid et pluie.
- Des paysages propres à Chimney Rock, Fort Laramie, Independence Rock, South Pass, Fort Boise, The Dalles, etc.
- Des images particulières pour chaque incident.
- Des images de chasse adaptées au climat.
- La même illustration pendant la chasse et dans son bilan.
- Des images propres à chaque fleuve, méthode de traversée et résultat.
- La suppression des effets artificiels de pluie et de neige.
- Une mise en valeur plus importante des illustrations, particulièrement sur mobile.
- La correction des titres partiellement masqués sur l’écran de préparation.
- L’ordre mobile suivant : titre, progression, image, journal, chariot, groupe, commandes.
- Le retour automatique en haut de l’écran après un bilan.
- Deux boutons distincts pour la carte et l’inventaire.
- Une carte indiquant toutes les étapes et la position actuelle.

## Chasse

La chasse a progressivement reçu :

- Un écran de bilan intermédiaire illustré.
- Le nombre de balles tirées et restantes.
- La quantité de viande chargée.
- Des lapins et des oiseaux.
- Une difficulté accrue.
- Moins de bisons sous la pluie.
- Moins de gibier dans la neige.
- Une limite de 90 kg par chasse.
- Le respect de la capacité maximale du chariot.
- Le fonctionnement tactile sur mobile.
- La suppression de la notification superposée « Touché ».

## Lieux, forts et commerce

Il a été demandé :

- De pouvoir réaliser plusieurs actions lors d’une même halte.
- De ne plus repartir automatiquement après un achat ou un repos.
- D’acheter plusieurs fois des vivres ou des balles.
- De pouvoir acheter aléatoirement des bœufs et de l’équipement dans les forts.
- D’ajouter des rencontres commerciales.
- Que l’objet, le prix et la quantité d’une rencontre soient imposés.
- De limiter le choix du joueur à accepter ou refuser.
- De rendre clairement indisponibles les achats impossibles ou dépassant la capacité.

## Incidents ajoutés

La demande initiale ne détaillait pas les incidents. Les ajouts ultérieurs comprennent :

- Fièvre.
- Dysenterie.
- Blessure.
- Maladie contagieuse.
- Engelures par temps froid.
- Piqûres infectées par temps chaud.
- Perte ou consommation de couvertures.
- Vol.
- Bœuf blessé.
- Chute du chariot.
- Essieu brisé.
- Pluies diluviennes.
- Rencontre commerciale.
- Attaque des Indiens.
- Une fenêtre spéciale lorsqu’aucun incident ne survient.

Chaque incident devait aussi être inscrit dans le journal et disposer de son illustration propre.

## Point sensible : « autochtones » devenu « Indiens »

Le changement exact demandé a été :

> « Des cavaliers autochtones » → « Les indiens »

Ce vocabulaire ne vient donc pas de la demande initiale : il a été imposé explicitement plus tard.

C’est un choix éditorial sensible, car « les Indiens » généralise des peuples distincts et les présente ici dans un rôle antagoniste. Il faudrait conserver la trace de cette décision si le jeu est présenté publiquement ou évalué sous l’angle historique.

## Point sensible : l’attaque est défensive

La demande ultérieure précisait qu’une attaque des Indiens devait devenir un mini-jeu différent de la chasse, avec des voyageurs blessés ou morts et un écran de bilan.

Le caractère strictement défensif n’était pas formulé mot pour mot. Il a été choisi lors de la conception :

- Le joueur ne tire pas.
- Il déplace le chariot.
- Il évite les projectiles.
- Il protège le groupe jusqu’à la fin de l’attaque.
- Les conséquences sont des blessures ou des décès.

C’est donc une décision d’implémentation importante. Elle évite de transformer les personnages autochtones en cibles de chasse, même si l’événement conserve la représentation sensible des « Indiens » comme agresseurs.

Le raccourci `&` permettant de déclencher cette attaque pour les tests a également été demandé explicitement et reste volontairement accessible.

## Santé, maladies et décès

Les demandes ont imposé plusieurs règles éditoriales :

- Ne jamais parler de « points de santé ».
- Ne jamais afficher de pourcentage de santé.
- Employer des états qualitatifs : bonne santé, fatigué, très faible, etc.
- Ne pas afficher « En forme » si l’état général ou individuel est mauvais.
- Faire progresser les maladies pendant les voyages, réparations, attentes et chasses.
- Afficher « Aucun remède nécessaire » lorsqu’il n’y a aucun blessé.
- Afficher « Aucun remède disponible » lorsqu’un traitement est requis mais impossible.
- Ne pas proposer visuellement une action médicale comme disponible sans remède.
- Éviter de tuer plusieurs membres du groupe au même instant.

Ce dernier point ne rend pas la partie gagnable automatiquement : tout le groupe peut mourir progressivement au cours du voyage.

## Temps, météo et événements

La logique initiale a été largement étendue :

- Les événements sont désormais tirés quotidiennement.
- Une commande « Voyager 5 jours » simule cinq journées distinctes.
- Si un événement survient le deuxième jour, seuls deux jours sont consommés.
- Une fois l’événement réglé, la partie reprend à partir de cette date et de cette position.
- La consommation dépend du nombre de survivants.
- La météo influence la distance parcourue.
- Les probabilités d’incident dépendent du rythme et du climat.
- L’allure épuisante augmente réellement consommation, fatigue, avaries et incidents.
- Le mois d’août ne produit plus de froid incohérent.
- La météo suit une distribution saisonnière.

## Fleuves

Les franchissements ont reçu un système complet :

- Profondeur aléatoire.
- Variation après une attente.
- Influence de la saison.
- Influence de la pluie, de la chaleur et de la fonte des neiges.
- Choix entre bac, attente et traversée à flot.
- Risque de perte de vivres, munitions, couvertures, pièces et remèdes.
- Risque de perte de bœufs.
- Bilan illustré après chaque traversée.
- Illustration différente selon le fleuve, la méthode et le résultat.

## Ressources et causes d’échec

La page d’aide et la logique ont été étendues pour que chaque ressource ait une utilité et puisse devenir une cause d’échec :

- Les vivres sont consommés par chaque personne et chaque jour écoulé.
- Les balles conditionnent la chasse.
- Les couvertures protègent du froid.
- Les pièces évitent les réparations longues et coûteuses.
- Les remèdes traitent voyageurs et bœufs.
- L’argent sert aux forts, bacs et rencontres.
- Les bœufs influencent la vitesse et peuvent être blessés, volés ou perdus dans un fleuve.
- Un bœuf abattu peut devenir de la nourriture.
- Sans dernier bœuf, le voyage s’arrête.
- La capacité du chariot limite tous les gains.
- Aucun message ne doit annoncer une perte de « 0 kg ».

## Journal et bilan

Il a été demandé :

- D’inscrire tous les incidents au journal.
- D’afficher les entrées les plus récentes en premier.
- D’ajouter le journal complet à l’écran final.
- D’afficher un bilan pour une étape calme.
- D’afficher la distance parcourue et les vivres consommés.
- D’ajouter des bilans séparés pour la chasse, les attaques et les fleuves.

## Score final

Le score a été remplacé par une logique inspirée de Civilization I, avec vingt rangs allant de :

- « Disparu sans laisser de trace »
- jusqu’à « Père ou Mère de l’Oregon ».

Une défaite ne peut plus obtenir un rang réservé à une arrivée réussie, même si le joueur conservait beaucoup d’argent ou de provisions.

## Langue et terminologie

Les demandes ultérieures comprennent également :

- « Compagnon·ne » → « Compagnon ».
- « Voyageur·se » → « Voyageur ».
- Gestion correcte des pluriels, y compris le singulier après zéro.
- Suppression du texte explicatif associé au rythme.
- Renommage du jeu en « Oregon Vibe » en français et en anglais.
- Interface complète en français et en anglais.
- Traduction dynamique des événements, journaux, cartes, bilans et scores.

## Aide, sauvegarde et publication

Enfin, le périmètre a ajouté :

- La suppression complète de la sauvegarde de partie.
- Une page immersive « Pionnier, ce que tu sais avant le départ ».
- Une aide expliquant les ressources sans révéler les valeurs internes.
- La publication du dépôt sur GitHub.
- Le déploiement GitHub Pages.
- Une revue globale d’équilibrage.
- Une revue de cohérence des actions indisponibles.
- Une passe complète de préproduction.
- La compression des images.
- Un favicon et une image de partage social.
- Les métadonnées sociales et d’indexation.
- Un sitemap et un `robots.txt`.
- Un contrôle GitHub automatique du code et des ressources.

## Conclusion

La demande initiale définissait la plateforme, le genre du jeu et son identité visuelle. Les demandes suivantes ont déterminé presque toute la conception détaillée : règles de survie, interface mobile, vocabulaire historique, incidents, mini-jeux, météo, économie, bilans, traduction, publication et décisions éditoriales sensibles.
