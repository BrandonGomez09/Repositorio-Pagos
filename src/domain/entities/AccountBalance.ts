export class AccountBalance {
  constructor(
    public readonly available: number,
    public readonly pending: number,
    public readonly currency: string
  ) {}
}