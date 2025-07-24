import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const IndexPage = lazy(() => import('@/pages/Index'));
// const SafeIndexPage = lazy(() => import('@/pages/SafeIndex')); // Removed SafeIndexPage

const Fallback = () => (
  <div className="p-4 text-center">
    <span className="animate-pulse">Chargement...</span>
  </div>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<IndexPage />} /> {/* Render IndexPage directly */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
