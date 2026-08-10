# Request history and evolution

## Purpose of the experiment

The objective explicitly stated by the user was to test what an AI produces when asked to code a complete game. For this experiment, the system identified by the user was Codex with the SOL 5.6 model and the “medium” reasoning level.

Because the initial request was very broad, many design and implementation choices were in practice left to the LLM. The code and illustrations were produced for the project, but “without reusing existing code or assets” was not phrased as an explicit user constraint and must therefore not be attributed to the user.

## Scope quantification

The initial request contained five broad requirements:

1. Rebuild Oregon Trail in HTML.
2. Run entirely on the client side.
3. Reproduce the classic gameplay.
4. Produce better illustrations with a consistent art direction.
5. Use multiple agents for the code and images.

Since then, more than 100 substantial specification messages have extended that prompt, excluding purely operational messages such as “I ran ssh-add,” “GitHub Pages is configured,” or “continue.” A first version of this report was prepared after 45 messages; tuning, narrative work, and quality control then continued through more than 55 additional requests.

Using a breakdown in which each explicitly requested, independently verifiable behavior counts as one request, this now amounts to approximately 200 additional requirements. This total excludes mechanics, values, and staging choices invented by the LLM:

| Area added after the initial request | Approximate number |
|---|---:|
| Images, interface, and mobile | 35 |
| Gameplay, economy, and balancing | 72 |
| Incidents, illnesses, and health | 30 |
| Terminology, journal, and translation | 35 |
| Help, publishing, and launch preparation | 20 |
| Experiment documentation | 8 |
| **Total** | **≈ 200** |

More than 97% of the detailed requirements were therefore specified after the initial request. The finished project is substantially broader than a simply illustrated version of the classic Oregon Trail.

### How to read this document

The document now distinguishes three sources:

- **User request**: a behavior or piece of content explicitly stated in the conversation.
- **LLM decision**: a design, staging, or technical detail selected by the model without a corresponding instruction.
- **Mixed origin**: an objective requested by the user whose playable form or concrete solution was selected by the LLM. The two contributions are then listed separately.

Only items classified as “user request” are included in the estimate of approximately 200 requirements. A validation, bug fix, or LLM decision is not retroactively turned into a user request.

One rule guided this review in particular: when a mechanic first invented by the LLM was later corrected, balanced, or documented by the user, the original mechanic remains attributed to the LLM; only the later corrections are attributed to the user.

## Illustrations and interface

> **Attribution: user requests.**

The successive requests added:

- A different illustration for every stage.
- Four weather variants for each stage: mild, hot, cold, and rainy.
- Dedicated landscapes for Chimney Rock, Fort Laramie, Independence Rock, South Pass, Fort Boise, The Dalles, and others.
- For every fort, an approach view in which the destination remains distant, followed by a distinct arrival image at the gate or inside the enclosure.
- Multiple approach views for every stage: the landmark is tiny at long range, becomes identifiable along the way, and appears close upon arrival.
- A specific image for every incident.
- Hunting images adapted to the weather.
- The same illustration during a hunt and in its outcome report.
- Images specific to each river, crossing method, and outcome.
- Removal of artificial rain and snow overlays.
- Greater emphasis on illustrations, especially on mobile.
- A fix for partially obscured headings on the setup screen.
- The following mobile order: title, progress, image, journal, wagon, party, controls.
- Automatic scrolling back to the top after a report.
- Separate buttons for the map and inventory.
- A map showing every stage and the party’s current position.
- On the map, a preview of the next 150 km: terrain, trail quality, likely speed, and available game.
- A total-party-loss illustration distinct from the victory image.
- A series of death illustrations based on the number of survivors, including a special scene for the final traveler, whom nobody remains to bury.
- River illustrations adapted to the day’s weather.
- A project-history page using the game’s art direction and a new original illustration devoted to recording the expedition.

## Hunting

> **Attribution: user requests, except where noted.**

Hunting gradually received:

- An illustrated intermediate report screen.
- The number of bullets fired and remaining.
- The amount of meat loaded.
- Rabbits and birds.
- Increased difficulty.
- Fewer bison in rain.
- Less game in snow.
- Significantly rarer bison and rabbits in cold or snowy weather, with fewer simultaneous targets.
- Abundance and species also depend on terrain, including no bison in desert regions.
- A limit of 90 kg per hunt.
- Working touch controls on mobile.
- Removal of the overlaid “Hit” notification.
- A species-specific kill chance: small game falls more readily than deer or bison.
- Local depletion after repeated hunts in one place, while a few birds and rabbits remain.
- Consumption of the selected ration during the hunting day.
- Resolution of the day’s consequences only after the hunted meat has been loaded.

> **LLM decision:** automatically applying the wagon’s general capacity to hunted meat, in addition to the explicitly requested limit of 90 kg per hunt.

## Locations, forts, and trade

> **Attribution: user requests, except where noted.**

The requests included:

- Allowing several actions during the same stop.
- No longer leaving automatically after a purchase or rest.
- Buying food or bullets multiple times.
- Random availability of oxen and equipment at forts.
- Trade encounters.
- A fixed item, price, and quantity for each encounter.
- Limiting the player’s choice to accepting or declining the offer.
- Immediately showing the purchased item and its updated stock after every purchase.
- Tripling ammunition prices, both before departure and along the trail.
- Accessing the inventory without leaving a fort stop.
- Ensuring that every fort always sells medicine.
- Standard purchase units: medicine and blankets individually, bullets in lots of twenty, and individual oxen at forts.
- Base prices increasing westward: Fort Kearny ×1.25, Fort Laramie ×1.50, and Fort Boise ×2 compared with Independence.
- A price increase after repeated purchases of the same good at a fort, except for food, whose local price remains fixed.
- Final starting funds of $600 for the farmer, $900 for the carpenter, and $1,500 for the banker.

The general tripling of bullet prices and the first starting budgets were later superseded by explicit departure prices—including $25 per ox, $4 per 10 kg of food, and $1 per 10 bullets at Independence—and then by the farmer’s final $600 budget. These were successive user requests, not values chosen by the LLM.

> **LLM decision:** generally disabling purchases that are unaffordable or exceed wagon capacity. Disabling choices according to available resources was explicitly requested for return-fire options during an attack, not as a general rule for every trading post.

## Added incidents

> **Attribution: user requests.**

The initial request did not describe incidents in detail. Later additions included:

- Fever.
- Dysentery.
- Injury.
- Contagious disease.
- Frostbite in cold weather.
- Infected bites in hot weather.
- Loss or consumption of blankets.
- Theft.
- An injured ox.
- A wagon overturning.
- A broken axle.
- Torrential rain.
- A trade encounter.
- An attack by Indians.
- Venomous snakebite, impossible in cold or snow and more likely during intense heat.
- A dedicated window when no incident occurs.

Every incident also had to be recorded in the journal and have its own illustration.
During a contagious disease outbreak, the names of every affected traveler must be shown.
Illnesses must last several days: neither medicine nor two days of rest immediately cures dysentery.

## Sensitive point: “Native riders” changed to “Indians”

> **Attribution: explicit user request.**

The exact requested change was:

> “Native riders” → “The Indians”

This vocabulary did not come from the initial request: it was explicitly imposed later.

This is a sensitive editorial choice because “the Indians” generalizes distinct peoples and presents them here in an antagonistic role. The origin of this decision should remain documented if the game is presented publicly or evaluated from a historical perspective.

## Sensitive point: the attack remains defensive

> **Attribution: mixed origin.**

### What the user requested

- Add an attack by Indians as a mini-game different from hunting.
- Let its outcome include injured or dead travelers and show a dedicated report screen.
- Make the attack more dangerous, then prevent its difficulty from increasing excessively near the end of the journey.
- Provide four return-fire levels: none, light, sustained, and maximum.
- Make return fire consume bullets and shorten the attack according to the selected level.
- Disable options when bullets are insufficient, display available ammunition, and require at least three survivors for maximum return fire.
- Record the return-fire choice and any limitation in the journal.
- Keep the `&` shortcut to trigger the incident during testing.
- Identify the defensive nature of the mini-game as a sensitive point in this history.

### What the LLM decided

- Represent the attack as a timed survival sequence.
- Have the player move the wagon laterally instead of aiming at the riders.
- Represent danger through projectiles that must be avoided.
- Center the action on protecting the wagon party until the attackers withdraw.
- Avoid making riders direct targets and represent the requested return fire as an abstract decision made before the sequence.

It was therefore the LLM—not the user—that chose wagon movement, projectile avoidance, and the absence of direct aiming at riders. Later requests for return fire extended that design without transferring authorship of it to the user. The event nevertheless retains the sensitive representation of “Indians” as aggressors.


## Health, illness, and death

> **Attribution: user requests.**

The requests imposed several editorial rules:

- Never refer to “health points.”
- Never display a health percentage.
- Use qualitative conditions such as healthy, tired, or very weak.
- Do not display “Healthy” when the individual or overall condition is poor.
- Continue illnesses during travel, repairs, waits, and hunts.
- Display “No medicine needed” when nobody is wounded.
- Display “No medicine available” when treatment is needed but impossible.
- Do not visually present a medical action as available without medicine.
- Avoid killing several party members at the same instant.
- Present every death in an event window with a dedicated illustration.
- Make illness and injury more likely to kill an already severely weakened traveler.
- Keep dysentery, fever, injuries, and attack wounds long enough that a short halt cannot erase them.
- Let wounds heal during every day of rest, including successive halts, while illnesses continue to weaken the patient.
- Never display recovery followed by death from the same illness on the same date.

The last rule does not guarantee success: the entire party can still die progressively during the journey.

> **LLM decision:** technically resolving all daily consequences before publishing a recovery in the journal.

## Time, weather, and events

> **Attribution: user requests, except where noted.**

The original logic was expanded substantially:

- Events are now rolled daily.
- A “Travel 5 days” command simulates five separate days.
- If an event occurs on the second day, only two days are consumed.
- Once the event is resolved, the journey resumes from that date and position.
- Consumption depends on the number of survivors.
- Weather affects distance traveled.
- Incidents are handled individually: some depend on each day, while others depend on distance traveled.
- Pace chiefly increases movement-related accidents; it does not artificially make thefts, encounters, or attacks more frequent.
- A grueling pace genuinely increases consumption, fatigue, and breakdowns, while a cautious pace slightly conserves food.
- August no longer produces implausibly cold weather.
- Weather follows a seasonal distribution.
- The journal associates distance traveled with the weather encountered.
- Weather depends on the date, previous days’ weather, and local geography.
- Abrupt transitions, especially between snow and extreme heat, are forbidden.
- Desert basins never generate snow.
- Terrain, slope, and actual trail quality modify speed and incident risk.
- Conditions for each section of trail are displayed over the landscape and recorded in the journal.
- A prepared playthrough should remain consistent with the historical duration of the journey, which was to be verified.
- A new complete pass must review the overall logic, event selection, and any remaining inconsistencies.
- The final pace-related food coefficients were explicitly requested: cautious ×0.95, normal ×1, and grueling ×1.10.

> **LLM decisions:** concretely using the previous three days as the memory window for the requested influence of past weather; translating the historical-realism requirement into a target of roughly four to six months for a prepared wagon party.

## Rivers

> **Attribution: user requests, except where noted.**

River crossings received a complete system:

- Random depth.
- Variation after waiting.
- Seasonal influence.
- Influence from season and weather.
- For a mean level of 2 m, variation capable of reaching roughly a full meter rather than being limited to about 30 cm.
- Rebalancing the ferry, waiting, and floating options already present in the first version.
- Risk of losing equipment and oxen, with losses proportional to the load.
- When floating the wagon, an exponentially increasing chance of losing cargo as water depth rises.
- Repeated increases in difficulty so that floating the wagon does not succeed almost every time.
- Traveler and ox-team fatigue affects the party’s ability to control the wagon in the current.
- Risk of losing oxen.
- An illustrated report after every crossing.
- A different illustration for each river, method, and outcome.

> **LLM decisions:** initially offering ferrying, waiting, and floating as the three ways to implement the requested classic gameplay; representing season and weather through a hydrological estimate that includes rain, heat, and snowmelt; returning the wagon party to the original bank after some failures; and distributing equipment losses among food, bullets, blankets, spare parts, and medicine.

## Resources and failure conditions

> **Attribution: user requests, except where noted.**

The help page and game logic were expanded so that every resource has a purpose and can contribute to failure:

- Every person consumes food on every elapsed day.
- The selected ration applies during travel, rest, and hunting.
- Bullets determine the ability to hunt.
- Blankets provide protection from cold.
- The wagon must start completely empty before shopping, leaving the player to build the loadout.
- The number of blankets must materially determine how many travelers remain protected from cold and frostbite.
- Spare parts and medicine must have a concrete use and be capable of running short at the wrong time.
- Money is used at forts, ferries, and encounters.
- Oxen affect speed and can be injured, stolen, or lost in a river.
- A slaughtered ox can become food.
- Losing the final ox ends the journey.
- When food is insufficient, the player may slaughter an ox as long as more than one remains, including before resting or after hunting.
- Ox-team speed follows the requested thresholds: two oxen impose a severe slowdown, six provide the reference pace, and eight are enough to reach the maximum benefit.
- No message may report a loss of “0 kg.”

> **LLM decisions:** using spare parts to avoid certain long repairs; allowing medicine to treat oxen as well; and applying the wagon’s overall capacity to all resource gains, beyond the specific limits requested by the user.

## Journal and reports

> **Attribution: user requests.**

The requests included:

- Recording every incident in the journal.
- Showing the newest entries first.
- Adding the complete journal to the ending screen.
- Displaying a report for an uneventful leg.
- Showing distance traveled and food consumed.
- Adding separate reports for hunting, attacks, and rivers.
- Combining an incident and the consequence of the chosen action into one dated entry, including uneventful travel legs.
- Turning the journal into a narrative that can recreate the adventure, including names, causes of death, recoveries, losses, remaining stocks, tactical choices, and the party’s condition after rest.
- Opening the journal with the occupation, selected loadout, and cash remaining upon departure from Independence.
- Recording food consumed and remaining for every travel leg.
- Avoiding headings and sentences that repeat the same information twice, especially when a traveler dies.

## Final score

> **Attribution: user requests, except where noted.**

The score was replaced with a Civilization I-inspired system containing twenty ranks, ranging from:

- “Vanished without a trace”
- to “Father or Mother of Oregon.”

Every rank must have its own comment so the player can understand where the result stands, from a pitiful failure to the elite of the trail.

> **LLM decision:** technically separating ranks available after defeat from ranks reserved for arrival, preventing a lost expedition from receiving a victory title because of its remaining resources.

Every party member who dies along the way must also incur an explicit final-score penalty.

Occupation also scales the score: succeeding on the farmer’s small budget is worth more, while the banker’s financial advantage sharply reduces the result.

## Language and terminology

> **Attribution: user requests.**

Later requests also included:

- “Compagnon·ne” → “Compagnon.”
- “Voyageur·se” → “Voyageur.”
- Correct plural handling, including the singular form after zero in French.
- Removal of the explanatory pace text.
- Renaming the game “Oregon Vibe” in both French and English.
- A complete French and English interface.
- Dynamic translation of events, journals, maps, reports, and scores.
- Shortening the homepage link to “Infos” and “About.”

## Help, saving, and publishing requested by the user

> **Attribution: user requests.**

Finally, the scope added:

- Complete removal of game saving.
- An immersive “Pioneer, what you know before leaving” page.
- Help explaining resources without revealing internal values.
- An explanation that the map helps anticipate the next 150 km.
- Publishing the repository on GitHub.
- Deployment through GitHub Pages.
- A full balancing review.
- A consistency review of unavailable actions.
- A complete launch-readiness pass.

## Experiment documentation requested by the user

> **Attribution: user requests.**

The final requests concern documentation of the project itself:

- Preserve a file summarizing all requests and their scale compared with the initial prompt.
- Provide the document in French and English, with a discreet homepage link to the version matching the selected language.
- State the purpose of the experiment explicitly: test what an AI produces when asked to code a complete game, and identify the system used—Codex, SOL 5.6 model, “medium” reasoning.
- Bring both documents up to date, present them in the same visual identity as the game, and give them a new illustration consistent with its art direction.

## Decisions and work added by the AI

> **Attribution: LLM decisions.**

The following elements were decided or specified by the AI. They answered broader requests but were not individually prescribed by the user:

- Choosing lateral wagon movement, projectiles to avoid, and a survival timer for the attack mini-game; return fire, requested later by the user, was integrated as an abstract choice rather than aimed shooting at the riders.
- Choosing the specific art direction inspired by WPA posters and screen-printed gouache.
- Choosing numerical values required for the game when the user supplied none. Conversely, the incident probabilities, prices, consumption coefficients, ox-speed thresholds, durations, and return-fire rules explicitly supplied in the conversation remain user requests.
- The game’s internal state structure, unspecified formulas, collision detection, and sequencing of event windows.
- Limiting the weather memory to the previous three days, when the user had only requested that previous days be taken into account.
- A four-to-six-month target used to translate the historical-realism request into game duration.
- The precise division of the 3,200 km route into regions, slope coefficients, trail conditions, and climate profiles in response to the geographic requirement.
- Initially choosing ferrying, waiting, and floating as three playable crossing methods, which were subsequently rebalanced according to user requests.
- Assigning precise uses to resources when only their general usefulness had been requested, including spare parts for faster repairs and medicine usable on oxen.
- General application of wagon capacity to purchases and resource gains.
- Technically separating ranks available after defeat from ranks reserved for reaching Oregon.
- Image compression.
- A favicon and social sharing image.
- Social and indexing metadata.
- A sitemap and `robots.txt`.
- Automated GitHub checks for the code and resources.
- Automated scripts and scenarios used to test journeys, mobile layouts, and public resources.

## Conclusion

The initial request defined the platform, game genre, and visual ambition. The user’s later requests determined much of the survival rules, mobile interface, historical vocabulary, incidents, weather, economy, reports, and translation. The LLM selected the playable forms that were not specified—most notably wagon evasion during the attack—along with implementation details, balancing values not supplied by the user, part of the staging, and the technical optimizations listed separately above.
