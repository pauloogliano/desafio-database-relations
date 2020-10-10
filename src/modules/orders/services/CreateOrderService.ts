import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('This customer does not exists');
    }

    const findAllProducts = await this.productsRepository.findAllById(products);

    if (!findAllProducts.length) {
      throw new AppError("Couldn't not find any product with this id");
    }

    findAllProducts.forEach(currentValue => {
      const product = products.find(item => item.id === currentValue.id);

      if (product && product.quantity > currentValue.quantity) {
        throw new AppError("The number of the items listed isn't enough");
      }
    });

    const orders_products = products.map(product => {
      const unitPrice = findAllProducts.find(item => item.id === product.id)
        ?.price;

      const orderProduct = {
        product_id: product.id,
        price: unitPrice || 0,
        quantity: product.quantity,
      };

      return orderProduct;
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orders_products,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
