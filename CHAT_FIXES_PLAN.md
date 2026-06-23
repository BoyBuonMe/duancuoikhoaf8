# Plan: Sửa bug chat support + auto-kill conversation

Tài liệu này mô tả kế hoạch sửa các bug liên quan tới support chat và thêm
tính năng tự động đóng (kill) đoạn chat sau 10 phút không hoạt động.

## Bối cảnh

- BE: `BE/src/models/chat/` (routes / controller / service / repository / realtime).
- FE user widget: `FE/src/components/chat/ChatWidget.tsx`, `SupportChatPanel.tsx`,
  `AiChatPanel.tsx`, hook `FE/src/features/chat/hooks/useUserChat.ts`.
- FE admin widget: `FE/src/components/chat/AdminChatWidget.tsx`,
  hook `FE/src/features/chat/hooks/useAdminSupportInbox.ts`.

---

## Bug 1 — Admin render trùng 1 conversation (2 lần)

### Nguyên nhân gốc
- `createSupportConversation` (`BE/src/models/chat/chat.service.ts`) **luôn tạo
  mới** một conversation mỗi lần được gọi, khác với AI dùng cơ chế
  get-or-create (`getOrCreateAiConversation`).
- Phía user, `SupportChatPanel` gọi `bootstrap()` trong `useEffect`. Ở chế độ
  dev, **React StrictMode** mount effect 2 lần ⇒ `createSupportConversationApi`
  chạy 2 lần ⇒ tạo 2 conversation ⇒ admin list hiển thị 2 dòng.
- Cộng hưởng với Bug 2 (mỗi lần chuyển tab tạo conversation mới) làm số lượng
  conversation rác càng nhiều.

### Hướng sửa (BE)
1. Thêm `findLatestActiveSupportConversation(userId)` vào
   `chat.repository.ts`: tìm conversation `type: "support"`,
   `status: { $ne: "closed" }` của user, sort `lastMessageAt` giảm dần.
2. Đổi `createSupportConversation` thành **`getOrCreateSupportConversation`**
   trong `chat.service.ts`:
   - Nếu đã có conversation support đang mở/assigned ⇒ trả về cái đó.
   - Nếu chưa có ⇒ mới tạo.
3. Controller `createSupportConversation` gọi service mới (giữ nguyên route
   `POST /api/chat/support/conversations`, vẫn trả `{ conversation }`).

> Sau bước này, dù bootstrap chạy 2 lần do StrictMode thì vẫn chỉ có 1
> conversation được dùng lại ⇒ admin chỉ thấy 1 dòng.

### Kết quả mong đợi
- Mỗi user chỉ có tối đa 1 conversation support đang hoạt động tại một thời điểm.
- Admin list không còn dòng trùng.

---

## Bug 2 — Chuyển tab AI ↔ Support tạo conversation mới mỗi lần

### Nguyên nhân gốc
- `ChatWidget.tsx` render kiểu `tab === "ai" ? <AiChatPanel/> : <SupportChatPanel/>`.
  Khi đổi tab, panel cũ **unmount**, panel mới **mount** lại từ đầu ⇒
  `useEffect bootstrap()` chạy lại ⇒ tạo/khởi tạo lại conversation.
- Với support, kết hợp Bug 1 (luôn create mới) ⇒ mỗi lần quay lại tab Support là
  một conversation mới.

### Hướng sửa (FE)
1. **BE get-or-create** (đã làm ở Bug 1) là điều kiện cần: dù mount lại,
   `bootstrap()` sẽ nhận lại đúng conversation cũ thay vì tạo mới.
2. **Persist conversation id ở client** để tránh gọi lại API không cần thiết và
   để khôi phục khi mở lại widget:
   - Trong `useUserChat.ts` (`useUserSupportChat`), lưu `conversation.id` vào
     `localStorage` (key ví dụ `support:conversationId`).
   - Khi `bootstrap()`:
     - Nếu có id trong storage ⇒ gọi `listSupportMessagesApi(id)` để nạp lại
       (không tạo mới). Nếu BE trả 404/closed ⇒ xoá storage và get-or-create lại.
     - Nếu không có id ⇒ get-or-create như bình thường.
3. **Không bootstrap lại mỗi lần chuyển tab**: bỏ cờ `started` cục bộ theo panel,
   chuyển logic “đã khởi tạo chưa” lên mức bền hơn (storage) hoặc giữ panel mounted
   (xem mục Close bên dưới — dùng CSS ẩn thay vì unmount).

### Kết quả mong đợi
- Chuyển qua lại AI/Support không sinh thêm conversation.
- Tab Support luôn hiện đúng đoạn chat đang mở.

---

## Cải tiến nút X (Close) — chỉ ẩn & lưu, mở lại đúng conversation

### Hiện trạng
- `ChatWidget` dùng state `open` cục bộ. Khi đóng, toàn bộ panel unmount; khi mở
  lại, mount mới ⇒ (cùng Bug 1/2) dễ tạo conversation mới.

### Hướng sửa (FE)
1. Khi bấm X: chỉ **ẩn widget** (set `open = false`), **không** gọi API close,
   **không** reset conversation id.
2. `conversation.id` đã được persist ở `localStorage` (mục Bug 2). Khi mở lại
   widget, panel khôi phục từ storage ⇒ cùng một conversation.
3. (Tuỳ chọn) Cân nhắc giữ panel **luôn mounted** và ẩn bằng `hidden`/CSS thay vì
   unmount, để tránh re-bootstrap. Nếu làm vậy, vẫn nên persist id để sống sót qua
   reload trang.
4. Phân biệt rõ:
   - **X (user)** = ẩn xuống widget, lưu lại, KHÔNG đóng conversation.
   - **Auto-kill / admin delete** = mới thực sự đóng/xoá conversation.

### Kết quả mong đợi
- Bấm X rồi mở lại ⇒ vẫn là conversation cũ với đầy đủ tin nhắn.

---

## Tính năng mới — Auto-kill conversation sau 10 phút không hoạt động

### Yêu cầu
- Nếu sau 10 phút user không còn chat với support (không có message mới) thì
  conversation tự động bị đóng (kill).

### Hướng làm (BE) — dùng scheduler định kỳ
Mô phỏng theo `BE/src/jobs/voucher-notification.scheduler.ts`.

1. **Repository** (`chat.repository.ts`): thêm
   `closeStaleSupportConversations(olderThan: Date)`:
   - `updateMany({ type: "support", status: { $ne: "closed" }, lastMessageAt: { $lt: olderThan } }, { $set: { status: "closed" } })`.
   - Trả về danh sách id vừa đóng (để emit realtime) — có thể `find` trước rồi
     `updateMany`, hoặc dùng `find` lấy id rồi update theo id.
2. **Job** mới `BE/src/jobs/support-auto-close.job.ts`:
   - `runSupportAutoClose()`:
     - `const cutoff = new Date(Date.now() - 10*60*1000)`.
     - Lấy danh sách conversation stale, đóng chúng.
     - Với mỗi conversation đã đóng: gọi realtime báo cho FE
       (ví dụ thêm `emitConversationClosed(conversationId)` trong
       `chat.realtime.ts`, emit event `conversation.updated` hoặc
       `conversation.closed` trên cả `private-support.<id>` và
       `private-admin-inbox`).
3. **Scheduler** `BE/src/jobs/support-auto-close.scheduler.ts`:
   - `startSupportAutoCloseScheduler()` chạy `runSupportAutoClose()` mỗi
     ~1 phút (`setInterval`), có try/catch + log như voucher scheduler.
   - Lý do chạy mỗi phút: để độ trễ đóng tối đa ~1 phút quanh mốc 10 phút.
4. **Bootstrap**: gọi `startSupportAutoCloseScheduler()` trong `BE/server.ts`
   (cạnh `startVoucherNotificationScheduler()`).

### FE phản ứng khi bị auto-close
- `useSupportRealtime` đã có chỗ lắng nghe; bổ sung xử lý event
  `conversation.updated`/`conversation.closed`:
  - User panel: khi conversation chuyển `closed`, hiện trạng thái “ticket đã đóng”
    và (tuỳ chọn) xoá `localStorage` id để lần sau mở sẽ tạo conversation mới.
  - Admin inbox: refresh list để cập nhật trạng thái.
- Nếu Soketi offline: cơ chế polling hiện có sẽ tự cập nhật trạng thái khi
  list/messages được nạp lại.

### Lưu ý
- `lastMessageAt` đã được cập nhật ở mỗi lần gửi message (user/admin) trong
  `sendSupportMessage` ⇒ dùng làm mốc “hoạt động” là chính xác.
- Việc auto-close không xoá dữ liệu, chỉ đổi `status = "closed"` (khác với nút
  Delete của admin là xoá hẳn).

---

## Thứ tự thực hiện đề xuất

1. BE: get-or-create support conversation (sửa Bug 1, nền cho Bug 2).
2. FE: persist conversation id + bootstrap dùng lại (sửa Bug 2 + Close).
3. FE: chỉnh hành vi nút X (chỉ ẩn, không reset).
4. BE: job + scheduler auto-close 10 phút + realtime emit.
5. FE: xử lý event close/refresh khi conversation bị auto-close.
6. Kiểm thử (xem dưới).

## Checklist kiểm thử

- [ ] User mở Support lần đầu ⇒ tạo đúng 1 conversation; admin thấy đúng 1 dòng.
- [ ] User chuyển AI ↔ Support nhiều lần ⇒ không sinh conversation mới.
- [ ] User bấm X rồi mở lại ⇒ vẫn đúng conversation cũ, còn nguyên tin nhắn.
- [ ] Reload trang ⇒ vẫn khôi phục đúng conversation từ storage.
- [ ] Không nhắn gì trong 10 phút ⇒ conversation tự chuyển `closed`; user thấy
      thông báo đã đóng; admin list cập nhật.
- [ ] Admin Delete vẫn xoá hẳn (khác auto-close chỉ đóng).
- [ ] `tsc --noEmit` pass ở cả BE và FE; lint không phát sinh lỗi mới.

## Các file dự kiến đụng tới

**BE**
- `src/models/chat/chat.repository.ts` (find latest active, close stale)
- `src/models/chat/chat.service.ts` (get-or-create support)
- `src/models/chat/chat.realtime.ts` (emit closed)
- `src/jobs/support-auto-close.job.ts` (mới)
- `src/jobs/support-auto-close.scheduler.ts` (mới)
- `server.ts` (start scheduler)

**FE**
- `src/features/chat/hooks/useUserChat.ts` (persist + restore conversation)
- `src/features/chat/hooks/useSupportRealtime.ts` (xử lý closed nếu cần)
- `src/components/chat/ChatWidget.tsx` (X chỉ ẩn; cân nhắc giữ mounted)
- `src/components/chat/SupportChatPanel.tsx` (trạng thái đóng)
