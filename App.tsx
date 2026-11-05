import { useState } from 'react';
import { Platform, Pressable, StatusBar as RNStatusBar, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AboutScreen } from './src/screens/AboutScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { c } from './src/theme';

type Tab = 'home' | 'about';
const TABS: [Tab, string][] = [['home', 'Главная'], ['about', 'О приложении']];

// Два экрана-таба сверху, без библиотек навигации.
// Оба экрана остаются в памяти: при возврате на «Главную» список там, где вы его оставили.
export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  return (
    <View style={s.root}>
      <View style={s.tabs}>
        {TABS.map(([id, label]) => (
          <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: tab === id }} onPress={() => setTab(id)}
            style={[s.tab, tab === id && s.tabOn]}>
            <Text style={[s.tabText, tab === id && s.tabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[s.screen, tab !== 'home' && s.hidden]}><HomeScreen /></View>
      <View style={[s.screen, tab !== 'about' && s.hidden]}><AboutScreen /></View>
      <StatusBar style="dark" />
    </View>
  );
}

const top = Platform.OS === 'ios' ? 56 : (RNStatusBar.currentHeight ?? 24) + 12;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg, paddingTop: top },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
  tabOn: { backgroundColor: c.ink, borderColor: c.ink },
  tabText: { fontSize: 15, fontWeight: '600', color: c.ink2 },
  tabTextOn: { color: '#fff' },
  screen: { flex: 1 },
  hidden: { display: 'none' },
});
