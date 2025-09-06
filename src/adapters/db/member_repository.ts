import { injectable } from 'tsyringe';
import { Member } from '../../model/member';
import { MemberRepository } from '../../handler/ports/member_repository';

@injectable()
export class InMemoryMemberRepository implements MemberRepository {
    private members: Member[] = [];

    async getMembers(): Promise<Member[]> {
        return [...this.members];
    }

    async getMember(id: string): Promise<Member | null> {
        const member = this.members.find(m => m.account === id);
        return member || null;
    }

    async createMember(member: Member): Promise<Member> {
        // 檢查帳號是否已存在
        const existingMember = await this.getMember(member.account);
        if (existingMember) {
            throw new Error('Member with this account already exists');
        }

        // 建立新的 Member 實例
        const newMember = new Member(
            member.account,
            member.password,
            member.email,
            member.lineID,
            member.name,
            member.address,
            member.role,
            member.isVerified,
            member.isActive
        );

        this.members.push(newMember);
        return newMember;
    }

    async updateMember(member: Member): Promise<Member> {
        const index = this.members.findIndex(m => m.account === member.account);
        if (index === -1) {
            throw new Error('Member not found');
        }

        this.members[index] = member;
        return this.members[index];
    }

    async deleteMember(id: string): Promise<void> {
        const index = this.members.findIndex(m => m.account === id);
        if (index === -1) {
            throw new Error('Member not found');
        }

        this.members.splice(index, 1);
    }

    async activateMember(id: string): Promise<void> {
        const member = await this.getMember(id);
        if (!member) {
            throw new Error('Member not found');
        }

        member.activate();
        await this.updateMember(member);
    }

    async deactivateMember(id: string): Promise<void> {
        const member = await this.getMember(id);
        if (!member) {
            throw new Error('Member not found');
        }

        member.suspend();
        await this.updateMember(member);
    }
}