/**
 * SoundMirror Side Airflow
 * English (US)
 *
 * Pack-owned airflow renderer
 * Correct prop wiring to LiveSideAirflow
 */

import React from 'react';
import LiveSideAirflow from '@/components/animation/airflow/LiveSideAirflow';

export default function SideAirflow({
  currentFrame,
  timelineEntry,
  posMs,
  airflowMap,
  isPlaying,
  locale = 'en-US',
}) {
  return (
    <LiveSideAirflow
      currentFrame={currentFrame}
      timelineEntry={timelineEntry}
      posMs={posMs}
      airflowMap={airflowMap}
      isPlaying={isPlaying}
      locale={locale}
    />
  );
}