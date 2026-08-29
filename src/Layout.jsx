import React from 'react';
import { LanguageProvider } from './components/i18n/LanguageContext';
import { SpritePreloadProvider } from './components/animation/SpritePreloadContext';
import { PluginProvider } from './components/core/PluginContext';
import { VoicePreferenceProvider } from './components/core/VoicePreference';
import BugReportButton from './components/common/BugReportButton';
import { LearningContextProvider } from './components/core/LearningContext';
import BootStepProbe from './components/boot/BootStepProbe';

const HIDE_BUG_REPORT_ON = ['SplashScreen', 'BugReport'];

export default function Layout({ children, currentPageName }) {
  return (
    <VoicePreferenceProvider>
      <LearningContextProvider>
        <PluginProvider>
          <SpritePreloadProvider>
            <LanguageProvider>
              <BootStepProbe step="step 8: plugin context initialized" onStep={window.__soundmirrorBootStep} />
              {React.cloneElement(children, { key: currentPageName })}
              {!HIDE_BUG_REPORT_ON.includes(currentPageName) && <BugReportButton />}
            </LanguageProvider>
          </SpritePreloadProvider>
        </PluginProvider>
      </LearningContextProvider>
    </VoicePreferenceProvider>
  );
}