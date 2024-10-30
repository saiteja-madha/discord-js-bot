// process-html.mjs
import fs from 'node:fs/promises';
import { globby } from 'globby';
import { minify } from 'html-minifier-terser';
import path from 'node:path';

// Astro outputs to dist/client and dist/server for hybrid mode
const CLIENT_DIR = './dist/client';
const SERVER_DIR = './dist/server';

const minifyOptions = {
  removeComments: true,
  preserveLineBreaks: true,
  collapseWhitespace: true,
  minifyJS: true,
  minifyCSS: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  sortClassName: true,
  sortAttributes: true,
};

async function checkDirectory(dir) {
  try {
    await fs.access(dir);
    return true;
  } catch {
    console.warn(`Directory ${dir} not found.`);
    return false;
  }
}

async function processHTML() {
  try {
    // Check if build directories exist
    const clientExists = await checkDirectory(CLIENT_DIR);
    const serverExists = await checkDirectory(SERVER_DIR);

    if (!clientExists && !serverExists) {
      console.error(
        'Neither client nor server directories found. Run astro build first.'
      );
      process.exit(1);
    }

    console.log('🔍 Finding HTML files...');

    // Get HTML files from both client and server directories
    const files = await globby([
      `${CLIENT_DIR}/**/*.html`,
      `${SERVER_DIR}/**/*.html`,
    ]);

    if (files.length === 0) {
      console.warn('No HTML files found to process');
      return;
    }

    console.log(`📝 Processing ${files.length} HTML files...`);

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const filePath = path.relative(process.cwd(), file);
          const html = await fs.readFile(file, 'utf-8');
          const originalSize = Buffer.from(html).length;

          const minified = await minify(html, minifyOptions);
          await fs.writeFile(file, minified);

          const newSize = Buffer.from(minified).length;
          const savings = (
            ((originalSize - newSize) / originalSize) *
            100
          ).toFixed(1);

          return {
            file: filePath,
            originalSize,
            newSize,
            savings,
          };
        } catch (error) {
          console.error(`Error processing ${file}:`, error);
          return { file, error: error.message };
        }
      })
    );

    // Log results
    console.log('\n📊 Processing Results:');

    // Group results by directory
    const clientFiles = results.filter((r) =>
      r.file.startsWith('dist/client/')
    );
    const serverFiles = results.filter((r) =>
      r.file.startsWith('dist/server/')
    );

    if (clientFiles.length > 0) {
      console.log('\n📱 Client files:');
      clientFiles.forEach(logResult);
    }

    if (serverFiles.length > 0) {
      console.log('\n🖥️  Server files:');
      serverFiles.forEach(logResult);
    }

    // Calculate and log total statistics
    const totalStats = calculateTotalStats(results);
    console.log('\n📈 Total Results:');
    console.log(
      `   ${(totalStats.originalSize / 1024).toFixed(1)}KB → ${(totalStats.newSize / 1024).toFixed(1)}KB`
    );
    console.log(`   ${totalStats.savings}% total size reduction`);
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

function logResult({ file, originalSize, newSize, savings, error }) {
  if (error) {
    console.error(`❌ ${file}: ${error}`);
  } else {
    console.log(`✅ ${file}`);
    console.log(
      `   ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${savings}% saved)`
    );
  }
}

function calculateTotalStats(results) {
  const totalOriginal = results.reduce(
    (sum, r) => sum + (r.originalSize || 0),
    0
  );
  const totalNew = results.reduce((sum, r) => sum + (r.newSize || 0), 0);
  const totalSavings = (
    ((totalOriginal - totalNew) / totalOriginal) *
    100
  ).toFixed(1);

  return {
    originalSize: totalOriginal,
    newSize: totalNew,
    savings: totalSavings,
  };
}

processHTML();