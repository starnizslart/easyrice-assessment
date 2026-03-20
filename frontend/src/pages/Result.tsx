import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Result() {
  const { id } = useParams(); // รับ ID จาก URL
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ยิงไปขอข้อมูลจาก Backend ตาม ID
    fetch(`http://localhost:3000/history/${id}`)
      .then(res => res.json())
      .then(result => {
        // แปลงข้อมูล Composition และ Defect ที่ถูกเซฟเป็น String ให้กลับมาเป็น Array
        const parsedData = {
          ...result,
          composition_data: JSON.parse(result.composition_data || '[]'),
          defect_data: JSON.parse(result.defect_data || '[]')
        };
        setData(parsedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("ดึงข้อมูล Result ไม่สำเร็จ:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>;
  if (!data) return <div className="text-center py-20 text-red-500">ไม่พบข้อมูลการตรวจสอบ ID: {id}</div>;

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Inspection
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* คอลัมน์ซ้าย: รูปภาพและปุ่ม */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="bg-black rounded-lg aspect-[3/4] overflow-hidden flex items-center justify-center border border-gray-200">
              <span className="text-gray-500 text-sm">Rice Image Preview</span>
            </div>
            <div className="flex justify-end gap-2">
              <Link to="/history" className="px-6 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded hover:bg-green-50 transition-colors">
                Back
              </Link>
              <Link to={`/edit/${data.id}`} className="px-6 py-2 text-sm font-semibold text-white bg-[#1a7a4c] rounded hover:bg-green-800 transition-colors shadow-sm">
                Edit
              </Link>
            </div>
          </div>

          {/* คอลัมน์ขวา: ข้อมูลและตาราง */}
          <div className="w-full md:w-2/3 flex flex-col gap-4">
            
            {/* ข้อมูลเบื้องต้น */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Create Date - Time</p>
                <p className="font-semibold text-gray-800">{data.create_date}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Inspection ID:</p>
                <p className="font-semibold text-gray-800">{data.id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Standard:</p>
                <p className="font-semibold text-gray-800">Standard {data.standard_id}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Sample:</p>
                <p className="font-semibold text-gray-800">{data.total_sample} kernal</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Update Date - Time:</p>
                <p className="font-semibold text-gray-800">{data.update_date || data.create_date}</p>
              </div>
            </div>

            {/* 🚀 อัปเดต: จับ Note, Price, Date/Time, Sampling Point มาจัดให้อยู่ในกล่องเดียวกัน */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Note</p>
                  <p className="text-sm font-semibold text-gray-800">{data.note || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Price</p>
                  <p className="text-sm font-semibold text-gray-800">{data.price ? `${data.price}` : "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Date/Time of Sampling</p>
                  <p className="text-sm font-semibold text-gray-800">{data.date_time_sampling || data.create_date || "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Sampling Point</p>
                  <p className="text-sm font-semibold text-gray-800">{data.sampling_point || "-"}</p>
                </div>
              </div>
            </div>

            {/* ตาราง Composition */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Composition</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-medium">
                    <th className="py-2 px-3 rounded-l">Name</th>
                    <th className="py-2 px-3">Length</th>
                    <th className="py-2 px-3 rounded-r text-right">Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.composition_data.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 px-3">{item.name}</td>
                      <td className="py-3 px-3 text-gray-600">{item.length}</td>
                      <td className="py-3 px-3 text-right text-green-600 font-semibold">{item.actual} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ตาราง Defect Rice */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Defect Rice</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-medium">
                    <th className="py-2 px-3 rounded-l">Name</th>
                    <th className="py-2 px-3 rounded-r text-right">Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.defect_data.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 capitalize">{item.name}</td>
                      <td className="py-3 px-3 text-right text-green-600 font-semibold">{item.actual} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}