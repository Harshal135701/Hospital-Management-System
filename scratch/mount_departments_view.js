const fs = require('fs');

let appCode = fs.readFileSync('client/src/App.jsx', 'utf8');

// 1. Add import
appCode = appCode.replace(
  "import { DoctorsView } from './components/doctors/DoctorsView';",
  "import { DoctorsView } from './components/doctors/DoctorsView';\r\nimport { DepartmentsView } from './components/departments/DepartmentsView';"
);

// 2. Replace case 'departments'
const oldDeptCase = `      case 'departments':
        return (
          <PlaceholderView
            title="Hospital Departments & Clinical Wings"
            subtitle="Organization of clinical disciplines, outpatient departments, and ICU wings."
            icon={Building2}
            imageKey="hospitalReception"
            onBack={() => setCurrentRoute('dashboard')}
          />
        );`;

const newDeptCase = `      case 'departments':
        return (
          <DepartmentsView
            onBack={() => setCurrentRoute('dashboard')}
            onNavigate={setCurrentRoute}
          />
        );`;

appCode = appCode.replace(oldDeptCase, newDeptCase);

fs.writeFileSync('client/src/App.jsx', appCode, 'utf8');
console.log('Successfully mounted DepartmentsView in App.jsx!');
