import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CacheBar } from './components/CacheBar';

export default function App() {
  return (
    <>
      <CacheBar />
      <RouterProvider router={router} />
    </>
  );
}
