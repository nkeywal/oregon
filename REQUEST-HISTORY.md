# Request history and evolution

## Purpose of the experiment

To test what a software-development AI produces when asked, from a very general request, to code a complete game while leaving design and implementation choices to the AI, without reusing existing code or assets. For this experiment, the AI used was Codex with the SOL 5.6 model and the “medium” reasoning level.

## Scope quantification

The initial request contained five broad requirements:

1. Rebuild Oregon Trail in HTML.
2. Run entirely on the client side.
3. Reproduce the classic gameplay.
4. Produce better illustrations with a consistent art direction.
5. Use multiple agents for the code and images.

This was followed by 39 substantial specification messages, excluding purely operational messages such as “I ran ssh-add,” “GitHub Pages is configured,” or “continue.”

Using a breakdown in which each explicitly requested, independently verifiable behavior counts as one request, this amounts to approximately 96 additional requirements:

| Area added after the initial request | Approximate number |
|---|---:|
| Images, interface, and mobile | 19 |
| Gameplay, economy, and balancing | 37 |
| Incidents, illnesses, and health | 16 |
| Terminology, copy, and translation | 11 |
| Help, publishing, and launch preparation | 10 |
| Experiment documentation | 3 |
| **Total** | **≈ 96** |

Approximately 95% of the detailed requirements were therefore specified after the initial request. The finished project is substantially broader than a simply illustrated version of the classic Oregon Trail.

### How to read this document

The sections from “Illustrations and interface” through “Experiment documentation” list requests made by the user. They describe what was requested, not necessarily how the AI chose to implement it.

The “Decisions and work added by the AI” section instead isolates design choices, numerical values, optimizations, and technical work selected by the AI in response to broader requests. Those elements should not be counted as detailed user instructions.

## Illustrations and interface

The successive requests added:

- A different illustration for every stage.
- Four weather variants for each stage: mild, hot, cold, and rainy.
- Dedicated landscapes for Chimney Rock, Fort Laramie, Independence Rock, South Pass, Fort Boise, The Dalles, and others.
- For every fort, an approach view in which the destination remains distant, followed by a distinct arrival image at the gate or inside the enclosure.
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

## Hunting

Hunting gradually received:

- An illustrated intermediate report screen.
- The number of bullets fired and remaining.
- The amount of meat loaded.
- Rabbits and birds.
- Increased difficulty.
- Fewer bison in rain.
- Less game in snow.
- Significantly rarer bison and rabbits in cold or snowy weather, with fewer simultaneous targets.
- A limit of 90 kg per hunt.
- Enforcement of the wagon’s maximum capacity.
- Working touch controls on mobile.
- Removal of the overlaid “Hit” notification.

## Locations, forts, and trade

The requests included:

- Allowing several actions during the same stop.
- No longer leaving automatically after a purchase or rest.
- Buying food or bullets multiple times.
- Random availability of oxen and equipment at forts.
- Trade encounters.
- A fixed item, price, and quantity for each encounter.
- Limiting the player’s choice to accepting or declining the offer.
- Clearly disabling purchases that are unaffordable or exceed capacity.
- Immediately showing the purchased item and its updated stock after every purchase.

## Added incidents

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
- A dedicated window when no incident occurs.

Every incident also had to be recorded in the journal and have its own illustration.

## Sensitive point: “Native riders” changed to “Indians”

The exact requested change was:

> “Native riders” → “The Indians”

This vocabulary did not come from the initial request: it was explicitly imposed later.

This is a sensitive editorial choice because “the Indians” generalizes distinct peoples and presents them here in an antagonistic role. The origin of this decision should remain documented if the game is presented publicly or evaluated from a historical perspective.

## Sensitive point: the attack is defensive

A later request specified that an attack by Indians should become a mini-game different from hunting, with travelers potentially wounded or killed and a dedicated outcome report.

The strictly defensive nature of the game was not stated word for word. It was chosen during implementation:

- The player does not shoot.
- The player moves the wagon.
- The player avoids projectiles.
- The player protects the party until the attack ends.
- The consequences are injuries or deaths.

This is therefore an important implementation decision. It avoids turning Native characters into hunting targets, although the event retains the sensitive depiction of “Indians” as attackers.

The `&` shortcut used to trigger this attack for testing was also explicitly requested and intentionally remains available.

## Health, illness, and death

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

The last rule does not guarantee success: the entire party can still die progressively during the journey.

## Time, weather, and events

The original logic was expanded substantially:

- Events are now rolled daily.
- A “Travel 5 days” command simulates five separate days.
- If an event occurs on the second day, only two days are consumed.
- Once the event is resolved, the journey resumes from that date and position.
- Consumption depends on the number of survivors.
- Weather affects distance traveled.
- Incident probabilities depend on pace and weather.
- A grueling pace genuinely increases consumption, fatigue, breakdowns, and incidents.
- August no longer produces implausibly cold weather.
- Weather follows a seasonal distribution.
- The journal associates distance traveled with the weather encountered.
- Weather depends on the date, the previous three days, and local geography.
- Abrupt transitions, especially between snow and extreme heat, are forbidden.
- Desert basins never generate snow.
- Terrain, slope, and actual trail quality modify speed and incident risk.
- Conditions for each section of trail are displayed over the landscape and recorded in the journal.
- A prepared playthrough should remain consistent with the historical journey’s four-to-six-month duration.
- A new complete pass must review the overall logic, event selection, and any remaining inconsistencies.

## Rivers

River crossings received a complete system:

- Random depth.
- Variation after waiting.
- Seasonal influence.
- Influence from rain, heat, and snowmelt.
- A choice between ferrying, waiting, and floating the wagon.
- Risk of losing food, bullets, blankets, spare parts, and medicine.
- Risk of losing oxen.
- An illustrated report after every crossing.
- A different illustration for each river, method, and outcome.

## Resources and failure conditions

The help page and game logic were expanded so that every resource has a purpose and can contribute to failure:

- Every person consumes food on every elapsed day.
- Bullets determine the ability to hunt.
- Blankets provide protection from cold.
- The wagon must start completely empty before shopping, leaving the player to build the loadout.
- The number of blankets must materially determine how many travelers remain protected from cold and frostbite.
- Spare parts prevent long and costly repairs.
- Medicine treats both travelers and oxen.
- Money is used at forts, ferries, and encounters.
- Oxen affect speed and can be injured, stolen, or lost in a river.
- A slaughtered ox can become food.
- Losing the final ox ends the journey.
- Wagon capacity limits every gain.
- No message may report a loss of “0 kg.”

## Journal and reports

The requests included:

- Recording every incident in the journal.
- Showing the newest entries first.
- Adding the complete journal to the ending screen.
- Displaying a report for an uneventful leg.
- Showing distance traveled and food consumed.
- Adding separate reports for hunting, attacks, and rivers.

## Final score

The score was replaced with a Civilization I-inspired system containing twenty ranks, ranging from:

- “Vanished without a trace”
- to “Father or Mother of Oregon.”

A failed expedition can no longer receive a rank reserved for a successful arrival, even if the player retained substantial money or supplies.

Every party member who dies along the way must also incur an explicit final-score penalty.

## Language and terminology

Later requests also included:

- “Compagnon·ne” → “Compagnon.”
- “Voyageur·se” → “Voyageur.”
- Correct plural handling, including the singular form after zero in French.
- Removal of the explanatory pace text.
- Renaming the game “Oregon Vibe” in both French and English.
- A complete French and English interface.
- Dynamic translation of events, journals, maps, reports, and scores.

## Help, saving, and publishing requested by the user

Finally, the scope added:

- Complete removal of game saving.
- An immersive “Pioneer, what you know before leaving” page.
- Help explaining resources without revealing internal values.
- Publishing the repository on GitHub.
- Deployment through GitHub Pages.
- A full balancing review.
- A consistency review of unavailable actions.
- A complete launch-readiness pass.

## Experiment documentation requested by the user

The final requests concern documentation of the project itself:

- Preserve a file summarizing all requests and their scale compared with the initial prompt.
- Provide the document in French and English, with a discreet homepage link to the version matching the selected language.
- State the purpose of the experiment explicitly: begin with a very general prompt, leave the design and implementation of a complete game to the AI, reuse no existing code or assets, and identify the system used—Codex, SOL 5.6 model, “medium” reasoning.

## Decisions and work added by the AI

The following elements were decided or specified by the AI. They answered broader requests but were not individually prescribed by the user:

- Choosing a strictly defensive attack mini-game based on evasion rather than shooting.
- Choosing the specific art direction inspired by WPA posters and screen-printed gouache.
- Choosing the exact numerical values for probabilities, consumption, damage, capacities, and score thresholds.
- Technically separating ranks available after defeat from ranks reserved for reaching Oregon.
- Image compression.
- A favicon and social sharing image.
- Social and indexing metadata.
- A sitemap and `robots.txt`.
- Automated GitHub checks for the code and resources.
- Automated scripts and scenarios used to test journeys, mobile layouts, and public resources.

## Conclusion

The initial request defined the platform, game genre, and visual ambition. The user’s later requests determined much of the survival rules, mobile interface, historical vocabulary, incidents, weather, economy, reports, and translation. The AI then selected the implementation details, balancing values, part of the staging, and the technical optimizations listed separately above.
