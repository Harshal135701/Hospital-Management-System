const fs = require('fs');
const content = fs.readFileSync('client/src/components/appointments/submoduleRegistry.js', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("id: '15.") || lines[i].includes("groupId: '15'")) {
    for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 8); j++) {
      console.log(lines[j]);
    }
    console.log('---');
  }
}
