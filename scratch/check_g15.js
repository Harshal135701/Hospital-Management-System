const fs = require('fs');
const content = fs.readFileSync('client/src/components/appointments/submoduleRegistry.js', 'utf8');
const lines = content.split('\n');
let inside15 = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("id: '15'")) {
    inside15 = true;
  }
  if (inside15) {
    console.log(lines[i]);
    if (lines[i].includes("id: '16'")) break;
  }
}
