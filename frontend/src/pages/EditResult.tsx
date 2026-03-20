import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function EditResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    note: '',
    price: '',
    sampling_point: [] as string[],
    date_time: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/history/${id}`)
      .then(res => res.json())
      .then(data => {
        let dtValue = '';
        
        // 💡 แก้บัค: ดึงเวลาแบบ Local ของไทย (DD/MM/YYYY HH:mm:ss) มาแปลงใส่ Input โดยไม่ผ่าน UTC ป้องกันเวลาเพี้ยน 7 ชั่วโมง
        const rawDate = data.date_time_sampling || data.create_date;
        if (rawDate && rawDate.includes('/')) {
            const parts = rawDate.split(' ');
            if (parts.length >= 2) {
                const dateParts = parts[0].split('/');
                const timeParts = parts[1].split(':');
                if (dateParts.length === 3) {
                    const year = dateParts[2];
                    const month = dateParts[1].padStart(2, '0');
                    const day = dateParts[0].padStart(2, '0');
                    const hour = timeParts[0].padStart(2, '0');
                    const minute = timeParts.length > 1 ? timeParts[1].padStart(2, '0') : "00";
                    dtValue = `${year}-${month}-${day}T${hour}:${minute}`;
                }
            }
        } else if (data.samplingDate) {
            // สำรองเผื่อกรณีที่แปลง Local ไม่สำเร็จ
            const d = new Date(data.samplingDate);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hour = String(d.getHours()).padStart(2, '0');
            const minute = String(d.getMinutes()).padStart(2, '0');
            dtValue = `${year}-${month}-${day}T${hour}:${minute}`;
        }

        setFormData({
          note: data.note || '',
          price: data.price || '',
          sampling_point: data.samplingPoint?.length > 0 ? data.samplingPoint : (data.sampling_point ? data.sampling_point.split(', ') : []),
          date_time: dtValue
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("ดึงข้อมูลมาแก้ไขไม่สำเร็จ:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: any) => {
    const { value, checked } = e.target;
    let updatedPoints = [...formData.sampling_point];
    if (checked) {
      updatedPoints.push(value);
    } else {
      updatedPoints = updatedPoints.filter(p => p !== value);
    }
    setFormData({ ...formData, sampling_point: updatedPoints });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        note: formData.note,
        price: Number(formData.price),
        sampling_point: formData.sampling_point.join(', '),
        samplingPoint: formData.sampling_point,
        date_time: formData.date_time,
        samplingDate: formData.date_time 
      };

      const response = await fetch(`http://localhost:3000/history/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate(`/result/${id}`);
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้");
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-xl font-bold text-center mb-6 text-black">
          Edit Inspection ID : {id}
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <form className="space-y-5">
            
            {/* Note */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Note</label>
              <input 
                type="text" 
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Price</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Sampling Point */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Sampling Point</label>
              <div className="flex items-center space-x-6 text-sm text-gray-700">
                {['Front End', 'Back End', 'Other'].map(point => (
                  <label key={point} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      value={point} 
                      checked={formData.sampling_point.includes(point)}
                      onChange={handleCheckboxChange} 
                      className="w-4 h-4 text-green-600 rounded border-gray-300 accent-green-600" 
                    />
                    <span>{point}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date/Time (แก้ไขเวลาเพี้ยนแล้ว) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Date/Time of Sampling</label>
              <input 
                type="datetime-local" 
                name="date_time"
                value={formData.date_time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Link to={`/result/${id}`} className="px-5 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded hover:bg-green-50 transition-colors">
                Cancel
              </Link>
              <button 
                type="button" 
                onClick={handleSubmit}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#1a7a4c] rounded hover:bg-green-800 transition-colors shadow-sm"
              >
                Submit
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}