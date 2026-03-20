export function calculateRice(rawData: any[], standardData: any[]) {
    const totalSample = rawData.length;
    
    if (totalSample === 0) {
        return { totalSample: 0, composition: [], defects: [] };
    }

    // 1. เตรียมตะกร้าสำหรับนับ Composition (ดึง key จากมาตรฐาน)
    let compCounters: Record<string, { name: string, count: number, min: number, max: number }> = {};
    standardData.forEach(std => {
        compCounters[std.key] = { 
            name: std.name, 
            count: 0, 
            min: std.minLength, 
            max: std.maxLength 
        };
    });

    // 2. เตรียมตะกร้านับ Defect
    const defectTypes = ['yellow', 'paddy', 'damaged', 'glutinous', 'chalky', 'red'];
    let defectCounters: Record<string, number> = {};
    defectTypes.forEach(d => defectCounters[d] = 0);

    // 3. เริ่มวนลูปตรวจข้าวทีละเมล็ด
    rawData.forEach(grain => {
        const length = grain.length || 0;
        const shape = grain.shape || ''; // "wholegrain" หรือ "broken"
        const type = grain.type || 'white'; // ถ้าเป็น "white" ถือว่าปกติ

        // --- ตรวจส่วนประกอบ (Composition) ---
        for (const std of standardData) {
            // เช็คความยาว
            if (length >= std.minLength && length < std.maxLength) {
                // เช็คว่ารูปทรง (shape) อยู่ในเกณฑ์ที่กำหนดไหม
                if (std.shape.includes(shape)) {
                    compCounters[std.key].count++;
                    break; 
                }
            }
        }

        // --- ตรวจตำหนิ (Defect) ---
        if (type !== 'white') {
            // ถ้าเป็นข้าวมีตำหนิ ให้บวกเพิ่มในประเภทนั้นๆ
            if (defectCounters[type] !== undefined) {
                defectCounters[type]++;
            } else {
                // ถ้าโจทย์ส่งตำหนิแปลกๆ มา ก็เก็บเพิ่มให้เลย
                defectCounters[type] = 1;
                if (!defectTypes.includes(type)) {
                    defectTypes.push(type);
                }
            }
        }
    });

    // 4. สรุปผลเป็นเปอร์เซ็นต์
    const compositionResult = standardData.map(std => {
        const count = compCounters[std.key].count;
        const percent = ((count / totalSample) * 100).toFixed(2);
        return {
            name: std.name,
            length: std.maxLength === 99 ? `>= ${std.minLength}` : `${std.minLength} - ${std.maxLength}`,
            actual: parseFloat(percent)
        };
    });

    const defectResult = defectTypes.map(d => {
        const percent = ((defectCounters[d] / totalSample) * 100).toFixed(2);
        return {
            name: d,
            actual: parseFloat(percent)
        };
    });

    return {
        totalSample: totalSample,
        composition: compositionResult,
        defects: defectResult
    };
}