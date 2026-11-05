import type { Block, Ratings } from './types';

export const ratingKey = (block: Block, index: number) => `${block.id}:${index}`;

// Формула лендинга: «Да» даёт 1, «Частично» даёт 0,5, «Нет» даёт 0.
// Балл блока = (Да + 0,5 × Частично) / число пунктов блока.
export function blockStats(block: Block, ratings: Ratings) {
  let yes = 0, part = 0, no = 0, unset = 0;
  block.items.forEach((_, i) => {
    const v = ratings[ratingKey(block, i)];
    if (v === 1) yes++;
    else if (v === 0.5) part++;
    else if (v === 0) no++;
    else unset++;
  });
  const total = block.items.length;
  return { yes, part, no, unset, total, score: (yes + part * 0.5) / total };
}

// Общий процент = сумма баллов, делённая на число пунктов, по всем блокам.
export function totalStats(blocks: Block[], ratings: Ratings) {
  let yes = 0, part = 0, no = 0, unset = 0, total = 0;
  blocks.forEach((b) => {
    const s = blockStats(b, ratings);
    yes += s.yes; part += s.part; no += s.no; unset += s.unset; total += s.total;
  });
  return { yes, part, no, unset, total, score: (yes + part * 0.5) / total };
}
