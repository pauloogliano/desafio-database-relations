import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = await this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIds = products
      .map(product => product.id)
      .filter((id, i, vec) => vec.indexOf(id) === i);

    // if (productsIds.length !== products.length) {
    //   throw new AppError('The products has repeated at the list');
    // }

    const existentsProducts = await this.ormRepository.find({
      where: {
        id: In(productsIds),
      },
    });

    // if (existentsProducts.length !== productsIds.length) {
    //   throw new AppError("Don't all products was booked");
    // }

    return existentsProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsIds = products.map(product => product.id);

    const existentsProducts = await this.ormRepository.find({
      where: { id: In(productsIds) },
    });

    const updatedProducts = existentsProducts.map(product => {
      const updatedProduct = { ...product };

      const orderProduct = products.find(item => item.id === product.id);

      updatedProduct.quantity =
        product.quantity - (orderProduct?.quantity || 0);

      return updatedProduct;
    });

    await this.ormRepository.save(updatedProducts);

    return updatedProducts;
  }
}

export default ProductsRepository;
