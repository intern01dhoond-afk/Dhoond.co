const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SERVICES_DIR = path.join(__dirname, '../../frontend/public/services');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function optimizeImages() {
  console.log('--- Starting Image Optimization ---');
  
  if (!fs.existsSync(SERVICES_DIR)) {
    console.error('Services directory not found:', SERVICES_DIR);
    return;
  }

  const files = fs.readdirSync(SERVICES_DIR);
  console.log(`Found ${files.length} files in ${SERVICES_DIR}`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const inputPath = path.join(SERVICES_DIR, file);
      const outputName = file.replace(ext, '.webp');
      const outputPath = path.join(SERVICES_DIR, outputName);

      try {
        console.log(`Optimizing: ${file} -> ${outputName}`);
        
        // Optimize to WebP with 80% quality
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);

        // Delete original file if conversion succeeded and name is different
        if (inputPath !== outputPath) {
          fs.unlinkSync(inputPath);
          console.log(`  Deleted original: ${file}`);
        }

        // Update database
        const oldUrl = `/services/${file}`;
        const newUrl = `/services/${outputName}`;
        
        const res = await pool.query(
          "UPDATE services SET image = $1 WHERE image = $2",
          [newUrl, oldUrl]
        );
        
        if (res.rowCount > 0) {
          console.log(`  Updated ${res.rowCount} rows in DB for ${file}`);
        }

      } catch (err) {
        console.error(`  Error processing ${file}:`, err.message);
      }
    }
  }

  console.log('--- Optimization Complete ---');
  await pool.end();
}

optimizeImages();
