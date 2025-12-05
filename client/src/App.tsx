import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LibraryView from './components/LibraryView';
import ViewerPage from './components/ViewerPage';
import OfflinePage from './components/OfflinePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LibraryView />} />
        <Route path="/viewer/:id" element={<ViewerPage />} />
        <Route path="/offline" element={<OfflinePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
