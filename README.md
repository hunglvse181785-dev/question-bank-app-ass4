# Simple Quiz API

Backend sử dụng Express, MongoDB và Mongoose. Dự án được tạo bằng Express Generator. Các API trả về JSON.

## Cách chạy trên Windows

1. Cài Node.js và MongoDB.
2. Bảo đảm dịch vụ MongoDB đang chạy.
3. Mở terminal tại thư mục question-bank-app.
4. Chạy: npm install
5. Chạy: copy .env.example .env
6. Chạy: npm start

Server: https://localhost:3443  
API base URL: https://localhost:3443/api  
Database: SimpleQuiz

Có thể dùng npm run dev để tự khởi động lại khi sửa code.

## Biến môi trường

PORT=3443  
MONGODB_URI=mongodb://127.0.0.1:27017/SimpleQuiz  
API_BASE_URL=https://localhost:3443/api

## API

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /api/quizzes | Lấy tất cả quiz kèm câu hỏi |
| POST | /api/quizzes | Tạo quiz |
| GET | /api/quizzes/:quizId | Lấy quiz theo ID |
| PUT | /api/quizzes/:quizId | Cập nhật quiz |
| DELETE | /api/quizzes/:quizId | Xóa quiz |
| GET | /api/questions | Lấy tất cả câu hỏi |
| POST | /api/questions | Tạo câu hỏi |
| GET | /api/questions/:questionId | Lấy câu hỏi theo ID |
| PUT | /api/questions/:questionId | Cập nhật câu hỏi |
| DELETE | /api/questions/:questionId | Xóa câu hỏi |
| GET | /api/quizzes/:quizId/populate | Lọc câu hỏi chứa từ capital |
| POST | /api/quizzes/:quizId/question | Tạo và thêm một câu hỏi vào quiz |
| POST | /api/quizzes/:quizId/questions | Tạo và thêm nhiều câu hỏi vào quiz |
| POST | /api/auth/register | Đăng ký tài khoản thường |
| POST | /api/auth/login | Đăng nhập và nhận bearer token |
| GET | /api/users | Admin lấy danh sách người dùng |

## Kiểm tra bằng Postman

Import file `Assignment 3 - User Authentication.postman_collection.json` để kiểm tra phân quyền Assignment 3. Collection Assignment 2 cũ vẫn có thể dùng để kiểm tra API cơ bản.

Token cần biến `AUTH_TOKEN_SECRET` trong `.env`; không chia sẻ giá trị này. Đăng ký tài khoản qua request `Register ordinary user`, sau đó đăng nhập để collection tự lưu `userToken`. Để thử quyền Admin, đăng ký thêm tài khoản bằng thông tin Admin trong collection, đặt `admin: true` cho tài khoản đó trong MongoDB, rồi chạy request `Login Admin` để lưu `adminToken`. API đăng ký không cho phép người dùng tự cấp quyền Admin.

Trong Postman, `baseUrl` mặc định là `https://localhost:3443/api`. Nếu dùng collection Assignment 2 cũ, hãy cập nhật URL và endpoint câu hỏi theo bảng API ở trên.

Chạy request 03 để tạo quiz, request 04 để tạo câu hỏi. Lấy \_id mới trong kết quả và thay vào URL các request liên quan:

- ID quiz dùng cho đường dẫn /api/quizzes/:quizId.
- ID câu hỏi dùng cho đường dẫn /api/questions/:questionId.

Các ID có sẵn trong collection đã bị xóa khi kiểm tra, nên cần thay bằng ID mới trước khi chạy lại.

Thứ tự chạy: 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 12 → 13 → 05 → 11 → 10 → 09.

Chạy hai request DELETE cuối cùng. Mỗi lần gửi POST thành công sẽ tạo dữ liệu mới.

## Ghi chú

- correctAnswerIndex tính từ 0.
- Request 13 nhận Body là mảng JSON gồm các câu hỏi.
- Xóa quiz giữ lại các câu hỏi.
- Xóa câu hỏi sẽ gỡ tham chiếu của nó khỏi các quiz.
- GET hoặc DELETE một ID đã bị xóa trả về 404.
