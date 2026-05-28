declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }

  interface TransactionPayload {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    [key: string]: any;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(payload: TransactionPayload): Promise<{ token: string; redirect_url: string }>;
    createTransactionToken(payload: TransactionPayload): Promise<string>;
  }

  class CoreApi {
    constructor(options: SnapOptions);
    charge(payload: TransactionPayload): Promise<any>;
    capture(transactionId: string): Promise<any>;
    approve(transactionId: string): Promise<any>;
    cancel(transactionId: string): Promise<any>;
    status(transactionId: string): Promise<any>;
    notification(notification: any): Promise<any>;
  }

  const Snap: typeof Snap;
  const CoreApi: typeof CoreApi;
}
