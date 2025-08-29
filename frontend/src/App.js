import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DocumentUpload from './pages/DocumentUpload';
import VectorSearch from './pages/VectorSearch';
import PromptTesting from './pages/PromptTesting';
import SimilarityDemo from './pages/SimilarityDemo';
import StructuredOutput from './pages/StructuredOutput';
import EmbeddingDemo from './pages/EmbeddingDemo';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/search" element={<VectorSearch />} />
            <Route path="/prompts" element={<PromptTesting />} />
            <Route path="/similarity" element={<SimilarityDemo />} />
            <Route path="/structured" element={<StructuredOutput />} />
            <Route path="/embeddings" element={<EmbeddingDemo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
