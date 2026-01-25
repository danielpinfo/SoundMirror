import History from './pages/History';
import Home from './pages/Home';
import LetterPractice from './pages/LetterPractice';
import ManualAdjustment from './pages/ManualAdjustment';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import TeachLetters from './pages/TeachLetters';
import __Layout from './Layout.jsx';


export const PAGES = {
    "History": History,
    "Home": Home,
    "LetterPractice": LetterPractice,
    "ManualAdjustment": ManualAdjustment,
    "Practice": Practice,
    "Progress": Progress,
    "TeachLetters": TeachLetters,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};