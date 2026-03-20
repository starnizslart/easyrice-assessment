import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CreateInspection() {
  const navigate = useNavigate();
  const [standards, setStandards] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    standard_id: '',
    note: '',
    price: '',
    sampling_point: [] as string[],
    date_time: '' // 💡 เปิดรับ date_time อีกครั้ง
  });

  const [fileName, setFileName] = useState('');
  const [rawFileContent, setRawFileContent] = useState<any>(null);

  const [errors, setErrors] = useState({
    name: false,
    standard_id: false,
    file: false
  });

  useEffect(() => {
    fetch('http://localhost:3000/standard')
      .then(res => res.json())
      .then(data => setStandards(data))
      .catch(err => console.error("ดึงข้อมูล Standard ไม่สำเร็จ:", err));
  }, []);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: false });
    }
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

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setErrors({ ...errors, file: false }); 

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        setRawFileContent(jsonContent);
      } catch (error) {
        alert("ไฟล์ที่อัปโหลดไม่ใช่รูปแบบ JSON ที่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      standard_id: !formData.standard_id,
      file: !rawFileContent
    };
    
    setErrors(newErrors);

    if (newErrors.name || newErrors.standard_id || newErrors.file) {
      return; 
    }

    if (formData.price) {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0 || priceNum > 100000) {
        alert("Price ต้องเป็นตัวเลขระหว่าง 0 - 100,000 เท่านั้น");
        return;
      }
    }

    try {
      const payload = {
        name: formData.name,
        standard_id: formData.standard_id,
        standardID: formData.standard_id, 
        note: formData.note,
        price: Number(formData.price) || 0, 
        sampling_point: formData.sampling_point.join(', '), 
        samplingPoint: formData.sampling_point, 
        date_time: formData.date_time,       // 💡 แนบค่าเวลาส่งไปด้วย
        samplingDate: formData.date_time,    // 💡 แนบค่าเวลาตามชื่อตัวแปร Swagger ส่งไปด้วย
        raw_data: rawFileContent 
      };

      const response = await fetch('http://localhost:3000/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/history');
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์หลังบ้านได้");
    }
  };

  return (
    <div className="flex justify-center py-10">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Create Inspection
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <form className="space-y-5">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Name*</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Please Holder" 
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-green-600'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">required</p>}
            </div>

            {/* Standard */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Standard*</label>
              <select 
                name="standard_id"
                value={formData.standard_id}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 text-sm bg-white focus:outline-none appearance-none ${errors.standard_id ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-800 focus:border-green-600'}`}
              >
                <option value="">Please Select Standard</option>
                {standards.map((std) => (
                  <option key={std.id} value={std.id}>{std.name}</option>
                ))}
              </select>
              {errors.standard_id && <p className="text-red-500 text-xs mt-1">required</p>}
            </div>

            {/* Upload File */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Upload File*</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Upload raw.json" 
                  value={fileName}
                  disabled
                  className={`w-full border rounded px-3 py-2 text-sm bg-gray-50 cursor-not-allowed ${errors.file ? 'border-red-500' : 'border-gray-300'}`}
                />
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {errors.file && <p className="text-red-500 text-xs mt-1">required</p>}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Note</label>
              <input 
                type="text" 
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Please Holder" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Price</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="100000"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="10,000" 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Sampling Point (Checkbox) */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Sampling Point</label>
              <div className="flex items-center space-x-6 text-sm text-gray-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value="Front End" onChange={handleCheckboxChange} className="w-4 h-4 text-green-600 rounded border-gray-300 accent-green-600" />
                  <span>Front End</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value="Back End" onChange={handleCheckboxChange} className="w-4 h-4 text-green-600 rounded border-gray-300 accent-green-600" />
                  <span>Back End</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value="Other" onChange={handleCheckboxChange} className="w-4 h-4 text-green-600 rounded border-gray-300 accent-green-600" />
                  <span>Other</span>
                </label>
              </div>
            </div>

            {/* 💡 กลับมาใช้ Input รูปแบบปฏิทินที่เลือกได้ */}
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
            <div className="flex justify-end space-x-3 pt-4">
              <Link to="/history" className="px-5 py-2 text-sm font-semibold text-green-700 border border-green-600 rounded hover:bg-green-50 transition-colors">
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