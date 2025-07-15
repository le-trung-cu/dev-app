# Dev App - Fullstack Project
## Giới thiệu

Đây là một dự án fullstack mô phỏng hệ thống quản lý công việc, Tạo file thiết kế canvas, chat nhóm.

### Video demo
[![Video Demo](https://img.youtube.com/vi/QQwTvX-13AU/hqdefault.jpg)](https://youtu.be/QQwTvX-13AU)

**Backend**
- nextjs app router, nextjs api, socket.io, honojs, prisma, sqlite.

**Frontend**
- **Sử dụng các thư viện tốt nhất trong react**:
  - Typescript, Nextjs, Tanstack Query , Tailwind CSS, shadcn/ui, date-fns (làm việc với date), nuqs (quản lý trạng thái thông qua url), quản lý trạng thái Zustand, Jotai (vì cho mục đích học tập nên các công nghệ có cùng chức năng sẽ được áp dụng, nhưng code được splitting để không bao ngồm 2 thư viện Zustand và Jotail trong cùng 1 root router)
  - React hook form, zod
- **Vertical slice archirecture**
  - Tách biệt logic vào bên trong các react hook.
- Bao gồm Server Side Rendering và Client Side Rendering
- Tổ chức mã thành từng feature folders.
- **Bao gồm nhiều use-case thực tế**:
  - Ininite scroll, search, filtering
  - Chức năng auto save (với debounce)
  - Chức năng Undo / Redo
  - Với ứng dụng nhắn tin:
    - Cập nhật cache, state real-time thông qua kết nối socket
    - tự động scroll đến tin nhắn mới
    - tự động tải thêm dữ tin nhắn cũ khi scroll lên trên cùng.
