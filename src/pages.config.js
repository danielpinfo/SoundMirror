/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 */

import BugReport from './pages/BugReport';
import Curriculum from './pages/Curriculum';
import HistoryLibrary from './pages/HistoryLibrary';
import Home from './pages/Home';
import Practice from './pages/Practice';
import SplashScreen from './pages/SplashScreen';
import __Layout from './Layout.jsx';

export const PAGES = {
    "BugReport": BugReport,
    "Curriculum": Curriculum,
    "HistoryLibrary": HistoryLibrary,
    "Home": Home,
    "Practice": Practice,
    "SplashScreen": SplashScreen,
}

export const pagesConfig = {
    mainPage: "SplashScreen",
    Pages: PAGES,
    Layout: __Layout,
};