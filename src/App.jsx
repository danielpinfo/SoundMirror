import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { useMemo } from 'react';
import Home from './pages/Home';
import SplashScreen from './pages/SplashScreen';
import AppErrorBoundary from './lib/AppErrorBoundary';
import Practice from './pages/Practice';
import MorePracticeWords from './pages/MorePracticeWords';
import { translations } from '@/components/i18n/translations';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const LayoutWrapper = ({ children, currentPageName }) =>
  Layout ? (
    <Layout currentPageName={currentPageName}>{children}</Layout>
  ) : (
    <>{children}</>
  );

const pushBootStepToWindow = (step) => {
  if (
    typeof window !== 'undefined' &&
    typeof window.__soundmirrorBootStep === 'function'
  ) {
    window.__soundmirrorBootStep(step);
  }
};

const PACK_MAP = {
  en: 'en_us',
  es: 'es',
  pt: 'pt',
  it: 'it',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  zh: 'zh',
  ar: 'ar',
  hi: 'hi',
};

try {
  if (translations?.en?.languages && !translations.en.languages.es) {
    translations.en.languages.es = 'Spanish';
  }
} catch (e) {
  console.warn('[App] Failed to augment languages for dropdown:', e?.message || e);
}

const VALID_LANGS = Object.keys(PACK_MAP);
const EXTRA_PAGE_KEYS = ['SplashScreen'];

const LEARNING_CONTEXT_KEY = 'soundmirror-learning-context-v1';
const UI_LANGUAGE_KEY = 'soundmirror-language';

function resolveBootState() {
  const savedUiLanguage = localStorage.getItem(UI_LANGUAGE_KEY);
  const uiLanguage = VALID_LANGS.includes(savedUiLanguage) ? savedUiLanguage : 'en';

  let storedLearning = null;
  try {
    storedLearning = JSON.parse(localStorage.getItem(LEARNING_CONTEXT_KEY) || 'null');
  } catch {
    storedLearning = null;
  }

  const nativeLanguage = VALID_LANGS.includes(storedLearning?.nativeLanguage)
    ? storedLearning.nativeLanguage
    : uiLanguage;

  const practiceLanguage = VALID_LANGS.includes(storedLearning?.practiceLanguage)
    ? storedLearning.practiceLanguage
    : nativeLanguage;

  const validPageKeys = new Set([...Object.keys(Pages), ...EXTRA_PAGE_KEYS]);

  const currentPath =
    window.location.pathname === '/'
      ? 'SplashScreen'
      : decodeURIComponent(window.location.pathname.replace(/^\//, ''));

  const pageKey = validPageKeys.has(currentPath) ? currentPath : 'SplashScreen';
  const activePackId = PACK_MAP[practiceLanguage] || PACK_MAP.en;

  console.log('[boot] pageKey=', pageKey);
  console.log('[boot] uiLanguage=', uiLanguage);
  console.log('[boot] practiceLanguage=', practiceLanguage);
  console.log('[boot] activePackId=', activePackId);
  console.log('[boot] bootReady=', true);

  pushBootStepToWindow({
    bootReady: true,
    pageKey,
    uiLanguage,
    practiceLanguage,
    activePackId,
  });

  return {
    bootReady: true,
    pageKey,
    uiLanguage,
    practiceLanguage,
    activePackId,
  };
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } =
    useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a1628]">
        <div className="w-8 h-8 border-4 border-cyan-200/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }

    if (authError.type === 'auth_required') {
      navigateToLogin();
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0a1628] text-white">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 px-6 py-4 text-sm text-cyan-100">
            Redirecting to login...
          </div>
        </div>
      );
    }
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LayoutWrapper currentPageName="SplashScreen">
            <SplashScreen />
          </LayoutWrapper>
        }
      />

      <Route
        path="/Practice"
        element={
          <LayoutWrapper currentPageName="Practice">
            <Practice />
          </LayoutWrapper>
        }
      />

      <Route
        path="/MorePracticeWords"
        element={
          <LayoutWrapper currentPageName="MorePracticeWords">
            <MorePracticeWords />
          </LayoutWrapper>
        }
      />

      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const { bootState, bootError } = useMemo(() => {
    try {
      return {
        bootState: resolveBootState(),
        bootError: null,
      };
    } catch (error) {
      console.error('[boot] page resolve failed', error);
      return {
        bootState: {
          bootReady: false,
          pageKey: null,
          uiLanguage: null,
          practiceLanguage: null,
          activePackId: null,
        },
        bootError: error,
      };
    }
  }, []);

  if (bootError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a1628] text-white">
        <div className="rounded-xl border border-red-500/30 bg-slate-950/70 px-6 py-4 text-sm text-red-100">
          {bootError.message || 'Failed to start the app'}
        </div>
      </div>
    );
  }

  if (!bootState.bootReady) return null;

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AppErrorBoundary>
            <AuthenticatedApp />
          </AppErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
