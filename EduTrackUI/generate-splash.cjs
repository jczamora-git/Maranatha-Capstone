const fs = require('fs');
const path = require('path');

try {
  const sharp = require('sharp');
  
  console.log('Generating splash screens...\n');
  
  const logoPath = path.join(__dirname, 'public', 'logo.png');
  const outputDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: public/logo.png not found!');
    process.exit(1);
  }
  
  // Splash screen sizes for different devices
  const splashSizes = [
    { width: 640, height: 1136, name: 'apple-splash-640-1136' },      // iPhone 5/SE
    { width: 750, height: 1334, name: 'apple-splash-750-1334' },      // iPhone 6/7/8
    { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },    // iPhone X/XS/11 Pro
    { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },    // iPhone 6+/7+/8+
    { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },    // iPhone XS Max/11 Pro Max
    { width: 828, height: 1792, name: 'apple-splash-828-1792' },      // iPhone XR/11
    { width: 1170, height: 2532, name: 'apple-splash-1170-2532' },    // iPhone 12/13 Pro
    { width: 1284, height: 2778, name: 'apple-splash-1284-2778' },    // iPhone 12/13 Pro Max
    { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },    // iPad Mini/Air
    { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },    // iPad Pro 12.9"
  ];
  
  // Create white background splash screens with centered logo
  const promises = splashSizes.map(({ width, height, name }) => {
    const outputPath = path.join(outputDir, `${name}.png`);
    
    // Logo should be about 30% of screen width
    const logoSize = Math.floor(width * 0.3);
    
    return sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toBuffer()
      .then(logoBuffer => {
        return sharp({
          create: {
            width: width,
            height: height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
        .composite([{
          input: logoBuffer,
          gravity: 'center'
        }])
        .png()
        .toFile(outputPath);
      })
      .then(() => {
        console.log(`✓ Generated: ${name}.png (${width}x${height})`);
      })
      .catch(err => {
        console.error(`❌ Failed to generate ${name}.png:`, err.message);
      });
  });
  
  Promise.all(promises).then(() => {
    console.log('\n✓ All splash screens generated successfully!');
  }).catch(err => {
    console.error('\n❌ Some splash screens failed to generate:', err);
  });
  
} catch (err) {
  console.error('❌ Error: Sharp library not installed');
  console.error('Run: npm install -D sharp --legacy-peer-deps');
  process.exit(1);
}
