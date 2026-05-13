import { expect, test } from '@playwright/test';
import {
  productAceiteOkStock,
  productArrozBajoStock,
} from '../fixtures/products';
import { fulfillJson, installProductsListMock } from '../mocks/install-routes';
import { pathMatchesProductsList } from '../utils/api-match';
import { ProductListPage } from '../utils/pages/product-list.page';

test.describe('ProductList', () => {
  test('escenario 1: carga de productos con nombre, unidad, stock y mínimo', async ({
    page,
  }) => {
    const arroz = productArrozBajoStock();
    const aceite = productAceiteOkStock();
    await installProductsListMock(page, [arroz, aceite]);

    const list = new ProductListPage(page);
    await list.goto();

    await expect(
      page.getByRole('heading', { name: 'Panel de productos' }),
    ).toBeVisible();

    const cardArroz = list.productCard(arroz.id);
    await expect(cardArroz.getByRole('heading', { name: arroz.name })).toBeVisible();
    await expect(cardArroz.getByText(/Unidad:\s*kg/)).toBeVisible();
    await expect(cardArroz.getByText('Stock actual')).toBeVisible();
    await expect(cardArroz.getByText(String(arroz.currentStock))).toBeVisible();
    await expect(cardArroz.getByText(new RegExp(`Minimo:\\s*${arroz.minimumStock}`))).toBeVisible();

    const cardAceite = list.productCard(aceite.id);
    await expect(cardAceite.getByRole('heading', { name: aceite.name })).toBeVisible();
    await expect(cardAceite.getByText(/Unidad:\s*litros/)).toBeVisible();
  });

  test('escenario 2: badge de stock mínimo visible y accesible', async ({ page }) => {
    const arroz = productArrozBajoStock();
    await installProductsListMock(page, [arroz]);

    const list = new ProductListPage(page);
    await list.goto();

    const badge = list.productCard(arroz.id).getByTestId('stock-badge');
    await expect(badge).toHaveText('Stock bajo');
    await expect(badge).toHaveAttribute(
      'aria-label',
      /Alerta: stock bajo \(8, mínimo 10\)/,
    );
  });

  test('escenario 3: navegación al formulario con producto preseleccionado', async ({
    page,
  }) => {
    const arroz = productArrozBajoStock();
    await installProductsListMock(page, [arroz]);

    const list = new ProductListPage(page);
    await list.goto();
    await list.openMovementForProduct(arroz.id);

    await expect(page).toHaveURL(
      new RegExp(`/movements/new\\?productId=${arroz.id}`),
    );
    await expect(page.locator('#productId')).toHaveValue(arroz.id, { timeout: 10_000 });
    await expect(page.getByText(`Producto seleccionado: ${arroz.name}`)).toBeVisible();
  });

  test('muestra estado vacío', async ({ page }) => {
    await installProductsListMock(page, []);

    await page.goto('/products');
    await expect(
      page.getByText('No hay productos registrados todavia.'),
    ).toBeVisible();
  });

  test('muestra error y permite reintento', async ({ page }) => {
    await page.route((url) => pathMatchesProductsList(url), async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await fulfillJson(route, 500, {
        code: 500,
        message: 'Error interno',
        details: null,
        path: '/products',
        timestamp: new Date().toISOString(),
      });
    });

    await page.goto('/products');
    await expect(page.getByText('Error interno')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
  });
});
