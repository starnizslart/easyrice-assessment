import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  // ฟังก์ชันเช็คว่าตอนนี้อยู่หน้าไหน เพื่อแสดงตัวหนาและเส้นใต้สีเขียว
  const isActive = (path: string) => {
    // ถ้าอยู่ที่ / หรือ /history ให้เมนู History ทำงาน (เป็นสีเขียว)
    if (path === '/history' && (location.pathname === '/history' || location.pathname === '/')) {
      return 'text-green-700 font-bold border-b-2 border-green-700 pb-1 transition-colors';
    }
    return 'text-gray-500 hover:text-green-600 transition-colors';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <span className="text-lg font-bold tracking-wide text-black uppercase">
              EASYRICE TEST
            </span>
            
            <div className="flex space-x-6 ml-4 pt-1 text-sm">
              {/* 🚀 ลบ Create Form ออกแล้ว เหลือแค่ History อันเดียว */}
              <Link to="/history" className={isActive('/history')}>
                History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}