import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { c } from '../theme';
import { blockStats } from '../lib/score';
import type { Block, Ratings } from '../lib/types';

// Радар по блокам, как на лендинге: сетка, оси, подписи и профиль пользователя.
export function Radar({ blocks, ratings }: { blocks: Block[]; ratings: Ratings }) {
  const n = blocks.length, cx = 170, cy = 150, R = 96;
  const pt = (i: number, r: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const any = Object.keys(ratings).length > 0;
  const scores = blocks.map((b) => Math.max(0.02, blockStats(b, ratings).score));
  return (
    <Svg width="100%" height={250} viewBox="-60 20 460 270">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <Polygon key={k} points={blocks.map((_, i) => pt(i, R * k).join(',')).join(' ')} fill="none" stroke={c.line} strokeWidth={1} />
      ))}
      {blocks.map((b, i) => {
        const e = pt(i, R);
        return (
          <Line key={`l${b.id}`} x1={cx} y1={cy} x2={e[0]} y2={e[1]} stroke={c.line} strokeWidth={1} />
        );
      })}
      {blocks.map((b, i) => {
        const l = pt(i, R + 22);
        const anchor = Math.abs(l[0] - cx) < 8 ? 'middle' : l[0] > cx ? 'start' : 'end';
        return (
          <SvgText key={`t${b.id}`} x={l[0]} y={l[1] + 4} textAnchor={anchor} fill={c.ink2} fontSize={11.5}>
            {b.short}
          </SvgText>
        );
      })}
      {any && (
        <Polygon
          points={scores.map((s, i) => pt(i, s * R).join(',')).join(' ')}
          fill={c.brand} fillOpacity={0.16} stroke={c.brand} strokeWidth={2} strokeLinejoin="round"
        />
      )}
      {any && scores.map((s, i) => {
        const p = pt(i, s * R);
        return <Circle key={`d${i}`} cx={p[0]} cy={p[1]} r={3.5} fill={c.brand} />;
      })}
      <SvgText x={cx + 4} y={cy - R * 0.5 + 12} fill={c.ink3} fontSize={10}>50%</SvgText>
    </Svg>
  );
}
