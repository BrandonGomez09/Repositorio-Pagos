export class PaymentTransaction {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly description: string | null,
    public readonly type: string,
    public readonly status: string,
    public readonly created: Date
  ) {}
}