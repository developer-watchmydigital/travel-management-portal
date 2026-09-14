const fs = require('fs');
const html = fs.readFileSync('C:/Users/hio/.gemini/antigravity-ide/brain/2816886c-8102-497e-8f9b-83241e88c24f/page_response2.html', 'utf8');
console.log('Has curated id:', html.includes('id="curated"'));
console.log('Has Goa Coastal:', html.includes('Goa Coastal Paradise'));
console.log('Has Curated Experiences:', html.includes('Curated'));
console.log('Has 11,999 price:', html.includes('11,999'));
console.log('Has Gujarat pill:', html.includes('Gujarat'));
