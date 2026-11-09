/* Word and picture lists used by the memory and scanning games. */

export const GRADE_WORDS = [
  ['sun','dig','paw','mud','cup','wet','dry','hop','sip','pot'],
  ['dust','wing','rock','sand','cave','hill','wind','palm','glow','path','claw','nest'],
  ['shadow','desert','canyon','spring','hidden','pebble','cactus','burrow','branch','travel'],
  ['journey','wander','shelter','distant','steady','signal','gather','narrow','whisper','trail'],
  ['boulder','ravine','thicket','plateau','horizon','compass','drought','scatter','mirage','glimpse'],
  ['expedition','survival','navigate','terrain','erosion','migration','predator','wildlife','foothill','endurance'],
  ['wilderness','atmosphere','vegetation','landscape','formation','geography','elevation','sediment','ecosystem','tributary'],
  ['resilient','adaptation','sustained','perseverance','environment','temperature','excavation','conservation','hydration','sustenance'],
  ['civilization','geological','meteorology','sustainable','phenomenon','navigation','vulnerable','archaeology','biodiversity','topography'],
  ['unprecedented','interconnected','extraordinary','philosophical','environmental','geographical','uninhabited','indispensable','consequence','independence'],
  ['irreplaceable','overwhelming','unsustainable','misrepresented','uncompromising','comprehensive','inevitable','conscientious','meticulous','relentless'],
  ['counterintuitive','interdependence','incontrovertible','philosophically','extraordinarily','indistinguishable','inconsequential','simultaneously','unquestionably','encyclopedia']
];

export const MEMORY_ICON_POOL = ['💧','🌵','🦎','🪨','🌱','🐾','🦅','🌤️','🍃','🐍','🦂','🕳️','⭐','🏺','🔥','💎'];

/* common sight words, used by Scanning's "Sight Words" element */
const SIGHT_WORDS = ['the','and','a','to','said','you','he','it','was','for','on','are','is','at','this','have','from','with','they','all','were','when','we','can'];

/* the 8 "elements" a child can pick for Scanning (Tracking / Symbol Search) */
export const ELEMENT_META = [
  { key:'numbers',       label:'Numbers' },
  { key:'lower',         label:'Small Letters' },
  { key:'upper',         label:'Capital Letters' },
  { key:'beginnerWords', label:'Beginner Words' },
  { key:'interWords',    label:'Intermediate Words' },
  { key:'advWords',      label:'Advanced Words' },
  { key:'sightWords',    label:'Sight Words' },
  { key:'pictures',      label:'Pictures' }
];

export function elementPool(key){
  switch(key){
    case 'numbers':       return { kind:'char',  items:'0123456789'.split('') };
    case 'lower':         return { kind:'char',  items:'abcdefghijklmnopqrstuvwxyz'.split('') };
    case 'upper':         return { kind:'char',  items:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') };
    case 'beginnerWords': return { kind:'word',  items:[...new Set([].concat(GRADE_WORDS[0], GRADE_WORDS[1], GRADE_WORDS[2]))] };
    case 'interWords':    return { kind:'word',  items:[...new Set([].concat(GRADE_WORDS[4], GRADE_WORDS[5], GRADE_WORDS[6]))] };
    case 'advWords':      return { kind:'word',  items:[...new Set([].concat(GRADE_WORDS[9], GRADE_WORDS[10], GRADE_WORDS[11]))] };
    case 'sightWords':    return { kind:'word',  items: SIGHT_WORDS };
    case 'pictures':      return { kind:'emoji', items: MEMORY_ICON_POOL };
    default:              return { kind:'char',  items:['?'] };
  }
}
