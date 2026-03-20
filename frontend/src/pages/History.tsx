import { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState<any[]>([]);
  
  // 🚀 States สำหรับระบบค้นหา
  const [searchId, setSearchId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 🚀 States สำหรับระบบลบ (เก็บ ID ของแถวที่ถูกติ๊ก)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // ฟังก์ชันดึงข้อมูล (รองรับตัวแปร Query จาก Swagger)
  const fetchHistory = (query = '') => {
    fetch(`http://localhost:3000/history${query}`)
      .then(res => res.json())
      .then(data => {
        // 💡 รองรับทั้งแบบที่หุ้มด้วย data: [] และแบบ Array ปกติ
        if (data && data.data) {
          setHistoryList(data.data);
        } else if (Array.isArray(data)) {
          setHistoryList(data);
        } else {
          setHistoryList([]);
        }
      })
      .catch(err => console.error("ไม่สามารถดึงข้อมูลประวัติได้:", err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 🚀 ฟังก์ชัน: เมื่อกดปุ่ม Search (ใช้ Filter ของ Swagger)
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchId) params.append('inspectionID', searchId);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    fetchHistory(params.toString() ? `?${params.toString()}` : '');
  };

  // 🚀 ฟังก์ชัน: เมื่อกดปุ่ม Clear Filter
  const handleClear = () => {
    setSearchId('');
    setFromDate('');
    setToDate('');
    fetchHistory(); // ดึงข้อมูลกลับมาให้หมด
  };

  // 🚀 ฟังก์ชัน: เมื่อกดปุ่ม Delete (ส่ง inspectionID ไปตาม Swagger)
  const handleDelete = () => {
    if (selectedItems.length === 0) return;
    const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล ${selectedItems.length} รายการ?`);
    if (!confirmDelete) return;

    fetch('http://localhost:3000/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionID: selectedItems }) // 💡 ส่งไปเป็นคีย์ inspectionID
    })
    .then(res => {
        if(!res.ok) throw new Error("Delete failed");
        return res.text(); // Swagger ส่งกลับมาแค่คำว่า "Deleted successfully"
    })
    .then(() => {
      setSelectedItems([]); // เคลียร์การติ๊ก
      fetchHistory(); // โหลดตารางใหม่
    })
    .catch(err => console.error("ลบข้อมูลไม่สำเร็จ:", err));
  };

  // จัดการติ๊กถูกที่หัวตาราง (เลือกทั้งหมด)
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedItems(historyList.map(item => item.inspectionID || item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // จัดการติ๊กถูกที่แต่ละแถว
  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-6xl">
        
        {/* 🚀 ปุ่ม Create Inspection มุมขวาบน */}
        <div className="flex justify-end mb-4">
          <Link to="/create" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1a7a4c] rounded hover:bg-green-800 transition-colors shadow-sm">
            <span>+</span> Create Inspection
          </Link>
        </div>

        {/* ส่วนค้นหา */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">ID</label>
              <input 
                type="text" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Search with ID" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-600" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">From Date</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-green-600" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">To Date</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none focus:border-green-600" 
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button onClick={handleClear} className="text-red-500 text-xs font-bold hover:underline underline-offset-4 decoration-red-500">
              Clear Filter
            </button>
            <button onClick={handleSearch} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-[#1a7a4c] rounded hover:bg-green-800 transition-colors shadow-sm">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* 🚀 แถบปุ่ม Delete จะโผล่มาเมื่อมีการติ๊กถูกอย่างน้อย 1 รายการ */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 bg-white border border-green-600 rounded hover:bg-green-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <span className="text-sm text-gray-700 font-medium">
              Select items: {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* ตารางแสดงข้อมูล */}
        <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a7a4c] text-white text-sm">
                <th className="py-3 px-4 font-medium w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={historyList.length > 0 && selectedItems.length === historyList.length}
                    className="rounded border-gray-300 w-4 h-4 cursor-pointer accent-green-600" 
                  />
                </th>
                <th className="py-3 px-4 font-medium">Create Date - Time</th>
                <th className="py-3 px-4 font-medium">Inspection ID</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Standard</th>
                <th className="py-3 px-4 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No inspection history found.
                  </td>
                </tr>
              ) : (
                historyList.map((row) => {
                  const idField = row.inspectionID || row.id;
                  return (
                    <tr key={idField} className="border-b border-gray-200 hover:bg-gray-50 text-sm text-gray-800 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(idField)}
                          onChange={() => handleSelectItem(idField)}
                          className="rounded border-gray-300 w-4 h-4 cursor-pointer accent-green-600" 
                        />
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/result/${idField}`)}>
                        <span className="block hover:text-green-600">{row.create_date || row.createDate}</span>
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/result/${idField}`)}>
                        <span className="block hover:text-green-600">{idField}</span>
                      </td>
                      <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/result/${idField}`)}>
                        <span className="block hover:text-green-600">{row.name}</span>
                      </td>
                      
                      {/* 💡 แก้ไขตรงนี้: บังคับให้แสดงคำว่า Standard ตามด้วยตัวเลข ID เลย */}
                      <td className="py-3 px-4 cursor-pointer" onClick={() => navigate(`/result/${idField}`)}>
                        <span className="block hover:text-green-600">Standard {row.standardID || row.standard_id}</span>
                      </td>
                      
                      <td className="py-3 px-4 text-gray-500">{row.note || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          
          <div className="flex justify-start items-center p-4 text-xs font-medium text-gray-600 gap-4">
            <span>Total: {historyList.length} records</span>
          </div>
        </div>

      </div>
    </div>
  );
}