import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import checklist from '../data/checklist.json';
import { Radar } from '../components/Radar';
import { Ring } from '../components/Ring';
import { blockStats, ratingKey, totalStats } from '../lib/score';
import { loadRatings, saveRatings } from '../lib/storage';
import type { Block, Filter, Rating, Ratings } from '../lib/types';
import { c } from '../theme';

const BLOCKS = checklist as Block[];
const LABELS: [Rating, string][] = [[0, 'Нет'], [0.5, 'Частично'], [1, 'Да']];
const FILTERS: [Filter, string][] = [['all', 'Все пункты'], ['open', 'Не выполнено'], ['unset', 'Без оценки']];
const pct = (x: number) => Math.round(x * 100);

function Bar({ yes, part, total }: { yes: number; part: number; total: number }) {
  return (
    <View style={s.bar}>
      <View style={{ width: `${(yes / total) * 100}%`, backgroundColor: c.yes }} />
      <View style={{ width: `${(part / total) * 100}%`, backgroundColor: c.part }} />
    </View>
  );
}

export function HomeScreen() {
  const [ratings, setRatings] = useState<Ratings>({});
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [confirming, setConfirming] = useState(false);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsets = useRef<Record<string, number>>({});

  useEffect(() => {
    loadRatings().then((r) => { setRatings(r); setLoaded(true); });
  }, []);

  // Оценки сохраняются при каждом изменении, в том числе после сброса.
  const update = (next: Ratings) => { setRatings(next); saveRatings(next); };

  const rate = (b: Block, i: number, v: Rating) => {
    const k = ratingKey(b, i);
    const next = { ...ratings };
    if (next[k] === v) delete next[k]; else next[k] = v;
    update(next);
  };

  const total = totalStats(BLOCKS, ratings);
  const rated = BLOCKS.filter((b) => blockStats(b, ratings).unset < b.items.length);
  const weak = [...rated].sort((a, b) => blockStats(a, ratings).score - blockStats(b, ratings).score)[0];
  const any = Object.keys(ratings).length > 0;

  return (
    <ScrollView ref={scroller} style={s.page} contentContainerStyle={s.content}>
      <Text style={s.h1}>Чек-лист диджитал продакта</Text>
      <Text style={s.lead}>
        Чему должен соответствовать DPO в новой модели. Отметьте каждый пункт, и сводка покажет профиль по семи блокам.
        Числовые пороги — ориентиры для калибровки на пилоте. Оценки хранятся только на вашем телефоне и никуда не отправляются.
      </Text>
      <View style={s.scale}>
        {[['Да — 1 балл', c.yes], ['Частично — 0,5', c.part], ['Нет — 0', c.no]].map(([t, col]) => (
          <View key={t} style={s.chip}><View style={[s.dot, { backgroundColor: col }]} /><Text style={s.chipText}>{t}</Text></View>
        ))}
      </View>

      <View style={s.panel}>
        <View style={s.row}>
          <Ring score={total.score} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.cap}>Соответствие</Text>
            <Text style={s.pct}>{pct(total.score)}%</Text>
            <Text style={s.counts}>Да: {total.yes} · Частично: {total.part} · Нет: {total.no}</Text>
            <Text style={s.counts}>Без оценки: {total.unset} из {total.total}</Text>
          </View>
        </View>
      </View>

      <View style={s.panel}>
        <Text style={s.cap}>Профиль по блокам</Text>
        <Radar blocks={BLOCKS} ratings={ratings} />
        {!any && <Text style={s.hint}>Профиль появится, когда вы отметите пункты</Text>}
      </View>

      <View style={s.panel}>
        <Text style={[s.cap, { marginBottom: 12 }]}>Прогресс блоков</Text>
        {BLOCKS.map((b) => {
          const st = blockStats(b, ratings);
          return (
            <Pressable key={b.id} style={s.bBar} onPress={() => scroller.current?.scrollTo({ y: offsets.current[b.id] ?? 0, animated: true })}>
              <View style={s.rowBetween}><Text style={s.bBarTitle}>{b.title}</Text><Text style={s.bBarPct}>{pct(st.score)}%</Text></View>
              <Bar yes={st.yes} part={st.part} total={st.total} />
            </Pressable>
          );
        })}
        <Text style={s.weak}>
          {weak && blockStats(weak, ratings).score < 1
            ? `Зона роста: ${weak.title} — ${pct(blockStats(weak, ratings).score)}%`
            : 'Зона роста появится после первых оценок'}
        </Text>
      </View>

      <View style={s.toolbar}>
        <View style={s.seg}>
          {FILTERS.map(([f, label]) => (
            <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: filter === f }} onPress={() => setFilter(f)}
              style={[s.segBtn, filter === f && s.segBtnOn]}>
              <Text style={[s.segText, filter === f && s.segTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {confirming ? (
          <View style={s.confirm}>
            <Text style={s.counts}>Сбросить все оценки?</Text>
            <Pressable style={[s.ghost, { borderColor: c.no }]} onPress={() => { update({}); setConfirming(false); }}>
              <Text style={[s.ghostText, { color: c.no }]}>Сбросить</Text>
            </Pressable>
            <Pressable style={s.ghost} onPress={() => setConfirming(false)}><Text style={s.ghostText}>Отмена</Text></Pressable>
          </View>
        ) : (
          <Pressable style={s.ghost} onPress={() => setConfirming(true)}><Text style={s.ghostText}>Сбросить оценки</Text></Pressable>
        )}
      </View>

      {loaded && BLOCKS.map((b, bi) => {
        const st = blockStats(b, ratings);
        const rows = b.items.map((it, i) => ({ it, i, v: ratings[ratingKey(b, i)] }))
          .filter(({ v }) => (filter === 'open' ? v !== 1 : filter === 'unset' ? v === undefined : true));
        return (
          <View key={b.id} style={s.block} onLayout={(e) => { offsets.current[b.id] = e.nativeEvent.layout.y; }}>
            <View style={s.bHead}>
              <View style={s.bNum}><Text style={s.bNumText}>{bi + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.h2}>{b.title}</Text>
                <Text style={s.desc}>{b.desc} · {b.items.length} пунктов</Text>
              </View>
              <Text style={s.bScore}>{pct(st.score)}%</Text>
            </View>
            {rows.length === 0 && <Text style={s.empty}>В этом блоке нет пунктов под фильтр</Text>}
            {rows.map(({ it, i, v }) => (
              <View key={i} style={s.item}>
                <Text style={s.itemText}>{it.t}{it.ref ? <Text style={s.ref}>  {it.ref}</Text> : null}</Text>
                <View style={s.tri}>
                  {LABELS.map(([val, label]) => (
                    <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: v === val }} onPress={() => rate(b, i, val)}
                      style={[s.triBtn, v === val && { backgroundColor: val === 1 ? c.yes : val === 0.5 ? c.part : c.no, borderColor: 'transparent' }]}>
                      <Text style={[s.triText, v === val && { color: '#fff' }]}>{label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );
      })}

      <View style={s.footer}>
        <Text style={s.author}>Светлана Мелихова</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.bg },
  content: { padding: 16, paddingTop: 8, paddingBottom: 48, gap: 14 },
  h1: { fontSize: 28, fontWeight: '700', color: c.ink },
  lead: { fontSize: 14, lineHeight: 21, color: c.ink2 },
  scale: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontSize: 13, color: c.ink2 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  panel: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  cap: { fontSize: 11, fontWeight: '600', letterSpacing: 0.9, textTransform: 'uppercase', color: c.ink3 },
  pct: { fontSize: 34, fontWeight: '700', color: c.ink },
  counts: { fontSize: 13, color: c.ink2 },
  hint: { fontSize: 13, color: c.ink3, textAlign: 'center' },
  bBar: { paddingVertical: 6, gap: 4 },
  bBarTitle: { fontSize: 13, color: c.ink, flex: 1 },
  bBarPct: { fontSize: 13, fontWeight: '700', color: c.ink },
  bar: { height: 6, borderRadius: 3, backgroundColor: c.surface2, flexDirection: 'row', overflow: 'hidden' },
  weak: { fontSize: 13, color: c.ink2, marginTop: 8 },
  toolbar: { gap: 10 },
  seg: { flexDirection: 'row', backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, borderRadius: 10, padding: 3, alignSelf: 'flex-start' },
  segBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 7 },
  segBtnOn: { backgroundColor: c.surface },
  segText: { fontSize: 13, fontWeight: '500', color: c.ink2 },
  segTextOn: { color: c.ink, fontWeight: '600' },
  ghost: { borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start' },
  ghostText: { fontSize: 13, fontWeight: '600', color: c.ink },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  block: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 16, gap: 10 },
  bHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.brand, alignItems: 'center', justifyContent: 'center' },
  bNumText: { color: '#fff', fontWeight: '700' },
  h2: { fontSize: 16, fontWeight: '700', color: c.ink },
  desc: { fontSize: 12, color: c.ink3 },
  bScore: { fontSize: 16, fontWeight: '700', color: c.ink },
  empty: { fontSize: 13, color: c.ink3 },
  item: { borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10, gap: 8 },
  itemText: { fontSize: 14, lineHeight: 20, color: c.ink },
  ref: { fontSize: 12, color: c.ink3 },
  tri: { flexDirection: 'row', gap: 6 },
  triBtn: { flex: 1, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface2, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  triText: { fontSize: 13, fontWeight: '600', color: c.ink2 },
  footer: { alignItems: 'center', marginTop: 8 },
  author: { fontSize: 14, fontWeight: '700', color: c.ink },
});
