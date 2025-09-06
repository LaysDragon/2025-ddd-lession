import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { Member } from '../model/member';
import { MemberRepository } from './ports/member_repository';
import { EmailService } from './ports/email';

@injectable()
export class MemberHandler {
    constructor(
        @inject('MemberRepository') private memberRepository: MemberRepository,
        @inject('EmailService') private emailService: EmailService
    ) {}

    // GET /members
    async getMembers(req: Request, res: Response): Promise<void> {
        try {
            const members = await this.memberRepository.getMembers();
            res.status(200).json({
                success: true,
                data: members
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve members',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // GET /members/:id
    async getMember(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const member = await this.memberRepository.getMember(id);
            
            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: member
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve member',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /members
    async createMember(req: Request, res: Response): Promise<void> {
        try {
            const memberData = req.body;
            
            // 驗證必填欄位
            if (!memberData.account || !memberData.password || !memberData.email || !memberData.name) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: account, password, email, name'
                });
                return;
            }

            const member = new Member(
                memberData.account,
                memberData.password,
                memberData.email,
                memberData.lineID || '',
                memberData.name,
                memberData.address || '',
                memberData.role || 'member'
            );

            const createdMember = await this.memberRepository.createMember(member);
            
            // 發送驗證郵件
            await this.emailService.sendVerificationEmail(createdMember);

            res.status(201).json({
                success: true,
                data: createdMember,
                message: 'Member created successfully. Verification email sent.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create member',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /members/activate
    async activateMember(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.body;
            
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Member ID is required'
                });
                return;
            }

            const member = await this.memberRepository.getMember(id);
            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
                return;
            }

            await this.memberRepository.activateMember(id);

            res.status(200).json({
                success: true,
                message: 'Member activated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to activate member',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /members/deactivation
    async deactivateMember(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.body;
            
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Member ID is required'
                });
                return;
            }

            const member = await this.memberRepository.getMember(id);
            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
                return;
            }

            await this.memberRepository.deactivateMember(id);
            
            // 發送停權通知郵件
            await this.emailService.sendSuspensionEmail(member);

            res.status(200).json({
                success: true,
                message: 'Member deactivated successfully. Notification email sent.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to deactivate member',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // PUT /members
    async updateMember(req: Request, res: Response): Promise<void> {
        try {
            const memberData = req.body;
            
            if (!memberData.account) {
                res.status(400).json({
                    success: false,
                    message: 'Member account is required for update'
                });
                return;
            }

            const existingMember = await this.memberRepository.getMember(memberData.account);
            if (!existingMember) {
                res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
                return;
            }

            // 更新會員資料
            const updatedMember = Object.assign(existingMember, memberData);
            const result = await this.memberRepository.updateMember(updatedMember);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Member updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update member',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // DELETE /members
    async deleteMembers(req: Request, res: Response): Promise<void> {
        try {
            const { ids } = req.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Member IDs array is required'
                });
                return;
            }

            // 刪除多個會員
            const deletePromises = ids.map(id => this.memberRepository.deleteMember(id));
            await Promise.all(deletePromises);

            res.status(200).json({
                success: true,
                message: `Successfully deleted ${ids.length} members`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete members',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // 後台管理員專用功能 - 暫停會員並發送通知
    private async suspendMember(member: Member): Promise<void> {
        member.suspend();
        await this.memberRepository.updateMember(member);
        await this.emailService.sendSuspensionEmail(member);
    }

    // Email 驗證功能
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const member = await this.memberRepository.getMember(id);
            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
                return;
            }

            member.verifyEmail();
            await this.memberRepository.updateMember(member);

            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to verify email',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // 發送郵件給會員
    async sendEmailToMember(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { content } = req.body;
            
            if (!content) {
                res.status(400).json({
                    success: false,
                    message: 'Email content is required'
                });
                return;
            }

            const member = await this.memberRepository.getMember(id);
            if (!member) {
                res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
                return;
            }

            await this.emailService.sendEmail(member, content);

            res.status(200).json({
                success: true,
                message: 'Email sent successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send email',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}