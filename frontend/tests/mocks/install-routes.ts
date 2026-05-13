import type { Page, Route } from '@playwright/test';
import {
  isApiUrl,
  pathMatchesInventoryByProductId,
  pathMatchesMovementsPost,
  pathMatchesProductById,
  pathMatchesProductsList,
} from '../utils/api-match';

export async function fulfillJson(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function installProductsListMock(
  page: Page,
  products: unknown[],
): Promise<void> {
  await page.route((url) => pathMatchesProductsList(url), async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await fulfillJson(route, 200, products);
  });
}

export async function installProductByIdMock(
  page: Page,
  product: unknown,
): Promise<void> {
  await page.route((url) => pathMatchesProductById(url), async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await fulfillJson(route, 200, product);
  });
}

export async function installInventoryMock(
  page: Page,
  inventory: unknown,
): Promise<void> {
  await page.route((url) => pathMatchesInventoryByProductId(url), async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await fulfillJson(route, 200, inventory);
  });
}

export async function installInventoryMockDelayed(
  page: Page,
  inventory: unknown,
  delayMs: number,
): Promise<void> {
  await page.route((url) => pathMatchesInventoryByProductId(url), async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await new Promise((r) => setTimeout(r, delayMs));
    await fulfillJson(route, 200, inventory);
  });
}

export async function installInventoryErrorMock(page: Page, status = 500): Promise<void> {
  await page.route((url) => {
    if (!isApiUrl(url)) {
      return false;
    }
    let u: URL;
    try {
      u = new URL(url);
    } catch {
      return false;
    }
    return /^\/inventory\/[0-9a-f-]{36}$/i.test(u.pathname);
  }, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await fulfillJson(route, status, {
      code: status,
      message: 'Error inventario',
      details: null,
      path: route.request().url(),
      timestamp: new Date().toISOString(),
    });
  });
}

export type MovementPostCapture = {
  body: Record<string, unknown> | null;
};

export async function installMovementsPostMock(
  page: Page,
  responseBody: unknown,
  capture?: MovementPostCapture,
): Promise<void> {
  await page.route((url) => pathMatchesMovementsPost(url), async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    if (capture) {
      try {
        capture.body = route.request().postDataJSON() as Record<string, unknown>;
      } catch {
        capture.body = null;
      }
    }
    await fulfillJson(route, 201, responseBody);
  });
}
