# Member Management API 測試指南

## 啟動應用程序

```bash
# 開發模式（含熱重載）
pnpm dev

# 或建構後執行
pnpm build
pnpm start
```

## API 端點測試

### 1. 健康檢查
```bash
curl http://localhost:3000/health
```

### 2. 建立會員
```bash
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{
    "account": "john_doe",
    "password": "securepassword123",
    "email": "john@example.com",
    "lineID": "john_line",
    "name": "John Doe",
    "address": "123 Main St, City"
  }'
```

### 3. 取得所有會員
```bash
curl http://localhost:3000/members
```

### 4. 取得特定會員
```bash
curl http://localhost:3000/members/john_doe
```

### 5. 啟用會員
```bash
curl -X POST http://localhost:3000/members/activate \
  -H "Content-Type: application/json" \
  -d '{"id": "john_doe"}'
```

### 6. 停權會員
```bash
curl -X POST http://localhost:3000/members/deactivation \
  -H "Content-Type: application/json" \
  -d '{"id": "john_doe"}'
```

### 7. 更新會員資料
```bash
curl -X PUT http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{
    "account": "john_doe",
    "name": "John Smith",
    "address": "456 New Address"
  }'
```

### 8. 驗證會員 Email
```bash
curl -X POST http://localhost:3000/members/john_doe/verify
```

### 9. 發送郵件給會員
```bash
curl -X POST http://localhost:3000/members/john_doe/send-email \
  -H "Content-Type: application/json" \
  -d '{"content": "Welcome to our platform!"}'
```

### 10. 刪除會員
```bash
curl -X DELETE http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{"ids": ["john_doe"]}'
```

## 回應格式

所有 API 回應都採用統一格式：

### 成功回應
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功訊息"
}
```

### 錯誤回應
```json
{
  "success": false,
  "message": "錯誤訊息",
  "error": "詳細錯誤資訊"
}
```

## 業務規則

1. **會員註冊**：建立會員後會自動發送驗證郵件
2. **Email 驗證**：會員需要通過 Email 驗證才能成為正式會員
3. **停權通知**：停權會員時會自動發送通知郵件
4. **權限控制**：非正式會員操作受限
5. **帳號唯一性**：會員帳號必須唯一

## 架構特色

- **DDD 分層架構**：清楚分離業務邏輯、應用層和基礎設施層
- **依賴注入**：使用 TSyringe 實現控制反轉
- **接口驅動**：通過接口定義契約，便於測試和替換實現
- **錯誤處理**：統一的錯誤處理機制
