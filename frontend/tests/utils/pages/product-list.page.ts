import type { Page } from '@playwright/test';

export class ProductListPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  productCard(productId: string) {
    return this.page.getByTestId(`product-card-${productId}`);
  }

  async openMovementForProduct(productId: string): Promise<void> {
    await this.productCard(productId).getByRole('link', { name: 'Registrar movimiento' }).click();
  }
}
