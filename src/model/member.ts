export class Member {
  account: string;
  password: string;
  email: string;
  lineID: string;
  name: string;
  address: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;

  constructor(
    account: string,
    password: string,
    email: string,
    lineID: string,
    name: string,
    address: string,
    role: string = 'member',
    isVerified: boolean = false,
    isActive: boolean = true
  ) {
    this.account = account;
    this.password = password;
    this.email = email;
    this.lineID = lineID;
    this.name = name;
    this.address = address;
    this.role = role;
    this.isVerified = isVerified;
    this.isActive = isActive;
  }

  deleteAccount(): void {
    this.isActive = false;
  }

  verifyEmail(): void {
    this.isVerified = true;
  }

  suspend(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }
}