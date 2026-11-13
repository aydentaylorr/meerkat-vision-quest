/* Nomi’s treasure chest: the hats and gear the player owns or can buy. */
import { Pressable, View } from 'react-native';

import { useGame, useTheme } from '../GameContext';
import { COSMETICS, SHOP_PRICE } from '../shared';
import { Chip, Muted, Nomi, SectionHead, Txt } from '../ui';

export function RewardsSheet({ onClose }) {
  const { game, update, toast } = useGame();
  const { c, rem } = useTheme();

  const equip = (slot, id) => update(d => { d.equipped[slot] = id; });
  const buy = item => {
    if (game.gems < SHOP_PRICE[item.id]) { toast('Not enough gems yet!'); return; }
    update(d => { d.gems -= SHOP_PRICE[item.id]; d.owned.push(item.id); d.equipped[item.slot] = item.id; });
    toast('Unlocked ' + item.name + '!');
  };

  const shelf = slot => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
      {COSMETICS.filter(x => x.slot === slot).map(item => {
        const owned = game.owned.includes(item.id), on = game.equipped[slot] === item.id, price = SHOP_PRICE[item.id];
        const status = owned ? (on ? 'wearing' : 'tap to wear') : price ? price + ' 💎' : 'locked';
        return (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.name}, ${status}`}
            onPress={() => (owned ? equip(slot, item.id) : price ? buy(item) : toast('Unlocked by finishing an adventure'))}
            style={{ width: 102, flexGrow: 1, maxWidth: 150, alignItems: 'center', borderRadius: 18, paddingVertical: rem(0.6), paddingHorizontal: 6, marginBottom: 4,
              backgroundColor: on ? c.rightBg : c.cream2, boxShadow: `0 4px 0 ${on ? c.greenD : c.line}`, opacity: owned ? 1 : 0.5 }}>
            <Txt allowFontScaling={false} style={{ fontSize: 28, lineHeight: 38 }}>{item.em}</Txt>
            <Txt weight="bold" style={{ fontSize: rem(0.75), lineHeight: rem(1.05), textAlign: 'center' }}>{item.name}</Txt>
            <Muted size={0.7}>{status}</Muted>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <>
      <View style={{ flexDirection: 'row', gap: rem(1), alignItems: 'center' }}>
        <Nomi width={96} />
        <View style={{ flex: 1 }}>
          <SectionHead style={{ marginTop: 0 }}>Nomi’s treasure chest</SectionHead>
          <Muted size={0.9}>💎 {game.gems} gems · 🔥 {game.streak.count} day streak · 🧊 {game.streak.freezes} freezes</Muted>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: rem(0.5) }}>
            <Chip label="No hat" onPress={() => equip('hat', null)} />
            <Chip label="No gear" onPress={() => equip('item', null)} />
            <Chip label="Done" onPress={onClose} />
          </View>
        </View>
      </View>
      <SectionHead style={{ marginTop: rem(1) }}>Hats</SectionHead>{shelf('hat')}
      <SectionHead style={{ marginTop: rem(1) }}>Gear</SectionHead>{shelf('item')}
      <Muted size={0.9} style={{ marginTop: rem(1) }}>Streak freezes protect one missed day, so a single busy evening doesn’t wipe out weeks of practice.</Muted>
    </>
  );
}
