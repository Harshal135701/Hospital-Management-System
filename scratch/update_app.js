const fs = require('fs');
let content = fs.readFileSync('server/src/app.js', 'utf8');

// 1. imports
content = content.replace(
  'const departmentRoutes = require("./modules/departments/department.routes");',
  'const departmentRoutes = require("./modules/departments/department.routes");\r\nconst roomRoutes = require("./modules/rooms/room.routes");'
);

// 2. donor compensation import
content = content.replace(
  'const settlementRoutes = require("./modules/billing/settlement.routes");',
  'const settlementRoutes = require("./modules/billing/settlement.routes");\r\nconst donorCompensationRoutes = require("./modules/billing/donor-compensation.routes");'
);

// 3. /api/meta queries
content = content.replace(
  '"SELECT d.id, d.full_name, d.employee_code, d.department_id, dep.name AS department_name, d.room_id FROM doctors d JOIN departments dep ON dep.id = d.department_id WHERE d.is_active = true ORDER BY d.full_name"',
  '"SELECT d.id, d.full_name, d.employee_code, d.department_id, dep.name AS department_name, d.room_id, d.specialty, d.consultation_fee FROM doctors d JOIN departments dep ON dep.id = d.department_id WHERE d.is_active = true ORDER BY d.full_name"'
);

content = content.replace(
  '"SELECT id, room_number, name, floor FROM rooms WHERE is_active = true ORDER BY room_number"',
  '"SELECT id, room_number, name, floor, room_type, capacity, daily_tariff FROM rooms WHERE is_active = true ORDER BY room_number"'
);

// 4. mount routes
content = content.replace(
  'app.use("/api/departments", departmentRoutes);',
  'app.use("/api/departments", departmentRoutes);\r\napp.use("/api/rooms", roomRoutes);'
);

content = content.replace(
  'app.use("/api/billing/settlement", settlementRoutes);',
  'app.use("/api/billing/settlement", settlementRoutes);\r\napp.use("/api/billing/donor-compensations", donorCompensationRoutes);'
);

fs.writeFileSync('server/src/app.js', content, 'utf8');
console.log('Successfully updated server/src/app.js');
