import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/shared/Header'
import Home from './pages/Home'
import VocabularyPage from './pages/VocabularyPage'
import VocabCategoryPage from './pages/VocabCategoryPage'
import VocabQuizPage from './pages/VocabQuizPage'
import GrammarPage from './pages/GrammarPage'
import GrammarTopicPage from './pages/GrammarTopicPage'
import SongsPage from './pages/SongsPage'
import SongDetailPage from './pages/SongDetailPage'

export default function App() {
  return (
    <BrowserRouter basename="/estrela-guia">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/quiz" element={<VocabQuizPage />} />
        <Route path="/vocabulary/:categoryId" element={<VocabCategoryPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/grammar/:topicId" element={<GrammarTopicPage />} />
        <Route path="/songs" element={<SongsPage />} />
        <Route path="/songs/:songId" element={<SongDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
