import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/category/:category',
    element: <CategoryPage />,
  },
  {
    path: '*',
    element: <HomePage />, // Fallback to home
  },
]);
