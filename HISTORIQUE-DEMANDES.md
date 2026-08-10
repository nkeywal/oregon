# Historique et évolution des demandes

## Objectif de l’expérience

Tester ce que produit une IA de développement logiciel lorsqu’on lui demande, à partir d’une demande très générale, de coder un jeu complet en lui laissant les choix de conception et d’implémentation, sans reprendre de code ni d’assets existants. Pour cette expérience, l’IA utilisée était Codex avec le modèle SOL 5.6 et un niveau de raisonnement « medium ».

## Quantification du périmètre

La demande initiale contenait cinq grandes exigences :

1. Refaire Oregon Trail en HTML.
2. Fonctionnement entièrement côté client.
3. Reprendre le gameplay classique.
4. Produire de meilleures illustrations avec une direction artistique homogène.
5. Utiliser plusieurs agents pour le code et les images.

Depuis, plus de 100 messages substantiels de spécification ont prolongé cette consigne, sans compter les simples messages opérationnels comme « j’ai fait ssh-add », « GitHub Pages est configuré » ou « continue ». Une première version de ce bilan avait été établie après 45 messages ; le travail de réglage, de narration et de contrôle qualité s’est ensuite poursuivi pendant plus de 55 demandes supplémentaires.

Avec un découpage où chaque comportement vérifiable explicitement demandé compte comme une demande, on obtient désormais environ 200 exigences supplémentaires :

| Domaine ajouté après la demande initiale | Nombre approximatif |
|---|---:|
| Images, interface et mobile | 35 |
| Gameplay, économie et équilibrage | 72 |
| Incidents, maladies et santé | 30 |
| Terminologie, journal et traduction | 35 |
| Aide, publication et préproduction | 20 |
| Documentation de l’expérience | 8 |
| **Total** | **≈ 200** |

Ainsi, plus de 97 % des exigences détaillées ont été formulées après la demande initiale. Le projet final est sensiblement plus large qu’un simple Oregon Trail classique illustré.

### Comment lire ce document

Les sections allant d’« Illustrations et interface » à « Documentation de l’expérience » recensent les demandes formulées par l’utilisateur. Elles décrivent ce qui a été demandé, pas nécessairement la manière dont l’IA a choisi de le réaliser.

La section « Décisions et travaux ajoutés par l’IA » isole au contraire les choix de conception, valeurs numériques, optimisations et travaux techniques décidés par l’IA pour répondre aux demandes générales. Ces éléments ne doivent pas être comptés comme des instructions détaillées de l’utilisateur.

## Illustrations et interface

Les demandes successives ont ajouté :

- Une illustration différente pour chaque étape.
- Quatre variantes climatiques par étape : doux, chaud, froid et pluie.
- Des paysages propres à Chimney Rock, Fort Laramie, Independence Rock, South Pass, Fort Boise, The Dalles, etc.
- Pour chaque fort, une vue d’approche où la destination reste lointaine, puis une image d’arrivée distincte à la porte ou dans l’enceinte.
- Plusieurs plans de rapprochement pour chaque étape : le repère est minuscule au loin, devient identifiable en chemin, puis apparaît proche à l’arrivée.
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
- Sur la carte, un aperçu des 150 km à venir : terrain, qualité de la piste, vitesse probable et gibier présent.
- Une illustration de disparition totale du convoi, distincte de l’image de victoire.
- Une série d’illustrations de décès variant selon le nombre de survivants, avec une scène particulière pour le dernier voyageur, que personne ne peut enterrer.
- Des illustrations de fleuve adaptées à la météo du jour.
- Une page de présentation du projet reprenant la direction artistique du jeu et une illustration originale consacrée au journal de l’expédition.

## Chasse

La chasse a progressivement reçu :

- Un écran de bilan intermédiaire illustré.
- Le nombre de balles tirées et restantes.
- La quantité de viande chargée.
- Des lapins et des oiseaux.
- Une difficulté accrue.
- Moins de bisons sous la pluie.
- Moins de gibier dans la neige.
- Des bisons et lapins nettement plus rares par temps froid ou neigeux, avec moins de cibles simultanées.
- Une abondance et des espèces dépendant aussi du terrain, notamment sans bison dans les régions désertiques.
- Une limite de 90 kg par chasse.
- Le respect de la capacité maximale du chariot.
- Le fonctionnement tactile sur mobile.
- La suppression de la notification superposée « Touché ».
- Une chance de mise à mort propre à chaque espèce : le petit gibier tombe plus facilement que le cerf ou le bison.
- Une raréfaction locale après plusieurs chasses au même endroit, tout en conservant quelques oiseaux et lapins.
- La consommation de la ration sélectionnée pendant la journée de chasse.
- La résolution des conséquences de la journée seulement après le chargement de la viande rapportée.

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
- D’afficher immédiatement après chaque achat l’article acquis et le nouveau stock correspondant.
- De tripler le prix des balles, au départ comme sur la piste.
- De pouvoir consulter l’inventaire sans quitter une halte dans un fort.
- Que tous les forts vendent toujours des remèdes.
- Des unités d’achat uniformes : remèdes et couvertures à l’unité, balles par vingt et bœufs à l’unité dans les forts.
- Des prix de base croissant vers l’ouest : Fort Kearny ×1,25, Fort Laramie ×1,50 et Fort Boise ×2 par rapport à Independence.
- Une hausse après les achats répétés d’une même marchandise dans un fort, à l’exception des vivres dont le tarif local reste fixe.
- Des bourses de départ finalement fixées à 600 $ pour le fermier, 900 $ pour le charpentier et 1 500 $ pour le banquier.

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
- Morsure de serpent venimeux, absente par froid ou neige et plus probable sous une forte chaleur.
- Une fenêtre spéciale lorsqu’aucun incident ne survient.

Chaque incident devait aussi être inscrit dans le journal et disposer de son illustration propre.
Lors d’une maladie contagieuse, les noms de tous les voyageurs atteints doivent être indiqués.
Les maladies doivent durer plusieurs jours : ni un remède ni deux jours de repos ne guérissent immédiatement une dysenterie.

## Point sensible : « autochtones » devenu « Indiens »

Le changement exact demandé a été :

> « Des cavaliers autochtones » → « Les indiens »

Ce vocabulaire ne vient donc pas de la demande initiale : il a été imposé explicitement plus tard.

C’est un choix éditorial sensible, car « les Indiens » généralise des peuples distincts et les présente ici dans un rôle antagoniste. Il faudrait conserver la trace de cette décision si le jeu est présenté publiquement ou évalué sous l’angle historique.

## Point sensible : l’attaque reste un jeu défensif

La demande ultérieure précisait qu’une attaque des Indiens devait devenir un mini-jeu différent de la chasse, avec des voyageurs blessés ou morts et un écran de bilan.

Le caractère défensif n’était pas formulé mot pour mot. Il a été choisi lors de la conception, puis précisé par de nouvelles demandes :

- Le joueur déplace le chariot au lieu de viser les cavaliers.
- Il évite les projectiles.
- Il protège le groupe jusqu’à la fin de l’attaque.
- Les conséquences sont des blessures ou des décès.
- Avant le mini-jeu, il peut toutefois ordonner une riposte abstraite : aucune, légère, soutenue ou maximale.
- Une riposte consomme des balles et raccourcit l’attaque ; la riposte maximale exige au moins trois survivants.
- Le choix et ses éventuelles limitations sont conservés dans le journal.

C’est donc une décision d’implémentation importante. Même avec la riposte, les personnages autochtones ne deviennent pas des cibles du mini-jeu de chasse : la séquence jouable reste centrée sur l’esquive et la protection du convoi. L’événement conserve néanmoins la représentation sensible des « Indiens » comme agresseurs.

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
- Présenter chaque décès dans une fenêtre d’événement avec une illustration spécifique.
- Rendre les maladies et blessures plus susceptibles d’emporter un voyageur déjà très affaibli.
- Faire durer la dysenterie, la fièvre, les blessures et les plaies d’attaque suffisamment longtemps pour qu’une courte halte ne les efface pas.
- Laisser les blessures cicatriser pendant chaque journée de repos, même lors de haltes successives, tandis que les maladies continuent à affaiblir le malade.
- Ne jamais annoncer une guérison avant d’avoir résolu toutes les conséquences de la journée, afin d’éviter qu’un voyageur soit déclaré guéri puis mort à la même date.

Ce dernier point ne rend pas la partie gagnable automatiquement : tout le groupe peut mourir progressivement au cours du voyage.

## Temps, météo et événements

La logique initiale a été largement étendue :

- Les événements sont désormais tirés quotidiennement.
- Une commande « Voyager 5 jours » simule cinq journées distinctes.
- Si un événement survient le deuxième jour, seuls deux jours sont consommés.
- Une fois l’événement réglé, la partie reprend à partir de cette date et de cette position.
- La consommation dépend du nombre de survivants.
- La météo influence la distance parcourue.
- Les incidents sont gérés individuellement : certains dépendent de chaque journée, d’autres de la distance parcourue.
- L’allure augmente surtout les accidents liés au déplacement ; elle ne rend pas artificiellement plus fréquents les vols, rencontres ou attaques.
- L’allure épuisante augmente réellement consommation, fatigue et avaries, tandis que l’allure prudente ménage légèrement les vivres.
- Le mois d’août ne produit plus de froid incohérent.
- La météo suit une distribution saisonnière.
- Le journal associe les kilomètres parcourus aux conditions météo rencontrées.
- La météo dépend du jour, des trois journées précédentes et de la géographie traversée.
- Les transitions brutales, notamment entre neige et forte chaleur, sont interdites.
- Les bassins désertiques ne produisent jamais de neige.
- Le relief, la pente et l’état réel de la piste modifient la vitesse et le risque d’incident.
- Les conditions de chaque portion de piste sont affichées dans le paysage et consignées dans le journal.
- La durée d’une partie préparée doit rester cohérente avec les quatre à six mois du voyage historique.
- Une nouvelle passe complète doit contrôler la logique générale, la sélection des événements et toute incohérence résiduelle.
- Les coefficients finaux de consommation liés à l’allure ont été demandés explicitement : prudente ×0,95, soutenue ×1 et épuisante ×1,10.

## Fleuves

Les franchissements ont reçu un système complet :

- Profondeur aléatoire.
- Variation après une attente.
- Influence de la saison.
- Influence de la pluie, de la chaleur et de la fonte des neiges.
- Choix entre bac, attente et traversée à flot.
- Risque de perte de vivres, munitions, couvertures, pièces et remèdes.
- Pour la traversée à flot, probabilité de perdre du matériel augmentant exponentiellement avec la hauteur de l’eau.
- Possibilité d’un véritable échec de la traversée à flot, laissant le convoi sur la rive de départ.
- Influence de la fatigue des voyageurs et de l’attelage sur le contrôle du chariot dans le courant.
- Risque de perte de bœufs.
- Bilan illustré après chaque traversée.
- Illustration différente selon le fleuve, la méthode et le résultat.

## Ressources et causes d’échec

La page d’aide et la logique ont été étendues pour que chaque ressource ait une utilité et puisse devenir une cause d’échec :

- Les vivres sont consommés par chaque personne et chaque jour écoulé.
- La ration choisie s’applique au voyage, au repos et à la chasse.
- Les balles conditionnent la chasse.
- Les couvertures protègent du froid.
- Le chariot doit être entièrement vide avant les achats : c’est au joueur de composer son chargement.
- Le nombre de couvertures doit réellement déterminer combien de voyageurs restent protégés du froid et des engelures.
- Les pièces évitent les réparations longues et coûteuses.
- Les remèdes traitent voyageurs et bœufs.
- L’argent sert aux forts, bacs et rencontres.
- Les bœufs influencent la vitesse et peuvent être blessés, volés ou perdus dans un fleuve.
- Un bœuf abattu peut devenir de la nourriture.
- Sans dernier bœuf, le voyage s’arrête.
- Lorsqu’il n’y a plus assez à manger, le joueur peut abattre un bœuf tant qu’il en reste plus d’un, y compris avant un repos ou après une chasse.
- La vitesse de l’attelage suit les paliers demandés : deux bœufs ralentissent fortement, six donnent l’allure de référence et huit suffisent pour atteindre le bénéfice maximal.
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
- De regrouper l’incident et la conséquence du choix dans une seule entrée datée, y compris pour une étape calme.
- De faire du journal un récit permettant de revivre l’aventure, avec les noms, causes de décès, guérisons, pertes, stocks restants, choix tactiques et état du groupe après le repos.
- D’ouvrir le journal par la profession, le chargement choisi et l’argent restant au départ d’Independence.
- D’indiquer pour chaque étape les vivres consommés et ceux qui restent dans le chariot.
- D’éviter les titres et phrases répétant deux fois la même information, notamment lors d’un décès.

## Score final

Le score a été remplacé par une logique inspirée de Civilization I, avec vingt rangs allant de :

- « Disparu sans laisser de trace »
- jusqu’à « Père ou Mère de l’Oregon ».

Une défaite ne peut plus obtenir un rang réservé à une arrivée réussie, même si le joueur conservait beaucoup d’argent ou de provisions.

Chaque membre du groupe mort en chemin doit également entraîner une pénalité explicite dans le score final.

Le métier module aussi la valeur du score : réussir avec la faible bourse du fermier rapporte davantage, tandis que l’avantage financier du banquier réduit fortement le résultat.

## Langue et terminologie

Les demandes ultérieures comprennent également :

- « Compagnon·ne » → « Compagnon ».
- « Voyageur·se » → « Voyageur ».
- Gestion correcte des pluriels, y compris le singulier après zéro.
- Suppression du texte explicatif associé au rythme.
- Renommage du jeu en « Oregon Vibe » en français et en anglais.
- Interface complète en français et en anglais.
- Traduction dynamique des événements, journaux, cartes, bilans et scores.
- Raccourcissement du lien d’accueil en « Infos » et « About ».

## Aide, sauvegarde et publication demandées par l’utilisateur

Enfin, le périmètre a ajouté :

- La suppression complète de la sauvegarde de partie.
- Une page immersive « Pionnier, ce que tu sais avant le départ ».
- Une aide expliquant les ressources sans révéler les valeurs internes.
- Une explication indiquant que la carte permet d’anticiper les 150 km suivants.
- La publication du dépôt sur GitHub.
- Le déploiement GitHub Pages.
- Une revue globale d’équilibrage.
- Une revue de cohérence des actions indisponibles.
- Une passe complète de préproduction.

## Documentation de l’expérience demandée par l’utilisateur

Les dernières demandes portent sur la documentation du projet lui-même :

- Conserver dans un fichier le récapitulatif de toutes les demandes et leur ampleur par rapport à la requête initiale.
- Fournir ce document en français et en anglais, avec un lien discret depuis la page d’accueil vers la version correspondant à la langue choisie.
- Présenter explicitement l’objectif de l’expérience : partir d’une consigne très générale, laisser l’IA choisir la conception et l’implémentation d’un jeu complet, sans réutiliser de code ni d’assets existants, et identifier le système employé — Codex, modèle SOL 5.6, raisonnement « medium ».
- Remettre ces deux documents à jour, les présenter dans la même identité visuelle que le jeu et leur consacrer une nouvelle illustration cohérente avec sa direction artistique.

## Décisions et travaux ajoutés par l’IA

Les éléments suivants ont été décidés ou précisés par l’IA. Ils répondaient à des demandes plus générales, mais n’ont pas été prescrits individuellement par l’utilisateur :

- Le choix d’un mini-jeu d’attaque centré sur l’esquive, la riposte demandée restant un choix tactique abstrait plutôt qu’un tir dirigé sur des personnages.
- Le choix précis de la direction artistique inspirée des affiches WPA et de la gouache sérigraphiée.
- Les valeurs numériques exactes des probabilités, consommations, dégâts, capacités et seuils de score.
- La séparation technique entre rangs accessibles après une défaite et rangs réservés à une arrivée en Oregon.
- La compression des images.
- Un favicon et une image de partage social.
- Les métadonnées sociales et d’indexation.
- Un sitemap et un `robots.txt`.
- Un contrôle GitHub automatique du code et des ressources.
- Les scripts et scénarios automatisés utilisés pour tester les parcours, le mobile et les ressources publiques.

## Conclusion

La demande initiale définissait la plateforme, le genre du jeu et l’ambition visuelle. Les demandes suivantes de l’utilisateur ont déterminé une grande partie des règles de survie, de l’interface mobile, du vocabulaire historique, des incidents, de la météo, de l’économie, des bilans et de la traduction. L’IA a ensuite choisi les détails d’implémentation, les valeurs d’équilibrage, une partie de la mise en scène et les optimisations techniques recensées séparément ci-dessus.
