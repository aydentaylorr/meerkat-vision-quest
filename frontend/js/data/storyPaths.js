/* Choose-your-path stories for the Story Paths game.

   Each story is a small tree of pages. A page has its text, one question about that text, and
   the choices that lead on to other pages. A page with no choices is an ending.
   The stories are written ahead of time and reviewed before they ship, so every child who takes
   the same path reads the same words and their reading can be compared.
   `grades` is the first and last grade a story is offered to. */

export const STORY_PATHS = [
  { id:'lost-cup', title:'The Lost Cup', grades:[1, 3], start:'start', pages:{
    start: {
      text:"Nomi has a red cup. She loves her cup. But today the cup is gone! Nomi looks up. She looks down. Where can it be? She sees paw prints in the sand. She sees a bird in the sky.",
      q:{ q:"What colour is Nomi’s cup?", options:["Red", "Blue", "Green"], answer:"Red" },
      choices:[{ label:"Follow the paw prints", to:'prints' }, { label:"Follow the bird", to:'bird' }] },
    prints: {
      text:"Nomi follows the paw prints. They go up a hill. They stop at a small hole. Nomi hears a sound. Sip, sip, sip! Who is in the hole?",
      q:{ q:"Where do the paw prints stop?", options:["At a small hole", "At the pond", "At a tree"], answer:"At a small hole" },
      choices:[{ label:"Peek into the hole", to:'hole' }, { label:"Call out hello", to:'hello' }] },
    bird: {
      text:"Nomi runs after the bird. The bird lands on a tall rock. It has something shiny in its nest. Is it the cup? The rock is very tall.",
      q:{ q:"Where does the bird land?", options:["On a tall rock", "On the sand", "On a bush"], answer:"On a tall rock" },
      choices:[{ label:"Climb the rock", to:'climb' }, { label:"Ask the bird nicely", to:'ask' }] },
    hole: {
      text:"Nomi peeks in. It is her little cousin Pip! Pip has the red cup. “I was so thirsty,” says Pip. Nomi smiles. “We can share,” she says. They sip cold water together.",
      q:{ q:"Who has the cup?", options:["Pip", "Gran", "The bird"], answer:"Pip" } },
    hello: {
      text:"“Hello!” calls Nomi. Out pops Gran with the red cup. “I washed it for you,” says Gran. The cup is clean and bright. Nomi gives Gran a big hug.",
      q:{ q:"What did Gran do to the cup?", options:["Washed it", "Broke it", "Hid it"], answer:"Washed it" } },
    climb: {
      text:"Nomi climbs up, up, up. In the nest is a shiny stone, not a cup. The bird points its wing at the pond. There is the red cup, by the water! Nomi left it there.",
      q:{ q:"What is in the nest?", options:["A shiny stone", "The red cup", "An egg"], answer:"A shiny stone" } },
    ask: {
      text:"“Bird, have you seen my cup?” asks Nomi. The bird nods and flies to the pond. Nomi runs after it. The red cup sits by the water. “Thank you, bird!” says Nomi.",
      q:{ q:"Where is the cup?", options:["By the pond", "In the nest", "In a hole"], answer:"By the pond" } }
  } },

  { id:'cave-map', title:'The Map in the Pot', grades:[4, 7], start:'start', pages:{
    start: {
      text:"Nomi found a scrap of old map tucked inside a clay pot. It showed a winding trail, a cave shaped like a tooth, and a small star drawn beside a spring. The edges were torn, so half the trail was missing. Her cousin Pip wanted to leave at once. Gran said a wise meerkat prepares first.",
      q:{ q:"What was the star drawn beside?", options:["A spring", "A cave", "A clay pot"], answer:"A spring" },
      choices:[{ label:"Set off straight away with Pip", to:'rush' }, { label:"Pack supplies with Gran first", to:'pack' }] },
    rush: {
      text:"Nomi and Pip hurried across the dunes without stopping. By midday the sun was fierce and their mouths were dry. Then Pip spotted the tooth-shaped cave ahead. Cool air drifted from its entrance, but so did a low rumbling sound. Beside the cave, a narrow path led up toward a ridge.",
      q:{ q:"What came out of the cave besides cool air?", options:["A rumbling sound", "A bright light", "A strong smell"], answer:"A rumbling sound" },
      choices:[{ label:"Step into the cave", to:'stream' }, { label:"Take the path up the ridge", to:'ridge' }] },
    pack: {
      text:"Gran helped Nomi fill a flask with water and wrap dried berries in a leaf. She also handed over a ball of string. “Tie it at the cave mouth,” Gran said, “and you will always find your way out.” Nomi set off at dawn, when the sand was still cool beneath her paws.",
      q:{ q:"Why did Gran give Nomi string?", options:["To find the way out", "To tie up the flask", "To mend the map"], answer:"To find the way out" },
      choices:[{ label:"Go to the cave", to:'string' }, { label:"Look for the spring first", to:'spring' }] },
    stream: {
      text:"Inside, the rumbling grew louder. Nomi’s heart thumped. Then she laughed: it was only water, rushing through an underground stream! The two cousins drank until they were full. On the wall above the stream, someone had painted a star. They had found the map’s secret after all.",
      q:{ q:"What was making the rumbling sound?", options:["An underground stream", "A sleeping animal", "Falling rocks"], answer:"An underground stream" } },
    ridge: {
      text:"From the top of the ridge, Nomi could see the whole valley. Far below, a patch of green glittered in the sunlight. It was the spring from the map, and it was much closer than the cave. The cousins slid down the sand, cheering, and splashed into the cool water.",
      q:{ q:"What did Nomi see from the ridge?", options:["A patch of green", "A second cave", "Gran waving"], answer:"A patch of green" } },
    string: {
      text:"Nomi tied the string to a rock and stepped into the dark. The tunnels twisted left and right, but the string trailed safely behind her. Deep inside she found a wall covered with painted stars. She did not take anything. Instead, she followed the string back out to tell Gran.",
      q:{ q:"How did Nomi find her way back out?", options:["She followed the string", "She followed Pip", "She used the map"], answer:"She followed the string" } },
    spring: {
      text:"The spring was hidden behind a ring of thorn bushes. Nomi squeezed through and found clear water bubbling up between the stones. Under one flat stone lay the missing half of the map. Now the trail was complete, and tomorrow’s adventure was already waiting.",
      q:{ q:"What lay under the flat stone?", options:["The missing half of the map", "A ball of string", "A clay pot"], answer:"The missing half of the map" } }
  } },

  { id:'sandstorm', title:'The Night of the Sandstorm', grades:[8, 12], start:'start', pages:{
    start: {
      text:"By late afternoon the horizon had turned the colour of rust, and the wind carried a hiss that Nomi had learned to distrust. A sandstorm was gathering beyond the ridge. The mob’s youngest pups were still foraging near the dry riverbed, a long run from the burrow. Nomi could sprint there herself and guide them home, or she could climb the lookout rock and sound the alarm call, trusting that the pups would remember their training.",
      q:{ q:"What warned Nomi that a storm was coming?", options:["The rust-coloured horizon and the hissing wind", "A call from the lookout rock", "Dark clouds and thunder"], answer:"The rust-coloured horizon and the hissing wind" },
      choices:[{ label:"Run to the riverbed", to:'run' }, { label:"Climb the lookout and call", to:'call' }] },
    run: {
      text:"Nomi ran until her lungs burned. She reached the riverbed just as the first curtain of sand swept across it, and found three pups huddled behind a boulder. The burrow was too far to reach before the storm closed in. Nearby, however, an abandoned fox den yawned in the bank, and further along stood a thicket of thorn bushes that might break the wind.",
      q:{ q:"Why could they not return to the burrow?", options:["It was too far to reach in time", "Its entrance was blocked", "The pups refused to move"], answer:"It was too far to reach in time" },
      choices:[{ label:"Shelter in the old fox den", to:'den' }, { label:"Shelter in the thorn thicket", to:'thicket' }] },
    call: {
      text:"From the top of the lookout rock, Nomi gave the sharp, rising bark that meant danger. Far away, three small heads popped up. Two pups raced for the burrow immediately, exactly as they had practised. The third, the smallest, froze where it stood. The wall of sand was now only minutes away.",
      q:{ q:"How did the smallest pup react to the alarm?", options:["It froze where it stood", "It raced for the burrow", "It hid behind a boulder"], answer:"It froze where it stood" },
      choices:[{ label:"Call again with a different call", to:'again' }, { label:"Go and fetch the pup", to:'fetch' }] },
    den: {
      text:"The den was dry, deep, and mercifully empty. Nomi pushed the pups to the back and blocked the entrance with her own body. All night the storm roared overhead, but not a grain reached them. At dawn they emerged into a silent, rearranged desert and walked home to a mob that had not slept.",
      q:{ q:"How did Nomi keep the sand out of the den?", options:["She blocked the entrance with her body", "She piled up stones", "She dug a second tunnel"], answer:"She blocked the entrance with her body" } },
    thicket: {
      text:"The thorn bushes slowed the wind but could not stop it. Nomi gathered the pups beneath her and turned her back to the storm, and together they waited, eyes shut tight. It was a long and uncomfortable night. Still, when the wind finally dropped, all four of them shook off the sand and trotted home, tired but unharmed.",
      q:{ q:"What did the thorn bushes do to the wind?", options:["Slowed it but could not stop it", "Stopped it completely", "Made it stronger"], answer:"Slowed it but could not stop it" } },
    again: {
      text:"Nomi barked again, changing to the call that meant “come to me”. The little pup’s ears twitched. Recognising the sound, it turned and bolted toward the burrow, tumbling through the entrance moments before the storm struck. That night, Gran remarked that a calm voice often travels further than fast legs.",
      q:{ q:"Which call made the pup move?", options:["The call for “come to me”", "The danger call, repeated", "A whistle"], answer:"The call for “come to me”" } },
    fetch: {
      text:"Nomi leapt down and raced across the open ground. She seized the pup by the scruff, as Gran had once carried her, and turned for home with sand already stinging her eyes. They reached the burrow together, breathless and coated in dust. The pup did not leave her side for a week.",
      q:{ q:"How did Nomi carry the pup?", options:["By the scruff", "On her back", "In her arms"], answer:"By the scruff" } }
  } }
];
