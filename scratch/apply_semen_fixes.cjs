const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('client/src/components/billing/andrology/SemenAnalysisEntry.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace collectionMethod block
const oldCollectionRegex = /<div>\s*<label[^>]*>\s*Collection Method\s*<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;
const newCollection = `<Select
                  label="Collection Method"
                  value={formData.collectionMethod}
                  onChange={(e) => handleChange('collectionMethod', e.target.value)}
                  options={[
                    { value: 'Masturbation on-site (Private Room 3)', label: 'Masturbation on-site (Private Room 3)' },
                    { value: 'Home collection (<1 hr transport with temp maintenance)', label: 'Home collection (<1 hr transport)' },
                    { value: 'PESA (Percutaneous Epididymal Sperm Aspiration)', label: 'PESA (Surgical Epididymal)' },
                    { value: 'TESE (Testicular Sperm Extraction)', label: 'TESE (Surgical Testicular)' }
                  ]}
                />`;

if (oldCollectionRegex.test(content)) {
  content = content.replace(oldCollectionRegex, newCollection);
  console.log('Replaced collectionMethod');
} else {
  console.error('Failed to match collectionMethod regex');
}

// Replace Liquefaction block
const oldLiqRegex = /<div>\s*<label[^>]*>\s*Liquefaction\s*<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;
const newLiq = `<Select
                  label="Liquefaction"
                  value={formData.liquefaction}
                  onChange={(e) => handleChange('liquefaction', e.target.value)}
                  options={[
                    { value: 'Complete (<30 min)', label: 'Complete (<30 min)' },
                    { value: 'Delayed (30 - 60 min)', label: 'Delayed (30 - 60 min)' },
                    { value: 'Incomplete (>60 min)', label: 'Incomplete (>60 min)' }
                  ]}
                />`;

if (oldLiqRegex.test(content)) {
  content = content.replace(oldLiqRegex, newLiq);
  console.log('Replaced Liquefaction');
} else {
  console.error('Failed to match Liquefaction regex');
}

// Replace Viscosity block
const oldViscRegex = /<div>\s*<label[^>]*>\s*Viscosity\s*<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;
const newVisc = `<Select
                  label="Viscosity"
                  value={formData.viscosity}
                  onChange={(e) => handleChange('viscosity', e.target.value)}
                  options={[
                    { value: 'Normal', label: 'Normal (drop by drop)' },
                    { value: 'Slightly Increased', label: 'Slightly Increased' },
                    { value: 'High (>2cm thread)', label: 'High (>2cm thread)' }
                  ]}
                />`;

if (oldViscRegex.test(content)) {
  content = content.replace(oldViscRegex, newVisc);
  console.log('Replaced Viscosity');
} else {
  console.error('Failed to match Viscosity regex');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Finished updating selects');
