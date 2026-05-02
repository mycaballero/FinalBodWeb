import { expect, test } from '@playwright/test';

test.describe('MovementForm', () => {
  test('bloquea salida cuando cantidad supera stock', async ({ page }) => {
    await page.route('**://localhost:3000/products/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '34f5ad27-b6a8-4538-9f67-92c2344be2d1',
          name: 'Arroz integral',
          description: 'Semilla',
          unitMeasure: 'kg',
          minimumStock: 10,
          status: 'activo',
          currentStock: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    });

    await page.route('**://localhost:3000/inventory/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          productId: '34f5ad27-b6a8-4538-9f67-92c2344be2d1',
          name: 'Arroz integral',
          minimumStock: 10,
          currentStock: 8,
        }),
      });
    });

    await page.route('**://localhost:3000/movements', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'ok' }),
      });
    });

    await page.goto('/movements/new?productId=34f5ad27-b6a8-4538-9f67-92c2344be2d1');

    await page.selectOption('#type', 'salida');
    await page.fill('#quantity', '12');
    await page.click('button[type="submit"]');

    await expect(page.getByText('La salida no puede superar el stock disponible (8).')).toBeVisible();
  });
});
