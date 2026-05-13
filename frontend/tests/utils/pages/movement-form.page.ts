import type { Page } from '@playwright/test';

export class MovementFormPage {
  constructor(private readonly page: Page) {}

  async goto(query?: { productId?: string }): Promise<void> {
    const qs = query?.productId ? `?productId=${query.productId}` : '';
    await this.page.goto(`/movements/new${qs}`);
  }

  productSelect() {
    return this.page.locator('#productId');
  }

  typeSelect() {
    return this.page.locator('#type');
  }

  reasonSelect() {
    return this.page.locator('#reason');
  }

  quantityInput() {
    return this.page.locator('#quantity');
  }

  submitButton() {
    return this.page.getByRole('button', { name: /Guardar movimiento|Guardando/ });
  }
}
