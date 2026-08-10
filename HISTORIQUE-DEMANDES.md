# Historique et évolution des demandes

## Objectif de l’expérience

L’objectif formulé explicitement par l’utilisateur était de tester ce que produit une IA lorsqu’on lui demande de coder un jeu complet. Pour cette expérience, l’IA indiquée par l’utilisateur était Codex avec le modèle SOL 5.6 et un niveau de raisonnement « medium ».

La demande initiale étant très générale, de nombreux choix de conception et d’implémentation ont, dans les faits, été laissés au LLM. Le code et les illustrations ont été produits pour le projet, mais l’expression « sans reprendre de code ni d’assets existants » ne figurait pas comme contrainte explicite de l’utilisateur : elle ne doit donc pas lui être attribuée.

## Quantification du périmètre

La demande initiale contenait cinq grandes exigences :

1. Refaire Oregon Trail en HTML.
2. Fonctionnement entièrement côté client.
3. Reprendre le gameplay classique.
4. Produire de meilleures illustrations avec une direction artistique homogène.
5. Utiliser plusieurs agents pour le code et les images.

Depuis, plus de 100 messages substantiels de spécification ont prolongé cette consigne, sans compter les simples messages opérationnels comme « j’ai fait ssh-add », « GitHub Pages est configuré » ou « continue ». Une première version de ce bilan avait été établie après 45 messages ; le travail de réglage, de narration et de contrôle qualité s’est ensuite poursuivi pendant plus de 55 demandes supplémentaires.

Avec un découpage où chaque comportement vérifiable explicitement demandé compte comme une demande, on obtient désormais environ 200 exigences supplémentaires. Ce total exclut les mécanismes, valeurs et choix de mise en scène inventés par le LLM :

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

Le document distingue désormais trois origines :

- **Demande utilisateur** : comportement ou contenu formulé explicitement dans la conversation.
- **Décision du LLM** : conception, mise en scène ou détail technique choisi par le modèle sans instruction correspondante.
- **Origine mixte** : objectif demandé par l’utilisateur, mais forme jouable ou solution concrète choisie par le LLM. Les deux contributions sont alors séparées.

Seuls les éléments classés « demande utilisateur » entrent dans l’estimation d’environ 200 exigences. Une validation, une correction de bug ou une décision du LLM n’est pas transformée rétroactivement en demande de l’utilisateur.

Une règle particulière a guidé cette vérification : lorsqu’une mécanique d’abord inventée par le LLM a ensuite été corrigée, équilibrée ou documentée par l’utilisateur, la mécanique initiale reste attribuée au LLM ; seules les corrections ultérieures sont attribuées à l’utilisateur.

## Illustrations et interface

> **Attribution : demandes utilisateur.**

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

> **Attribution : demandes utilisateur, sauf mention contraire.**

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
- Le fonctionnement tactile sur mobile.
- La suppression de la notification superposée « Touché ».
- Une chance de mise à mort propre à chaque espèce : le petit gibier tombe plus facilement que le cerf ou le bison.
- Une raréfaction locale après plusieurs chasses au même endroit, tout en conservant quelques oiseaux et lapins.
- La consommation de la ration sélectionnée pendant la journée de chasse.
- La résolution des conséquences de la journée seulement après le chargement de la viande rapportée.

> **Décision du LLM :** faire appliquer automatiquement la capacité générale du chariot au chargement de la viande, en complément de la limite explicite de 90 kg par chasse.

## Lieux, forts et commerce

> **Attribution : demandes utilisateur, sauf mention contraire.**

Il a été demandé :

- De pouvoir réaliser plusieurs actions lors d’une même halte.
- De ne plus repartir automatiquement après un achat ou un repos.
- D’acheter plusieurs fois des vivres ou des balles.
- De pouvoir acheter aléatoirement des bœufs et de l’équipement dans les forts.
- D’ajouter des rencontres commerciales.
- Que l’objet, le prix et la quantité d’une rencontre soient imposés.
- De limiter le choix du joueur à accepter ou refuser.
- D’afficher immédiatement après chaque achat l’article acquis et le nouveau stock correspondant.
- De tripler le prix des balles, au départ comme sur la piste.
- De pouvoir consulter l’inventaire sans quitter une halte dans un fort.
- Que tous les forts vendent toujours des remèdes.
- Des unités d’achat uniformes : remèdes et couvertures à l’unité, balles par vingt et bœufs à l’unité dans les forts.
- Des prix de base croissant vers l’ouest : Fort Kearny ×1,25, Fort Laramie ×1,50 et Fort Boise ×2 par rapport à Independence.
- Une hausse après les achats répétés d’une même marchandise dans un fort, à l’exception des vivres dont le tarif local reste fixe.
- Des bourses de départ finalement fixées à 600 $ pour le fermier, 900 $ pour le charpentier et 1 500 $ pour le banquier.

Le triplement général des balles et les premières bourses ont ensuite été remplacés par des prix de départ explicites — notamment 25 $ par bœuf, 4 $ pour 10 kg de vivres et 1 $ pour 10 balles à Independence — puis par la bourse finale de 600 $ pour le fermier. Il s’agit de demandes utilisateur successives, pas de valeurs choisies par le LLM.

> **Décision du LLM :** désactiver de manière générale les achats impossibles ou dépassant la capacité du chariot. La désactivation selon les ressources disponibles avait été demandée explicitement pour les choix de riposte pendant une attaque, pas comme règle générale de tous les comptoirs.

## Incidents ajoutés

> **Attribution : demandes utilisateur.**

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

> **Attribution : demande utilisateur explicite.**

Le changement exact demandé a été :

> « Des cavaliers autochtones » → « Les indiens »

Ce vocabulaire ne vient donc pas de la demande initiale : il a été imposé explicitement plus tard.

C’est un choix éditorial sensible, car « les Indiens » généralise des peuples distincts et les présente ici dans un rôle antagoniste. Il faudrait conserver la trace de cette décision si le jeu est présenté publiquement ou évalué sous l’angle historique.

## Point sensible : l’attaque reste un jeu défensif

> **Attribution : origine mixte.**

### Ce que l’utilisateur a demandé

- Ajouter une attaque des Indiens sous la forme d’un mini-jeu différent de la chasse.
- Faire dépendre son issue de voyageurs blessés ou morts et afficher un écran de bilan.
- Rendre l’attaque plus dangereuse, puis éviter que sa difficulté n’augmente excessivement à la fin du voyage.
- Permettre quatre niveaux de riposte : aucune, légère, soutenue et maximale.
- Faire consommer des balles à la riposte et raccourcir l’attaque selon le niveau choisi.
- Désactiver les options pour lesquelles les balles manquent, afficher les munitions disponibles et réserver la riposte maximale aux groupes comptant au moins trois survivants.
- Inscrire le choix de riposte et l’éventuelle limitation dans le journal.
- Conserver le raccourci `&` pour déclencher l’incident pendant les tests.
- Signaler dans le présent historique que le caractère défensif du mini-jeu constitue un point sensible.

### Ce que le LLM a décidé

- Représenter l’attaque comme une séquence de survie chronométrée.
- Faire déplacer le chariot latéralement au joueur plutôt que lui faire viser les cavaliers.
- Matérialiser le danger par des projectiles à esquiver.
- Centrer l’action sur la protection du convoi jusqu’au retrait des assaillants.
- Ne pas faire des cavaliers des cibles directes et représenter la riposte demandée comme une décision abstraite prise avant la séquence.

C’est donc le LLM — et non l’utilisateur — qui a choisi de faire déplacer le chariot, d’esquiver des projectiles et de ne pas viser les cavaliers. Les demandes ultérieures de riposte ont complété cette conception sans en transférer la paternité à l’utilisateur. L’événement conserve par ailleurs la représentation sensible des « Indiens » comme agresseurs.


## Santé, maladies et décès

> **Attribution : demandes utilisateur.**

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
- Ne jamais afficher une guérison suivie d’un décès de la même maladie à la même date.

Ce dernier point ne rend pas la partie gagnable automatiquement : tout le groupe peut mourir progressivement au cours du voyage.

> **Décision du LLM :** résoudre techniquement toutes les conséquences quotidiennes avant de publier une guérison dans le journal.

## Temps, météo et événements

> **Attribution : demandes utilisateur, sauf mention contraire.**

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
- La météo dépend du jour, du temps des jours précédents et de la géographie traversée.
- Les transitions brutales, notamment entre neige et forte chaleur, sont interdites.
- Les bassins désertiques ne produisent jamais de neige.
- Le relief, la pente et l’état réel de la piste modifient la vitesse et le risque d’incident.
- Les conditions de chaque portion de piste sont affichées dans le paysage et consignées dans le journal.
- La durée d’une partie préparée doit rester cohérente avec la durée historique du voyage, à vérifier.
- Une nouvelle passe complète doit contrôler la logique générale, la sélection des événements et toute incohérence résiduelle.
- Les coefficients finaux de consommation liés à l’allure ont été demandés explicitement : prudente ×0,95, soutenue ×1 et épuisante ×1,10.

> **Décisions du LLM :** retenir concrètement une mémoire des trois dernières journées pour représenter l’influence demandée du temps passé ; traduire l’exigence de réalisme historique par une cible d’environ quatre à six mois pour un convoi préparé.

## Fleuves

> **Attribution : demandes utilisateur, sauf mention contraire.**

Les franchissements ont reçu un système complet :

- Profondeur aléatoire.
- Variation après une attente.
- Influence de la saison.
- Influence de la saison et de la météo.
- Pour un niveau moyen de 2 m, une variation pouvant atteindre environ 1 m entier plutôt qu’une fluctuation limitée à 30 cm.
- Rééquilibrage du bac, de l’attente et de la traversée à flot présents dans la première version.
- Risque de perte de matériel et de bœufs, avec des pertes proportionnelles au chargement.
- Pour la traversée à flot, probabilité de perdre du matériel augmentant exponentiellement avec la hauteur de l’eau.
- Augmentation répétée de la difficulté, la traversée à flot ne devant pas réussir presque systématiquement.
- Influence de la fatigue des voyageurs et de l’attelage sur le contrôle du chariot dans le courant.
- Risque de perte de bœufs.
- Bilan illustré après chaque traversée.
- Illustration différente selon le fleuve, la méthode et le résultat.

> **Décisions du LLM :** proposer initialement le trio bac, attente et traversée à flot pour concrétiser le gameplay classique demandé ; représenter la saison et la météo par une estimation hydrologique incluant notamment la pluie, la chaleur et la fonte ; faire regagner la rive de départ au convoi lors de certains échecs ; répartir les pertes de matériel entre vivres, munitions, couvertures, pièces et remèdes.

## Ressources et causes d’échec

> **Attribution : demandes utilisateur, sauf mention contraire.**

La page d’aide et la logique ont été étendues pour que chaque ressource ait une utilité et puisse devenir une cause d’échec :

- Les vivres sont consommés par chaque personne et chaque jour écoulé.
- La ration choisie s’applique au voyage, au repos et à la chasse.
- Les balles conditionnent la chasse.
- Les couvertures protègent du froid.
- Le chariot doit être entièrement vide avant les achats : c’est au joueur de composer son chargement.
- Le nombre de couvertures doit réellement déterminer combien de voyageurs restent protégés du froid et des engelures.
- Les pièces de rechange et les remèdes doivent avoir une utilité concrète et pouvoir manquer au mauvais moment.
- L’argent sert aux forts, bacs et rencontres.
- Les bœufs influencent la vitesse et peuvent être blessés, volés ou perdus dans un fleuve.
- Un bœuf abattu peut devenir de la nourriture.
- Sans dernier bœuf, le voyage s’arrête.
- Lorsqu’il n’y a plus assez à manger, le joueur peut abattre un bœuf tant qu’il en reste plus d’un, y compris avant un repos ou après une chasse.
- La vitesse de l’attelage suit les paliers demandés : deux bœufs ralentissent fortement, six donnent l’allure de référence et huit suffisent pour atteindre le bénéfice maximal.
- Aucun message ne doit annoncer une perte de « 0 kg ».

> **Décisions du LLM :** faire servir les pièces à éviter certaines réparations longues ; permettre aux remèdes de traiter aussi les bœufs ; appliquer la capacité globale du chariot à tous les gains de ressources, au-delà des limites particulières demandées.

## Journal et bilan

> **Attribution : demandes utilisateur.**

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

> **Attribution : demandes utilisateur, sauf mention contraire.**

Le score a été remplacé par une logique inspirée de Civilization I, avec vingt rangs allant de :

- « Disparu sans laisser de trace »
- jusqu’à « Père ou Mère de l’Oregon ».

Chaque rang doit recevoir un commentaire propre permettant au joueur de situer sa réussite, de l’échec dérisoire jusqu’à l’élite de la piste.

> **Décision du LLM :** séparer techniquement les rangs accessibles après une défaite de ceux réservés à une arrivée, afin qu’une expédition perdue ne reçoive pas un titre de victoire grâce à ses ressources restantes.

Chaque membre du groupe mort en chemin doit également entraîner une pénalité explicite dans le score final.

Le métier module aussi la valeur du score : réussir avec la faible bourse du fermier rapporte davantage, tandis que l’avantage financier du banquier réduit fortement le résultat.

## Langue et terminologie

> **Attribution : demandes utilisateur.**

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

> **Attribution : demandes utilisateur.**

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

> **Attribution : demandes utilisateur.**

Les dernières demandes portent sur la documentation du projet lui-même :

- Conserver dans un fichier le récapitulatif de toutes les demandes et leur ampleur par rapport à la requête initiale.
- Fournir ce document en français et en anglais, avec un lien discret depuis la page d’accueil vers la version correspondant à la langue choisie.
- Présenter explicitement l’objectif de l’expérience : tester ce que produit une IA lorsqu’on lui demande de coder un jeu complet, et identifier le système employé — Codex, modèle SOL 5.6, raisonnement « medium ».
- Remettre ces deux documents à jour, les présenter dans la même identité visuelle que le jeu et leur consacrer une nouvelle illustration cohérente avec sa direction artistique.

## Décisions et travaux ajoutés par l’IA

> **Attribution : décisions du LLM.**

Les éléments suivants ont été décidés ou précisés par l’IA. Ils répondaient à des demandes plus générales, mais n’ont pas été prescrits individuellement par l’utilisateur :

- Le choix du déplacement latéral du chariot, des projectiles à esquiver et d’un chronomètre de survie pour le mini-jeu d’attaque ; la riposte, demandée ensuite par l’utilisateur, a été intégrée comme un choix abstrait plutôt qu’un tir dirigé sur les cavaliers.
- Le choix précis de la direction artistique inspirée des affiches WPA et de la gouache sérigraphiée.
- Les valeurs numériques nécessaires au fonctionnement lorsque l’utilisateur n’en avait fourni aucune. À l’inverse, les probabilités d’incident, prix, coefficients de consommation, paliers de vitesse des bœufs, durées et règles de riposte explicitement donnés dans la conversation restent des demandes utilisateur.
- La structure interne de l’état du jeu, les formules non spécifiées, la détection des collisions et la manière d’enchaîner les fenêtres d’événement.
- Une mémoire limitée aux trois derniers jours pour lisser la météo, alors que l’utilisateur avait seulement demandé de tenir compte des jours précédents.
- Une cible de quatre à six mois pour traduire en durée de jeu la demande de réalisme historique.
- Le découpage précis des 3 200 km en régions, coefficients de pente, états de piste et profils climatiques pour répondre à la demande géographique.
- Le choix initial du bac, de l’attente et de la traversée à flot comme trois modalités jouables, ensuite rééquilibrées selon les demandes.
- L’affectation précise de certaines ressources lorsque seule leur utilité générale avait été demandée, notamment les pièces pour accélérer des réparations et les remèdes utilisables sur les bœufs.
- L’application générale de la capacité du chariot aux achats et aux gains.
- La séparation technique entre rangs accessibles après une défaite et rangs réservés à une arrivée en Oregon.
- La compression des images.
- Un favicon et une image de partage social.
- Les métadonnées sociales et d’indexation.
- Un sitemap et un `robots.txt`.
- Un contrôle GitHub automatique du code et des ressources.
- Les scripts et scénarios automatisés utilisés pour tester les parcours, le mobile et les ressources publiques.

## Conclusion

La demande initiale définissait la plateforme, le genre du jeu et l’ambition visuelle. Les demandes suivantes de l’utilisateur ont déterminé une grande partie des règles de survie, de l’interface mobile, du vocabulaire historique, des incidents, de la météo, de l’économie, des bilans et de la traduction. Le LLM a choisi les formes jouables qui n’étaient pas spécifiées — notamment l’esquive en chariot pendant l’attaque — ainsi que les détails d’implémentation, les valeurs d’équilibrage non fournies, une partie de la mise en scène et les optimisations techniques recensées séparément ci-dessus.
