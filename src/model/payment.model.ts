export class ResponsePayment {
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

export class CreateAccountGopay {
  payment_type: string;
  gopay_partner: {
    phone_number: string;
    country_code: string;
  };
}

export class CreateTransactionRequest {
  membershipId: string;
}
