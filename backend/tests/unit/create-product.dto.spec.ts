import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { ProductUnit } from '../../src/products/entities/product.entity';

describe('CreateProductDto', () => {
  it('shouldPassValidationWhenPayloadIsValid', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Producto valido',
      unitMeasure: ProductUnit.UNITS,
      minimumStock: 0,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('shouldFailValidationWhenPayloadIsInvalid', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: '',
      unitMeasure: 'valor-no-enum',
      minimumStock: -1,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const props = new Set(errors.map((e) => e.property));
    expect(props.has('name')).toBe(true);
    expect(props.has('unitMeasure')).toBe(true);
    expect(props.has('minimumStock')).toBe(true);
  });
});
