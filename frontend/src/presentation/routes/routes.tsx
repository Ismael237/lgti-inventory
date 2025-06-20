import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Layout } from '@layout/layout';
import { LoadingSpinner } from '@ui/loading-spinner';
import { ErrorElement } from '@pages/error-boundary';
import { ProtectedRoute } from '@ui/protected-route';
import { CategoryViewType } from '@entities/category.types';
import { PriceSimulationViewType } from '@entities/price-simulation.types';
import { MovementViewType } from '@entities/movement.types';
import { ProductViewType } from '@entities/product.types';
import { PartnerViewType } from '@entities/partner.types';
import { DocumentViewType } from '@entities/document.types';

// Lazy loaded pages
const Dashboard = lazy(() => import('@pages/dashboard/dashboard'));
const Category = lazy(() => import('@pages/category/category'));
const Movement = lazy(() => import('@pages/movement/movement'));
const PriceSimulation = lazy(() => import('@pages/price-simulation/price-simulation'));
const Product = lazy(() => import('@pages/product/product'));
const ProductMovementStats = lazy(() => import('@pages/product/product-movement-stats'));
const ProductMovementStatsExport = lazy(() => import('@pages/product/product-movement-stats-export'));
const Partner = lazy(() => import('@pages/partner/partner'));
const DocumentList = lazy(() => import('@pages/document/document-list'));
const DocumentDetail = lazy(() => import('@pages/document/document-detail'));
const DocumentForm = lazy(() => import('@pages/document/document-form'));
const DocumentPDFPage = lazy(() => import('@pages/document/document-pdf'));
const DocumentExport = lazy(() => import('@pages/document/document-export'));
const Login = lazy(() => import('@pages/auth/login'));
const NotFound = lazy(() => import('@pages/not-found'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (<ProtectedRoute>
      <Layout />
    </ProtectedRoute>),
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      // Categories Routes
      {
        path: 'categories',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category />
          </Suspense>
        ),
      },
      {
        path: 'categories/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category viewType={CategoryViewType.NEW} />
          </Suspense>
        ),
      },
      {
        path: 'categories/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category viewType={CategoryViewType.DETAILS} />
          </Suspense>
        ),
      },
      {
        path: 'categories/:id/edit',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category viewType={CategoryViewType.EDIT} />
          </Suspense>
        ),
      },
      {
        path: 'categories/:id/delete',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category viewType={CategoryViewType.DELETE} />
          </Suspense>
        ),
      },
      {
        path: 'categories/hierarchy',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category viewType={CategoryViewType.HIERARCHY} />
          </Suspense>
        ),
      },
      {
        path: 'categories/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Category viewType={CategoryViewType.EXPORT} />
          </Suspense>
        ),
      },
      
      // Movements Routes
      {
        path: 'movements',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Movement />
          </Suspense>
        ),
      },
      {
        path: 'movements/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Movement viewType={MovementViewType.NEW} />
          </Suspense>
        ),
      },
      {
        path: 'movements/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Movement viewType={MovementViewType.DETAILS} />
          </Suspense>
        ),
      },
      {
        path: 'movements/:id/edit',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Movement viewType={MovementViewType.EDIT} />
          </Suspense>
        ),
      },
      {
        path: 'movements/:id/delete',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Movement viewType={MovementViewType.DELETE} />
          </Suspense>
        ),
      },
      {
        path: 'movements/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Movement viewType={MovementViewType.EXPORT} />
          </Suspense>
        ),
      },
      
      // Price Simulations Routes
      {
        path: 'price-simulations',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceSimulation />
          </Suspense>
        ),
      },
      {
        path: 'price-simulations/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceSimulation viewType={PriceSimulationViewType.NEW} />
          </Suspense>
        ),
      },
      {
        path: 'price-simulations/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceSimulation viewType={PriceSimulationViewType.DETAILS} />
          </Suspense>
        ),
      },
      {
        path: 'price-simulations/:id/edit',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceSimulation viewType={PriceSimulationViewType.EDIT} />
          </Suspense>
        ),
      },
      {
        path: 'price-simulations/:id/delete',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceSimulation viewType={PriceSimulationViewType.DELETE} />
          </Suspense>
        ),
      },
      {
        path: 'price-simulations/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PriceSimulation viewType={PriceSimulationViewType.EXPORT} />
          </Suspense>
        ),
      },
      
      // Products Routes
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product />
          </Suspense>
        ),
      },
      {
        path: 'products/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.NEW} />
          </Suspense>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.DETAILS} />
          </Suspense>
        ),
      },
      {
        path: 'products/:id/edit',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.EDIT} />
          </Suspense>
        ),
      },
      {
        path: 'products/:id/delete',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.DELETE} />
          </Suspense>
        ),
      },
      {
        path: 'products/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.EXPORT} />
          </Suspense>
        ),
      },
      {
        path: 'products/snapshots',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.SNAPSHOTS} />
          </Suspense>
        ),
      },
      {
        path: 'products/snapshots/create',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.SNAPSHOT_CREATE} />
          </Suspense>
        ),
      },
      {
        path: 'products/snapshots/:snapshotId',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.SNAPSHOT_DETAILS} />
          </Suspense>
        ),
      },
      {
        path: 'products/snapshots/:snapshotId/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Product viewType={ProductViewType.SNAPSHOT_EXPORT} />
          </Suspense>
        ),
      },
      {
        path: 'products/movement-stats',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductMovementStats />
          </Suspense>
        ),
      },
      {
        path: 'products/movement-stats/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductMovementStatsExport />
          </Suspense>
        ),
      },
      
      // Partners Routes
      {
        path: 'partners',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Partner />
          </Suspense>
        ),
      },
      {
        path: 'partners/new',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Partner viewType={PartnerViewType.NEW} />
          </Suspense>
        ),
      },
      {
        path: 'partners/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Partner viewType={PartnerViewType.DETAILS} />
          </Suspense>
        ),
      },
      {
        path: 'partners/:id/edit',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Partner viewType={PartnerViewType.EDIT} />
          </Suspense>
        ),
      },
      {
        path: 'partners/:id/delete',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Partner viewType={PartnerViewType.DELETE} />
          </Suspense>
        ),
      },
      {
        path: 'partners/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Partner viewType={PartnerViewType.EXPORT} />
          </Suspense>
        ),
      },

      // Documents Routes
      {
        path: 'documents',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentList viewType={DocumentViewType.LIST} />
          </Suspense>
        ),
      },
      {
        path: 'documents/create',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentForm />
          </Suspense>
        ),
      },
      {
        path: 'documents/:id',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentDetail />
          </Suspense>
        ),
      },
      {
        path: 'documents/:id/edit',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentForm />
          </Suspense>
        ),
      },
      {
        path: 'documents/:id/pdf',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentPDFPage />
          </Suspense>
        ),
      },
      {
        path: 'documents/export',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentExport />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/",
    element: (<ProtectedRoute requireAuth={false}>
      <Outlet />
    </ProtectedRoute>),
    errorElement: <ErrorElement />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ]
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorElement />,
    children: [{
      path: '*',
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <NotFound />
        </Suspense>
      ),
    }]

  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
