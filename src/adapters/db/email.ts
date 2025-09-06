import { injectable } from 'tsyringe';
import { EmailService } from '../../handler/ports/email';
import { Member } from '../../model/member';

@injectable()
export class MockEmailService implements EmailService {
    async sendEmail(member: Member, content: string): Promise<void> {
        console.log(`Sending email to ${member.email}:`);
        console.log(`Subject: Message from Admin`);
        console.log(`Content: ${content}`);
        console.log('---');
        
        // 模擬發送延遲
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    async sendVerificationEmail(member: Member): Promise<void> {
        const content = `
Dear ${member.name},

Welcome to our member management system!

Please verify your email address by clicking the link below:
[Verification Link: /verify/${member.account}]

Thank you for joining us!

Best regards,
Admin Team
        `;
        
        await this.sendEmail(member, content);
    }

    async sendSuspensionEmail(member: Member): Promise<void> {
        const content = `
Dear ${member.name},

We regret to inform you that your account has been suspended.

If you have any questions or concerns, please contact our support team.

Account: ${member.account}
Email: ${member.email}

Best regards,
Admin Team
        `;
        
        await this.sendEmail(member, content);
    }
}