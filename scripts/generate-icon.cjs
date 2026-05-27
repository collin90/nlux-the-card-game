const fs = require('fs/promises');
const path = require('path');
const pngToIco = require('png-to-ico').default;

const root = path.join(__dirname, '..');
const input = path.join(root, 'public', 'icon.png');
const outputDir = path.join(root, '.icons');
const output = path.join(outputDir, 'icon.ico');

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const ico = await pngToIco(input);
  await fs.writeFile(output, ico);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
