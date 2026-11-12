/* BasketSpot – mock data (thay bằng API khi có Backend) */
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00 → 22:00
const RANGES = { any: [6, 21], am: [6, 11], pm: [12, 17], ev: [18, 21] };
const TAKEN = new Set(); // các slot vừa đặt trong phiên demo

const COURTS = [
  { id: 1, name: 'Sân Cụm A – Tân Bình', addr: '123 Nguyễn Văn Trỗi, Q. Tân Bình', area: 'Tân Bình', type: '5v5', price: 400000, busy: 45, c: ['#ff6b2c', '#7a2b0c'], desc: 'Sân trong nhà tiêu chuẩn 5v5, sàn gỗ ánh sáng LED, khán đài nhỏ cho đội cổ vũ.', feat: ['Sàn gỗ chuyên dụng', 'Điều hòa', 'Phòng thay đồ', 'Bãi xe máy'] },
  { id: 2, name: 'Thủ Dầu Một Arena', addr: '88 Yersin, TP. Thủ Dầu Một', area: 'Thủ Dầu Một', type: '5v5', price: 300000, busy: 35, c: ['#e8541a', '#4a1a0a'], desc: 'Sân rộng rãi, giá mềm cho nhóm bạn và giải phong trào cuối tuần.', feat: ['Đèn LED', 'Nước uống', 'Bãi xe ô tô', 'Wifi'] },
  { id: 3, name: 'Hoop Garden Quận 7', addr: '45 Nguyễn Thị Thập, Quận 7', area: 'Quận 7', type: '3x3', price: 300000, busy: 55, c: ['#ff9b54', '#6b2a0e'], desc: 'Sân 3x3 phong cách street, phù hợp tập kèo nhanh và luyện ném.', feat: ['Rổ chuẩn FIBA 3x3', 'Mái che', 'Quầy nước'] },
  { id: 4, name: 'Gò Vấp Dunk Zone', addr: '210 Quang Trung, Q. Gò Vấp', area: 'Gò Vấp', type: '3x3', price: 320000, busy: 40, c: ['#ff7a3d', '#5a1f08'], desc: 'Sân 3x3 trong nhà, không lo mưa, mở cửa sớm từ 06:00.', feat: ['Trong nhà', 'Điều hòa', 'Ghế nghỉ'] },
  { id: 5, name: 'Thủ Đức Skyline', addr: '15 Võ Văn Ngân, TP. Thủ Đức', area: 'Thủ Đức', type: '5v5', price: 380000, busy: 50, c: ['#f55d20', '#6e2509'], desc: 'Sân 5v5 sát trường đại học, đông kèo tối và cuối tuần.', feat: ['Sàn gỗ', 'Bảng điểm điện tử', 'Phòng thay đồ'] },
  { id: 6, name: 'Bình Thạnh Court B', addr: '72 Điện Biên Phủ, Q. Bình Thạnh', area: 'Bình Thạnh', type: '3x3', price: 350000, busy: 30, c: ['#ff8a47', '#52210c'], desc: 'Sân 3x3 trung tâm, dễ di chuyển, giá thuê linh hoạt theo giờ.', feat: ['Trung tâm', 'Đèn buổi tối', 'Bãi xe'] }
];

/* Slot "đã đặt" được sinh ổn định theo sân + ngày + giờ để demo nhất quán */
function booked(c, d, h) {
  if (TAKEN.has(`${c.id}|${d}|${h}`)) return true;
  const n = new Date(), t = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  if (d === t && h <= n.getHours()) return true;
  return (c.id * 131 + +d.slice(5, 7) * 17 + +d.slice(8) * 29 + h * 53) % 100 < c.busy;
}
function freeCount(c, d, r = RANGES.any) {
  return HOURS.filter(h => h >= r[0] && h <= r[1] && !booked(c, d, h)).length;
}
