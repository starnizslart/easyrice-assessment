import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateInspection from './pages/CreateInspection';
import History from './pages/History';
import Result from './pages/Result';
import EditResult from './pages/EditResult';

export default function App() {
  return (
    <BrowserRouter>
      {/* ใช้ bg-gray-50 เป็นพื้นหลังของเว็บทั้งเว็บ */}
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* แถบเมนูด้านบน จะแสดงทุกหน้า */}
        <Navbar />
        
        {/* พื้นที่สำหรับแสดงเนื้อหาแต่ละหน้า */}
        <main className="p-6">
          <Routes>
            {/* 🚀 ให้หน้าแรก (/) เป็นหน้า History ตามที่คุณต้องการ */}
            <Route path="/" element={<History />} />
            
            {/* 🚀 ให้หน้า /create ไปเรียกหน้า Create Inspection ของจริงมาแสดง */}
            <Route path="/create" element={<CreateInspection />} />
            
            <Route path="/history" element={<History />} />
            
            {/* ใส่ :id เพื่อให้รองรับ URL เช่น /result/123 หรือ /edit/123 */}
            <Route path="/result/:id" element={<Result />} />
            <Route path="/edit/:id" element={<EditResult />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}