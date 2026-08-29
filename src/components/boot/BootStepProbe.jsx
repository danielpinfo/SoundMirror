import { useEffect } from 'react';

export default function BootStepProbe({ step, onStep }) {
  useEffect(() => {
    onStep?.(step);
  }, [onStep, step]);

  return null;
}