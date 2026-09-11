const https = require("https");

const sql = `
DELETE FROM public.equipment;

INSERT INTO public.equipment (name, category, description, image_url, total_quantity, available_quantity, damaged_quantity, location)
VALUES 
('ลูกบาสเกตบอล Molten BG3800 เบอร์ 7', 'basketball', 'ลูกบาสเกตบอลหนัง PU คุณภาพสูง สำหรับแข่งขันและฝึกซ้อม', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', 10, 10, 0, 'ตู้ A-01'),
('ลูกฟุตบอล Molten Vantaggio 5000', 'football', 'ลูกฟุตบอลหนังเย็บอย่างดี มาตรฐานแข่งขัน เบอร์ 5', 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80', 12, 12, 0, 'ตู้ A-02'),
('ชุดไม้แบดมินตัน Yonex + ลูกขนไก่', 'badminton', 'ไม้แบดมินตันพร้อมเอ็น และลูกขนไก่ 1 หลอด', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80', 8, 8, 0, 'ตู้ B-01'),
('ลูกวอลเลย์บอล Mikasa V200W', 'volleyball', 'ลูกวอลเลย์บอลแข่งขันอย่างเป็นทางการ นุ่ม ถนอมมือ', 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&q=80', 6, 6, 0, 'ตู้ A-03'),
('ชุดไม้เทเบิลเทนนิส Butterfly + ลูกปิงปอง', 'tabletennis', 'ไม้ปิงปอง 2 ด้าม พร้อมลูกปิงปอง 3 ลูก', 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80', 5, 5, 0, 'ตู้ B-02'),
('กรวยฝึกซ้อมกีฬา 12 นิ้ว (ชุด 6 อัน)', 'training', 'กรวยมาร์กเกอร์สีส้มสดใส สำหรับฝึกความคล่องตัว', 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&q=80', 15, 15, 0, 'ตู้ C-01');
`;

const data = JSON.stringify({ query: sql });

const req = https.request({
  hostname: "api.supabase.com",
  path: "/v1/projects/ukklvfeuwndspvhtokdg/database/query",
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || ""}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data, "utf8")
  }
}, (res) => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log("Seeding finished with status:", res.statusCode);
    if (res.statusCode >= 400) console.error("Error response:", body);
  });
});

req.on("error", (e) => console.error(e));
req.write(data, "utf8");
req.end();
