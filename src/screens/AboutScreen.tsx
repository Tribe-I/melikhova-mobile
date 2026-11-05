import { StyleSheet, Text, View } from 'react-native';
import { c } from '../theme';

// Хеш коммита приходит из сборки через EXPO_PUBLIC_COMMIT. Без неё показываем dev.
const COMMIT = process.env.EXPO_PUBLIC_COMMIT || 'dev';

export function AboutScreen() {
  return (
    <View style={s.page}>
      <Text style={s.h1}>Чек-лист диджитал продакта</Text>
      <Text style={s.text}>
        Интерактивная самооценка DPO по требованиям модели Tiny Teams: отмечаете пункты, и сводка показывает профиль по семи блокам.
        Оценки хранятся только на этом телефоне.
      </Text>
      <View style={s.panel}>
        <Text style={s.cap}>Коммит</Text>
        <Text style={s.hash} selectable>{COMMIT}</Text>
      </View>
      <Text style={s.author}>Светлана Мелихова</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.bg, padding: 16, paddingTop: 8, gap: 16 },
  h1: { fontSize: 28, fontWeight: '700', color: c.ink },
  text: { fontSize: 15, lineHeight: 22, color: c.ink2 },
  panel: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 16, gap: 6 },
  cap: { fontSize: 11, fontWeight: '600', letterSpacing: 0.9, textTransform: 'uppercase', color: c.ink3 },
  hash: { fontSize: 32, fontWeight: '700', color: c.ink, fontVariant: ['tabular-nums'] },
  author: { fontSize: 14, fontWeight: '700', color: c.ink },
});
