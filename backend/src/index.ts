import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import db from './db/database';
import { calculateRice } from './controllers/calculator';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const toISODate = (str: string) => {
  if (!str) return new Date().toISOString();
  if (str.includes('T')) return new Date(str).toISOString();
  const parts = str.split(' ');
  if (parts.length < 2) return new Date().toISOString();
  const dateParts = parts[0].split('/');
  return new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${parts[1]}`).toISOString();
};

app.get('/standard', (req: any, res: any) => {
  try {
    const filePath = path.join(__dirname, 'db', 'standards.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const standards = JSON.parse(rawData);
    res.status(200).json(standards);
  } catch (error) {
    console.error("Error reading standards.json:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/history', (req: any, res: any) => {
  const { 
    name, standard_id, standardID, note, price, sampling_point, samplingPoint, 
    raw_data, standardData, inspectionID, date_time, samplingDate 
  } = req.body;

  const finalStandardID = standardID || standard_id;
  const finalPrice = Number(price) || 0;
  const finalSamplingPoint = Array.isArray(samplingPoint) ? samplingPoint.join(', ') : (sampling_point || "");

  const generateShortId = () => {
    const p1 = Math.floor(1000 + Math.random() * 9000).toString();
    const p2 = Math.floor(1000 + Math.random() * 9000).toString();
    return `MI-${p1}-${p2}`;
  };
  const id = inspectionID || generateShortId(); 
  
  const now = new Date();
  const current_time_str = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let finalSamplingDateStr = current_time_str; 
  const inputDateTime = samplingDate || date_time;
  if (inputDateTime) {
      const d = new Date(inputDateTime);
      if (!isNaN(d.getTime())) {
          const s_day = String(d.getDate()).padStart(2, '0');
          const s_month = String(d.getMonth() + 1).padStart(2, '0');
          const s_year = d.getFullYear();
          const s_hours = String(d.getHours()).padStart(2, '0');
          const s_mins = String(d.getMinutes()).padStart(2, '0');
          finalSamplingDateStr = `${s_day}/${s_month}/${s_year} ${s_hours}:${s_mins}:00`;
      }
  }

  try {
    const filePath = path.join(__dirname, 'db', 'standards.json');
    const standardsFile = fs.readFileSync(filePath, 'utf-8');
    const allStandards = JSON.parse(standardsFile);
    
    const selectedStandard = allStandards.find((s: any) => String(s.id) === String(finalStandardID));

    if (!selectedStandard) {
        return res.status(400).json({ error: "ไม่พบมาตรฐานที่เลือก" });
    }

    let dataToCalc = raw_data;
    if (!Array.isArray(raw_data)) {
        if (raw_data && Array.isArray(raw_data.grains)) {
            dataToCalc = raw_data.grains; 
        } else {
            return res.status(400).json({ error: "รูปแบบไฟล์ raw.json ไม่ถูกต้อง" });
        }
    }

    const calcResult = calculateRice(dataToCalc, selectedStandard.standardData);
    const composition_data = JSON.stringify(calcResult.composition);
    const defect_data = JSON.stringify(calcResult.defects);
    
    const finalStandardData = selectedStandard.standardData.map((rule: any) => {
        let val = 0;
        const compMatch = calcResult.composition.find((c: any) => c.name === rule.name);
        if (compMatch) val = compMatch.actual;
        
        const defMatch = calcResult.defects.find((d: any) => d.name === rule.key);
        if (defMatch) val = defMatch.actual;
        
        return { ...rule, value: val };
    });

    const sql = `
      INSERT INTO history 
      (id, create_date, update_date, name, standard_id, standard_name, note, price, sampling_point, date_time_sampling, total_sample, composition_data, defect_data, standard_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // 💡 เติม :any ให้ตัวแปร err (แก้ TS7006)
    db.run(sql, 
      [id, current_time_str, current_time_str, name, finalStandardID, selectedStandard.name, note, finalPrice, finalSamplingPoint, finalSamplingDateStr, calcResult.totalSample, composition_data, defect_data, JSON.stringify(finalStandardData)], 
      function(err: any) {
        if (err) return res.status(500).json({ error: "บันทึกข้อมูลไม่สำเร็จ" });
        res.status(200).json({ inspectionID: id }); 
      }
    );

  } catch (err) {
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการคำนวณ" });
  }
});

app.get('/history', (req: any, res: any) => {
  const { fromDate, toDate, inspectionID } = req.query;
  const sql = `SELECT * FROM history ORDER BY id DESC`;

  // 💡 เติม :any ให้ err และ rows (แก้ TS7006)
  db.all(sql, [], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });

    let filtered = rows;
    if (inspectionID) filtered = filtered.filter((r: any) => r.id.toLowerCase().includes(String(inspectionID).toLowerCase()));
    if (fromDate) {
      const fromTime = new Date(String(fromDate)).getTime();
      filtered = filtered.filter((r: any) => new Date(toISODate(r.create_date)).getTime() >= fromTime);
    }
    if (toDate) {
      const toDateObj = new Date(String(toDate));
      toDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r: any) => new Date(toISODate(r.create_date)).getTime() <= toDateObj.getTime());
    }

    const mappedData = filtered.map((row: any) => ({
      name: row.name,
      createDate: toISODate(row.create_date),
      inspectionID: row.id,
      standardID: row.standard_id,
      note: row.note,
      standardName: row.standard_name || `Standard ${row.standard_id}`,
      samplingDate: toISODate(row.date_time_sampling || row.create_date),
      samplingPoint: row.sampling_point ? row.sampling_point.split(', ') : [],
      price: Number(row.price),
      
      id: row.id,
      create_date: row.create_date,
      date_time_sampling: row.date_time_sampling,
      sampling_point: row.sampling_point
    }));
    res.status(200).json({ data: mappedData }); 
  });
});

app.get('/history/:id', (req: any, res: any) => {
  const { id } = req.params;
  const sql = `SELECT * FROM history WHERE id = ?`;
  
  // 💡 เติม :any ให้ err และ row (แก้ TS7006)
  db.get(sql, [id], (err: any, row: any) => {
    if (err || !row) return res.status(404).json({ error: "ไม่พบข้อมูล" });
    res.status(200).json({
      name: row.name,
      createDate: toISODate(row.create_date),
      inspectionID: row.id,
      standardID: row.standard_id,
      note: row.note,
      standardName: row.standard_name || `Standard ${row.standard_id}`,
      samplingDate: toISODate(row.date_time_sampling || row.create_date),
      samplingPoint: row.sampling_point ? row.sampling_point.split(', ') : [],
      price: Number(row.price),
      imageLink: "",
      standardData: JSON.parse(row.standard_data || "[]"),
      
      id: row.id,
      create_date: row.create_date,
      update_date: row.update_date,
      composition_data: row.composition_data,
      defect_data: row.defect_data,
      total_sample: row.total_sample,
      date_time_sampling: row.date_time_sampling,
      sampling_point: row.sampling_point
    });
  });
});

app.put('/history/:id', (req: any, res: any) => {
  const { id } = req.params;
  const { note, price, sampling_point, samplingPoint, date_time, samplingDate } = req.body;
  
  const finalSamplingPoint = Array.isArray(samplingPoint) ? samplingPoint.join(', ') : sampling_point;

  const now = new Date();
  const update_date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  let finalSamplingDateStr = update_date; 
  const inputDateTime = samplingDate || date_time;
  if (inputDateTime) {
      const d = new Date(inputDateTime);
      if (!isNaN(d.getTime())) {
          const s_day = String(d.getDate()).padStart(2, '0');
          const s_month = String(d.getMonth() + 1).padStart(2, '0');
          const s_year = d.getFullYear();
          const s_hours = String(d.getHours()).padStart(2, '0');
          const s_mins = String(d.getMinutes()).padStart(2, '0');
          finalSamplingDateStr = `${s_day}/${s_month}/${s_year} ${s_hours}:${s_mins}:00`;
      }
  }

  const sql = `UPDATE history SET note = ?, price = ?, sampling_point = ?, date_time_sampling = ?, update_date = ? WHERE id = ?`;
  
  // 💡 เติม :any ให้ err (แก้ TS7006)
  db.run(sql, [note, Number(price) || 0, finalSamplingPoint, finalSamplingDateStr, update_date, id], function(err: any) {
    if (err) return res.status(500).json({ error: "อัปเดตข้อมูลไม่สำเร็จ" });
    res.status(200).json({ message: "Update success!" });
  });
});

app.delete('/history', (req: any, res: any) => {
  const idsToDelete = req.body.inspectionID || req.body.ids;
  if (!idsToDelete || !Array.isArray(idsToDelete) || idsToDelete.length === 0) return res.status(400).json({ error: "No ids provided" });
  const placeholders = idsToDelete.map(() => '?').join(',');
  const sql = `DELETE FROM history WHERE id IN (${placeholders})`;

  // 💡 เติม :any ให้ err (แก้ TS7006)
  db.run(sql, idsToDelete, function(err: any) {
    if (err) return res.status(500).json({ error: "Failed to delete" });
    res.status(200).json("Deleted successfully"); 
  });
});

app.get('/', (req: any, res: any) => res.send('🍚 Rice Inspection Backend is running!'));
app.listen(PORT, () => console.log(`✅ Backend Server is running on http://localhost:${PORT}`));