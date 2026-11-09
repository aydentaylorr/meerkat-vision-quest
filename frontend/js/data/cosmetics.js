/* Rewards Nomi can wear and what they cost. */

export const COSMETICS = [
  { id:'hat_explorer', slot:'hat',  em:'🧢', name:'Explorer Cap' },
  { id:'hat_straw',    slot:'hat',  em:'👒', name:'Sun Hat' },
  { id:'hat_crown',    slot:'hat',  em:'👑', name:'Dune Crown' },
  { id:'it_scarf',     slot:'item', em:'🎒', name:'Trail Pack' },
  { id:'it_pack',      slot:'item', em:'🧳', name:'Explorer Case' },
  { id:'it_lamp',      slot:'item', em:'🏮', name:'Cave Lantern' }
];

export const cosmetic = id => COSMETICS.find(c => c.id === id);
export const SHOP_PRICE = { hat_straw:30, it_pack:40, it_lamp:60 };
