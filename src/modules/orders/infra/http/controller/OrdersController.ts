import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const findTheOrder = container.resolve(FindOrderService);

    const orderMatch = await findTheOrder.execute({
      id,
    });

    return response.json(orderMatch);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;

    const createNewOrder = container.resolve(CreateOrderService);

    const newOrder = await createNewOrder.execute({
      customer_id,
      products,
    });

    return response.json(newOrder);
  }
}
