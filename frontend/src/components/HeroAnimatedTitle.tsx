'use client';

import { CornText } from './CornText';

export function HeroAnimatedTitle() {
  return (
    <CornText
      text="Explore Platform"
      fontFamily="'Luxurious Script', var(--font-luxurious-script), cursive"
      fontSize="160px"
      fontWeight={400}
      letterSpacing="0.02em"
      textTransform="none"
      viewBoxWidth={1600}
      viewBoxHeight={280}
      forceFieldRadius={78}
      maxLetters={4}
    />
  );
}
export default HeroAnimatedTitle;
