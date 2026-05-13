import { expect, test } from '@playwright/test';
import {
  inventoryFor,
  productArrozBajoStock,
  PRODUCT_ID_LOW,
} from '../fixtures/products';
import {
  fulfillJson,
  installInventoryErrorMock,
  installInventoryMock,
  installInventoryMockDelayed,
  installMovementsPostMock,
  installProductByIdMock,
  installProductsListMock,
} from '../mocks/install-routes';
import { pathMatchesMovementsPost, pathMatchesProductsList } from '../utils/api-match';
import { MovementFormPage } from '../utils/pages/movement-form.page';

test.describe('MovementForm', () => {
  test('escenario 4: registrar entrada válida, POST correcto y vuelta al listado', async ({
    page,
  }) => {
    const arroz = productArrozBajoStock();
    let currentStock = arroz.currentStock;
    const postBodies: unknown[] = [];

    await page.route((url) => pathMatchesProductsList(url), async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await fulfillJson(route, 200, [{ ...arroz, currentStock }]);
    });

    await page.route((url) => pathMatchesMovementsPost(url), async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      postBodies.push(route.request().postDataJSON());
      const body = route.request().postDataJSON() as {
        type: string;
        quantity: number;
      };
      if (body.type === 'entrada') {
        currentStock += Number(body.quantity);
      }
      await fulfillJson(route, 201, {
        id: '11111111-1111-4111-8111-111111111111',
        productId: arroz.id,
        type: body.type,
        reason: 'compra',
        quantity: String(body.quantity),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    });

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await form.typeSelect().selectOption('entrada');
    await form.reasonSelect().selectOption('compra');
    await form.quantityInput().fill('2');
    await form.submitButton().click();

    await expect(page).toHaveURL(/\/products$/);
    expect(postBodies).toHaveLength(1);
    const sent = postBodies[0] as Record<string, unknown>;
    expect(sent.productId).toBe(arroz.id);
    expect(sent.type).toBe('entrada');
    expect(sent.quantity).toBe(2);
    await expect(page.getByTestId(`product-card-${arroz.id}`)).toContainText('10', {
      timeout: 10_000,
    });
  });

  test('escenario 5: registrar salida válida y reflejar stock en listado', async ({
    page,
  }) => {
    const arroz = { ...productArrozBajoStock(), currentStock: 20, minimumStock: 5 };
    let currentStock = arroz.currentStock;
    const inv = inventoryFor(arroz.id, arroz.name, arroz.minimumStock, currentStock);

    await page.route((url) => pathMatchesProductsList(url), async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await fulfillJson(route, 200, [{ ...arroz, currentStock }]);
    });

    await installInventoryMock(page, inv);

    await page.route((url) => pathMatchesMovementsPost(url), async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      const body = route.request().postDataJSON() as { quantity: number };
      currentStock -= Number(body.quantity);
      await fulfillJson(route, 201, {
        id: '22222222-2222-4222-a222-222222222222',
        productId: arroz.id,
        type: 'salida',
        reason: 'venta',
        quantity: String(body.quantity),
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    });

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await form.typeSelect().selectOption('salida');
    await form.reasonSelect().selectOption('venta');
    await expect(page.getByText(/Stock disponible para salida:\s*20/)).toBeVisible();
    await form.quantityInput().fill('3');
    await form.submitButton().click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByTestId(`product-card-${arroz.id}`)).toContainText('17');
  });

  test('escenario 6: salida con stock insuficiente bloquea envío y muestra error', async ({
    page,
  }) => {
    const arroz = productArrozBajoStock();
    await installProductByIdMock(page, arroz);
    await installInventoryMock(
      page,
      inventoryFor(arroz.id, arroz.name, arroz.minimumStock, 8),
    );
    await installMovementsPostMock(page, { id: 'x' });

    const form = new MovementFormPage(page);
    await form.goto({ productId: PRODUCT_ID_LOW });
    await form.typeSelect().selectOption('salida');
    await form.quantityInput().fill('12');
    await form.submitButton().click();

    await expect(
      page.getByText('La salida no puede superar el stock disponible (8).'),
    ).toBeVisible();
  });

  test('validación: producto requerido cuando no hay productos', async ({ page }) => {
    await installProductsListMock(page, []);

    const form = new MovementFormPage(page);
    await form.goto();
    await form.quantityInput().fill('1');
    await form.submitButton().click();

    await expect(
      page.getByText('Debes seleccionar un producto valido.'),
    ).toBeVisible();
  });

  test('validación: cantidad no positiva', async ({ page }) => {
    const arroz = productArrozBajoStock();
    await installProductsListMock(page, [arroz]);

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await form.quantityInput().fill('0');
    await form.submitButton().click();

    await expect(
      page.getByText('La cantidad debe ser mayor a 0.'),
    ).toBeVisible();
  });

  test('estado: submit deshabilitado mientras carga inventario en salida', async ({
    page,
  }) => {
    const arroz = productArrozBajoStock();
    await installProductsListMock(page, [arroz]);
    await installInventoryMockDelayed(
      page,
      inventoryFor(arroz.id, arroz.name, 10, 8),
      1200,
    );

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await form.typeSelect().selectOption('salida');

    await expect(page.getByText('Cargando stock disponible...')).toBeVisible();
    await expect(form.submitButton()).toBeDisabled();
    await expect(form.submitButton()).toBeEnabled({ timeout: 10_000 });
  });

  test('estado: loading productos en formulario', async ({ page }) => {
    const arroz = productArrozBajoStock();

    await page.route((url) => pathMatchesProductsList(url), async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await new Promise((r) => setTimeout(r, 400));
      await fulfillJson(route, 200, [arroz]);
    });

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await expect(page.getByText('Cargando productos...')).toBeVisible();
    await expect(form.productSelect()).toBeVisible({ timeout: 10_000 });
  });

  test('estado: texto Guardando durante envío', async ({ page }) => {
    const arroz = productArrozBajoStock();
    await installProductsListMock(page, [arroz]);
    await installInventoryMock(
      page,
      inventoryFor(arroz.id, arroz.name, 10, 50),
    );

    await page.route((url) => pathMatchesMovementsPost(url), async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await new Promise((r) => setTimeout(r, 800));
      await fulfillJson(route, 201, {
        id: '33333333-3333-4333-a333-333333333333',
        productId: arroz.id,
        type: 'entrada',
        reason: 'compra',
        quantity: '1',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    });

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await form.typeSelect().selectOption('entrada');
    const clickPromise = form.submitButton().click();
    await expect(form.submitButton()).toContainText(/Guardando/, { timeout: 3000 });
    await clickPromise;
  });

  test('error: inventario no disponible muestra reintento', async ({ page }) => {
    const arroz = productArrozBajoStock();
    await installProductsListMock(page, [arroz]);
    await installInventoryErrorMock(page, 500);

    const form = new MovementFormPage(page);
    await form.goto({ productId: arroz.id });
    await form.typeSelect().selectOption('salida');

    await expect(page.getByText(/No se pudo obtener el stock/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('button', { name: 'Reintentar' }),
    ).toBeVisible();
  });
});
