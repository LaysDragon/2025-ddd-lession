import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { container } from 'tsyringe';
import { MemberHandler } from './handler/member_handlers';
import { InMemoryMemberRepository } from './adapters/db/member_repository';
import { MockEmailService } from './adapters/db/email';
import { MemberRepository } from './handler/ports/member_repository';
import { EmailService } from './handler/ports/email';

// DI 容器註冊
container.register<MemberRepository>('MemberRepository', {
    useClass: InMemoryMemberRepository
});

container.register<EmailService>('EmailService', {
    useClass: MockEmailService
});

// 創建 Express 應用
const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 取得 Handler 實例
const memberHandler = container.resolve(MemberHandler);

// API 路由
app.get('/members', (req: Request, res: Response) => memberHandler.getMembers(req, res));
app.get('/members/:id', (req: Request, res: Response) => memberHandler.getMember(req, res));
app.post('/members', (req: Request, res: Response) => memberHandler.createMember(req, res));
app.post('/members/activate', (req: Request, res: Response) => memberHandler.activateMember(req, res));
app.post('/members/deactivation', (req: Request, res: Response) => memberHandler.deactivateMember(req, res));
app.put('/members', (req: Request, res: Response) => memberHandler.updateMember(req, res));
app.delete('/members', (req: Request, res: Response) => memberHandler.deleteMembers(req, res));

// 額外的路由
app.post('/members/:id/verify', (req: Request, res: Response) => memberHandler.verifyEmail(req, res));
app.post('/members/:id/send-email', (req: Request, res: Response) => memberHandler.sendEmailToMember(req, res));

// 健康檢查端點
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Member Management System is running'
    });
});

// 錯誤處理中間件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 處理
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 Member Management System is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API endpoints:`);
    console.log(`   GET    /members`);
    console.log(`   GET    /members/:id`);
    console.log(`   POST   /members`);
    console.log(`   POST   /members/activate`);
    console.log(`   POST   /members/deactivation`);
    console.log(`   PUT    /members`);
    console.log(`   DELETE /members`);
    console.log(`   POST   /members/:id/verify`);
    console.log(`   POST   /members/:id/send-email`);
});

export default app;
