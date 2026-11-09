/* Reading stories and comprehension questions for each grade. */

/* one passage per grade, hand-calibrated for that grade's reading level
   (sentence length and vocabulary get harder as the grade number goes up). */
export const GRADE_INTROS = [
  ["Nomi is a meerkat. She is in the sand. The sun is hot. Nomi has no water. The pond is dry! Gran says, “Look for mud.” Nomi looks and looks. She sees green grass. Dig, dig, dig! Nomi finds water. It is cold. Nomi has a big drink."],
  ["One morning, Nomi saw a big shadow slide across the sand. It had two wide wings. It was a hawk! “Hide!” Nomi called to her cousin. They ran to a thorn bush and ducked under its branches. The two meerkats stayed very still. The shadow passed over them, and then it flew away. Nomi and her cousin were safe at last."],
  ["Nomi found an old stone door hidden in the sand. Cool air drifted out of the dark cave as she stepped inside. Strange words were painted along the walls. Some of the words looked almost the same, so Nomi read each one with great care. One wrong letter could lead her down the wrong path. At the end of the tunnel, a small spring bubbled out of the rocks, and beside it sat a box of shiny treasure."],
  ["Every day, Nomi's eyes grew sharper and quicker. Beyond the treasure cave, the dunes stretched farther than she had ever gone. New trails and new puzzles were waiting out there. In her backpack, Nomi carried a flask of water, a folded map, and a lucky feather from her grandmother. Before she climbed the first dune, she took one deep breath. The sand was warm, and a soft wind was blowing."],
  ["A dry wind carried strange whispers across the canyon floor. Nomi listened closely and watched for shapes in the shifting sand. Every faint sound seemed to hide a clue. Soon she noticed three sets of tracks that led toward a narrow crack in the canyon wall. She did not want to frighten whoever had made them, so she followed the tracks quietly, one paw at a time. The crack opened into a hidden room, and a small lantern was glowing inside."],
  ["The long trail ahead tested more than Nomi's quick eyes. It asked for patience, steady focus, and practice every single day. Nomi reminded herself that slow and steady progress usually wins in the end. Halfway along the trail, she found an old marker stone with a single meerkat pawprint carved into it. Travelers who had passed through long before her must have left it there. The worn stone pointed toward the next hidden path, and Nomi followed it with growing confidence."],
  ["The desert flats shimmered under the midday sun, and the heat pressed down on Nomi like a heavy blanket. Somewhere ahead, the hardest words and the fastest shadows were waiting for the sharpest-eyed meerkats. She took a slow breath and kept walking in spite of the heat. To stay focused, Nomi counted her steps in groups of one hundred. When she finally reached the cooler ground at the edge of the flats, she realized that concentration had carried her farther than strength alone could have."],
  ["Beside the old spring, carved words covered the rocks, and they were harder than anything Nomi had seen before. Only careful, patient eyes could read them without mistakes. She traced each faded letter slowly, determined not to miss a single detail. The carvings told the story of meerkats who had crossed this desert long ago. They had left quiet warnings about hidden sinkholes near the water, and Nomi was thankful that someone had thought to protect travelers they would never meet."],
  ["Heavy storm clouds gathered over the ridge, and the wind began to pick up speed. Nomi had trained for exactly this moment, developing quick eyes, steady focus, and a calm mind under pressure, so she refused to let the howling wind distract her. As distant thunder rumbled across the valley, she counted the seconds between each flash of lightning and its sound, a trick her grandmother had taught her for judging how far away a storm really was. By the time the first raindrops fell, she had already found shelter beneath a ledge of rock."],
  ["Inside the hidden vale, the challenges facing Nomi grew harder with every step. Her whole mob was depending on her courage, and she knew that hesitation could be costly. The vale felt cooler and darker than anywhere she had explored, and strange echoes bounced off walls that she could barely see. Instead of letting the unfamiliar sounds unsettle her, Nomi treated each echo as information, mapping the shape of the passage in her mind until she could move through it almost without sight."],
  ["Along the old caravan road, faded signs and shifting shadows challenged even experienced travelers who dared to cross it. Nomi studied every small mark with great care before she chose a path. Centuries of wind had worn some symbols nearly smooth, and only a patient observer could still understand their meaning. By piecing together clues from different markers, she slowly worked out the route that the caravans had once followed, an accomplishment that required as much patience and reasoning as it did sharp vision."],
  ["At the final horizon, Nomi faced the greatest test of her entire journey, one that demanded everything she had learned along the way. Every lesson, every instinct, and every hour of practice came together in that decisive moment. She closed her eyes deliberately, drew a steadying breath, and began. Years of quick glances, careful reading, and tireless repetition had led her here, and as the sun rose over the last towering dune, Nomi finally understood that the journey itself, rather than any destination, was what had prepared her."]
];

/* 5 comprehension questions per grade, each tied to that grade's story. */
export const GRADE_COMPREHENSION = [
  [ // Grade 1 · Red Rocks
    { q:"What is Nomi?", options:["A meerkat", "A bird", "A fish"], answer:"A meerkat" },
    { q:"How is the sun?", options:["Hot", "Cold", "Wet"], answer:"Hot" },
    { q:"What is dry?", options:["The pond", "The mud", "The grass"], answer:"The pond" },
    { q:"What does Gran say to look for?", options:["Mud", "Rocks", "Sticks"], answer:"Mud" },
    { q:"How is the water?", options:["Cold", "Hot", "Dry"], answer:"Cold" }
  ],
  [ // Grade 2 · The Hawk’s Shadow
    { q:"What did Nomi see on the sand?", options:["A big shadow", "A snake", "A ball"], answer:"A big shadow" },
    { q:"What did the shadow have?", options:["Two wide wings", "Four long legs", "A long tail"], answer:"Two wide wings" },
    { q:"What made the shadow?", options:["A hawk", "A cloud", "A rock"], answer:"A hawk" },
    { q:"Where did Nomi and her cousin hide?", options:["Under a thorn bush", "Behind a rock", "In a cave"], answer:"Under a thorn bush" },
    { q:"How did the meerkats stay?", options:["Very still", "Very loud", "Very fast"], answer:"Very still" }
  ],
  [ // Grade 3 · Buried Treasure
    { q:"What did Nomi find in the sand?", options:["An old stone door", "A deep river", "A pile of bones"], answer:"An old stone door" },
    { q:"What drifted out of the cave?", options:["Cool air", "Loud music", "Thick smoke"], answer:"Cool air" },
    { q:"What was painted on the walls?", options:["Strange words", "Pictures of hawks", "Nothing at all"], answer:"Strange words" },
    { q:"Why did Nomi read each word with care?", options:["Some words looked almost the same", "The words were very small", "It was too dark to see"], answer:"Some words looked almost the same" },
    { q:"What sat beside the spring?", options:["A box of shiny treasure", "A sleeping hawk", "A rusty key"], answer:"A box of shiny treasure" }
  ],
  [ // Grade 4 · The Far Dunes
    { q:"What happened to Nomi’s eyes every day?", options:["They grew sharper and quicker", "They grew tired and slow", "They stayed the same"], answer:"They grew sharper and quicker" },
    { q:"What was beyond the treasure cave?", options:["Dunes that stretched far away", "A frozen lake", "A busy town"], answer:"Dunes that stretched far away" },
    { q:"Which of these was in Nomi’s backpack?", options:["A folded map", "A pair of boots", "A jar of honey"], answer:"A folded map" },
    { q:"Who gave Nomi the lucky feather?", options:["Her grandmother", "Her cousin", "A trader"], answer:"Her grandmother" },
    { q:"What did Nomi do before she climbed the first dune?", options:["Took one deep breath", "Sat down to eat", "Called for help"], answer:"Took one deep breath" }
  ],
  [ // Grade 5 · Whispering Canyon
    { q:"What carried strange whispers across the canyon floor?", options:["A dry wind", "A running river", "A flock of birds"], answer:"A dry wind" },
    { q:"How many sets of tracks did Nomi notice?", options:["Three", "Five", "Two"], answer:"Three" },
    { q:"Where did the tracks lead?", options:["Toward a narrow crack in the canyon wall", "Down to a river", "Back to Nomi’s burrow"], answer:"Toward a narrow crack in the canyon wall" },
    { q:"Why did Nomi follow the tracks quietly?", options:["She did not want to frighten whoever made them", "She was very sleepy", "The tracks were hard to see"], answer:"She did not want to frighten whoever made them" },
    { q:"What was glowing inside the hidden room?", options:["A small lantern", "A bright gem", "A campfire"], answer:"A small lantern" }
  ],
  [ // Grade 6 · The Long Trail
    { q:"Besides quick eyes, what did the trail ask for?", options:["Patience and steady focus", "Speed and strength", "Luck and silence"], answer:"Patience and steady focus" },
    { q:"What did Nomi remind herself?", options:["Slow and steady progress usually wins", "The fastest meerkat always wins", "She should turn back now"], answer:"Slow and steady progress usually wins" },
    { q:"What was carved into the marker stone?", options:["A single meerkat pawprint", "A map of the desert", "A row of stars"], answer:"A single meerkat pawprint" },
    { q:"Who most likely left the stone there?", options:["Travelers who passed long before her", "Her grandmother", "A passing hawk"], answer:"Travelers who passed long before her" },
    { q:"What did the worn stone point toward?", options:["The next hidden path", "A hidden spring", "The way home"], answer:"The next hidden path" }
  ],
  [ // Grade 7 · Sunbaked Flats
    { q:"What did the heat feel like to Nomi?", options:["A heavy blanket", "A cold wind", "A gentle breeze"], answer:"A heavy blanket" },
    { q:"What was waiting ahead for the sharpest-eyed meerkats?", options:["The hardest words and fastest shadows", "A hidden river", "A crowd of friends"], answer:"The hardest words and fastest shadows" },
    { q:"How did Nomi stay focused?", options:["She counted her steps in groups of one hundred", "She hummed a quiet song", "She closed her eyes"], answer:"She counted her steps in groups of one hundred" },
    { q:"Where did the cooler ground begin?", options:["At the edge of the flats", "At the top of a dune", "Inside a cave"], answer:"At the edge of the flats" },
    { q:"What did Nomi realize at the end?", options:["Concentration carried her farther than strength alone", "She should have rested at the start", "The desert was smaller than it looked"], answer:"Concentration carried her farther than strength alone" }
  ],
  [ // Grade 8 · The Ancient Spring
    { q:"Where were the carved words found?", options:["On the rocks beside the old spring", "Inside a treasure chest", "On a distant mountain"], answer:"On the rocks beside the old spring" },
    { q:"What kind of eyes could read them without mistakes?", options:["Careful, patient eyes", "Fast, eager eyes", "Tired, sleepy eyes"], answer:"Careful, patient eyes" },
    { q:"How did Nomi read the faded letters?", options:["She traced each one slowly", "She read them out loud", "She skipped the hard ones"], answer:"She traced each one slowly" },
    { q:"What did the carvings warn about?", options:["Hidden sinkholes near the water", "Fierce hawks overhead", "A coming storm"], answer:"Hidden sinkholes near the water" },
    { q:"Why was Nomi thankful?", options:["Someone had protected travelers they would never meet", "She had found a shortcut", "The carvings pointed to treasure"], answer:"Someone had protected travelers they would never meet" }
  ],
  [ // Grade 9 · The Gathering Storm
    { q:"What gathered over the ridge?", options:["Heavy storm clouds", "A swarm of insects", "A cloud of dust"], answer:"Heavy storm clouds" },
    { q:"Why did Nomi refuse to let the wind distract her?", options:["She had trained for exactly this moment", "She was too tired to move", "She could not hear it"], answer:"She had trained for exactly this moment" },
    { q:"What did Nomi count?", options:["The seconds between lightning and thunder", "The raindrops on the rock", "The steps to the ridge"], answer:"The seconds between lightning and thunder" },
    { q:"Who taught Nomi this trick?", options:["Her grandmother", "A trailblazer", "Her cousin"], answer:"Her grandmother" },
    { q:"Where did Nomi find shelter?", options:["Beneath a ledge of rock", "Inside a hollow tree", "In a deep cave"], answer:"Beneath a ledge of rock" }
  ],
  [ // Grade 10 · The Hidden Vale
    { q:"What happened to the challenges as Nomi went deeper?", options:["They grew harder with every step", "They faded away", "They stayed exactly the same"], answer:"They grew harder with every step" },
    { q:"Who was depending on Nomi’s courage?", options:["Her whole mob", "A lost traveler", "Her grandmother alone"], answer:"Her whole mob" },
    { q:"How did the vale feel compared with other places she had explored?", options:["Cooler and darker", "Hotter and brighter", "Noisier and wetter"], answer:"Cooler and darker" },
    { q:"What bounced off the walls she could barely see?", options:["Strange echoes", "Beams of light", "Flying insects"], answer:"Strange echoes" },
    { q:"How did Nomi respond to the unfamiliar sounds?", options:["She treated each echo as information", "She covered her ears", "She turned back at once"], answer:"She treated each echo as information" }
  ],
  [ // Grade 11 · The Caravan Road
    { q:"What challenged even experienced travelers on the caravan road?", options:["Faded signs and shifting shadows", "Fierce desert storms", "A lack of fresh water"], answer:"Faded signs and shifting shadows" },
    { q:"What had worn some of the symbols nearly smooth?", options:["Centuries of wind", "The paws of travelers", "Heavy rain"], answer:"Centuries of wind" },
    { q:"Who could still understand the symbols?", options:["A patient observer", "A fast traveler", "A skilled guard"], answer:"A patient observer" },
    { q:"How did Nomi work out the caravans’ route?", options:["By piecing together clues from different markers", "By asking other travelers", "By following fresh tracks"], answer:"By piecing together clues from different markers" },
    { q:"Besides sharp vision, what did her achievement require?", options:["Patience and reasoning", "Speed and luck", "Strength and courage"], answer:"Patience and reasoning" }
  ],
  [ // Grade 12 · The Final Horizon
    { q:"What did Nomi face at the final horizon?", options:["The greatest test of her journey", "A familiar friend", "An empty desert"], answer:"The greatest test of her journey" },
    { q:"What came together in that decisive moment?", options:["Every lesson, instinct and hour of practice", "Her whole mob and her friends", "Wind, rain and thunder"], answer:"Every lesson, instinct and hour of practice" },
    { q:"What did Nomi do before she began?", options:["Closed her eyes and drew a steadying breath", "Called out to her grandmother", "Studied a folded map"], answer:"Closed her eyes and drew a steadying breath" },
    { q:"What had led her to this moment?", options:["Years of glances, careful reading and repetition", "A sudden stroke of luck", "A secret shortcut"], answer:"Years of glances, careful reading and repetition" },
    { q:"What did Nomi finally understand?", options:["The journey itself had prepared her", "The destination mattered most", "She should have started earlier"], answer:"The journey itself had prepared her" }
  ]
];
