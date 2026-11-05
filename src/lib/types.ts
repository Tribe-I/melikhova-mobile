export type Item = { t: string; ref?: string };
export type Block = { id: string; title: string; short: string; desc: string; items: Item[] };
// Оценка пункта: 1 = «Да», 0.5 = «Частично», 0 = «Нет». Нет записи = без оценки.
export type Rating = 0 | 0.5 | 1;
export type Ratings = Record<string, Rating>;
export type Filter = 'all' | 'open' | 'unset';
