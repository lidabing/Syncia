
import fs from 'fs';
import path from 'path';

const manifestPath = path.resolve('dist', 'manifest.json');

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  
  const resourcesToAdd = [
    'src/pages/sidebar/index.html',
    'src/pages/settings/index.html'
  ];

  let war = manifest.web_accessible_resources || [];
  
  // Find an existing entry that matches http/https or create a new one
  let entry = war.find(e => e.matches.includes('http://*/*') && e.matches.includes('https://*/*'));
  
  if (!entry) {
    entry = {
      resources: [],
      matches: ['http://*/*', 'https://*/*']
    };
    war.push(entry);
  }

  resourcesToAdd.forEach(res => {
    if (!entry.resources.includes(res)) {
      entry.resources.push(res);
    }
  });

  manifest.web_accessible_resources = war;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest patched successfully.');
} else {
  console.error('dist/manifest.json not found.');
}
