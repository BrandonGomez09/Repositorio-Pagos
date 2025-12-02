export class PaymentTransaction {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly description: string | null,
    public readonly type: string,
    public readonly status: string,
    public readonly created: Date,
    public readonly donorNames: string | null,
    public readonly donorFirstLastName: string | null,
    public readonly donorSecondLastName: string | null,
    public readonly donorEmail: string | null,
    public readonly donorPhone: string | null
  ) {}
}