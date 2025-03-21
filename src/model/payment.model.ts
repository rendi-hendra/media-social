export class PaymentResponse {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    id: number;
    first_name: string;
  };
  page_expiry: {
    duration: 1;
    unit: 'hours';
  };
}

export class CreateTransactionRequest {
  membershipId: string;
}
