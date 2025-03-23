
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const IndexPage = lazy(() => import('@/pages/Index'));
const SafeIndexPage = lazy(() => import('@/pages/SafeIndex'));

const Fallback = () => (
  <div className="p-4 text-center">
    <span className="animate-pulse">Chargement...</span>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<SafeIndexPage />} />
      </Routes>
    </Suspense>
  );
}
