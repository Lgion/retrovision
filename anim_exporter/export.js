const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { exec } = require('child_process');
const path = require('path');

(async () => {
  console.log('Lancement de Puppeteer...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  const Config = {
    followNewTab: false,
    fps: 60,
    ffmpeg_Path: '/usr/bin/ffmpeg',
    videoFrame: { width: 1280, height: 720 },
    videoCrf: 18,
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: { color: '#0A0E1A' },
    recordDurationLimit: 7
  };
  
  const recorder = new PuppeteerScreenRecorder(page, Config);
  
  console.log('Ouverture de la page d\'animation...');
  // Force reload pour être sûr que l'animation commence au début
  await page.goto('file:///home/nihongo/Bureau/CASCADE/retrovision/arrow_puzzle_anim.html');
  
  console.log('Enregistrement en cours (6 secondes)...');
  await recorder.start('./anim.mp4');
  
  await new Promise(r => setTimeout(r, 6000));
  
  console.log('Arrêt de l\'enregistrement...');
  await recorder.stop();
  await browser.close();
  
  console.log('Conversion MP4 vers WebP animé via FFmpeg...');
  const inputPath = path.resolve('./anim.mp4');
  const outputPath = path.resolve('../arrow_puzzle_hq.webp');
  
  // Paramètres FFmpeg pour générer un beau WebP animé
  const cmd = `ffmpeg -y -i "${inputPath}" -vcodec libwebp -filter:v fps=fps=30 -lossless 0 -compression_level 4 -q:v 80 -loop 0 "${outputPath}"`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur FFmpeg: ${error.message}`);
      return;
    }
    console.log('✅ Conversion réussie ! Le fichier final se trouve à la racine : retrovision/arrow_puzzle_hq.webp');
  });
})();
