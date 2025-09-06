import { Member } from "../../model/member";

export interface EmailService {
    sendEmail(member: Member, content: string): Promise<void>;
    sendVerificationEmail(member: Member): Promise<void>;
    sendSuspensionEmail(member: Member): Promise<void>;
}