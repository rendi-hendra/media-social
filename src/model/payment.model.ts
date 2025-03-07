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
