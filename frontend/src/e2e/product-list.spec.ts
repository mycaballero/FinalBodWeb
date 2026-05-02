import { expect, test } from '@playwright/test';

test.describe('ProductList', () => {
  test('muestra lista de productos y low-stock', async ({ page }) => {
    await page.route('**://localhost:3000/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '34f5ad27-b6a8-4538-9f67-92c2344be2d1',
            name: 'Arroz integral',
            description: 'Semilla',
            unitMeasure: 'kg',
            minimumStock: 10,
            status: 'activo',
            currentStock: 8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto('/products');

    await expect(page.getByRole('heading', { name: 'Panel de productos' })).toBeVisible();
    await expect(page.getByText('Arroz integral')).toBeVisible();
    await expect(page.getByRole('article').getByText('Stock bajo')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Registrar movimiento' })).toBeVisible();
  });

  test('muestra estado vacio', async ({ page }) => {
    await page.route('**://localhost:3000/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/products');
    await expect(page.getByText('No hay productos registrados todavia.')).toBeVisible();
  });

  test('muestra error y permite reintento', async ({ page }) => {
    await page.route('**://localhost:3000/products', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Error interno',
          details: null,
          path: '/products',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/products');
    await expect(page.getByText('Error interno')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  });
});
