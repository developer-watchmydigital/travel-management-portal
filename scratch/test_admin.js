const fs = require('fs');
const html = fs.readFileSync('C:/Users/hio/.gemini/antigravity-ide/brain/2816886c-8102-497e-8f9b-83241e88c24f/admin_response.html', 'utf8');
console.log('Admin Page length:', html.length);
console.log('Has Owner Access Only:', html.includes('Owner Access Only'));
console.log('Has Curated Packages in bundle:', html.includes('Curated Packages') || html.includes('curated'));
