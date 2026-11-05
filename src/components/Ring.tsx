import Svg, { Circle } from 'react-native-svg';
import { c } from '../theme';

// Кольцо с общим процентом, как на лендинге.
export function Ring({ score }: { score: number }) {
  const C = 2 * Math.PI * 40;
  return (
    <Svg width={96} height={96} viewBox="0 0 96 96">
      <Circle cx={48} cy={48} r={40} fill="none" stroke={c.surface2} strokeWidth={10} />
      {score > 0 && (
        <Circle
          cx={48} cy={48} r={40} fill="none" stroke={c.yes} strokeWidth={10} strokeLinecap="round"
          transform="rotate(-90 48 48)" strokeDasharray={`${score * C} ${C}`}
        />
      )}
    </Svg>
  );
}
