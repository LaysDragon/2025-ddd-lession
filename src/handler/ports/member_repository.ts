import { Member } from "../../model/member";

export interface MemberRepository {
    getMembers(): Promise<Member[]>;
    getMember(id: string): Promise<Member | null>;
    createMember(member: Member): Promise<Member>;
    updateMember(member: Member): Promise<Member>;
    deleteMember(id: string): Promise<void>;
    activateMember(id: string): Promise<void>;
    deactivateMember(id: string): Promise<void>;
}