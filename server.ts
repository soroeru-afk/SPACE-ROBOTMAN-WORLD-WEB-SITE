import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const DATA_FILE = path.resolve(process.cwd(), 'data.json');
  const ASSET_DIRS: Record<string, string> = {
    'ART': 'public/assets/new_image',
    'CHAR': 'public/assets/characters/REALISTIC MODEL VERSION',
    'MOTION': 'public/assets/motion',
    'LOGO': 'public/assets/logos'
  };

  async function loadData() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return { units: [], artSet: [], motSet: [] };
    }
  }

  async function saveData(data: any) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  app.get('/api/data', async (req, res) => {
    const data = await loadData();
    res.json(data);
  });

  app.post('/api/update_data', async (req, res) => {
    try {
      await saveData(req.body);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  const upload = multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        const category = req.body.category || 'ART';
        const dir = ASSET_DIRS[category] || ASSET_DIRS['ART'];
        const fullDir = path.resolve(process.cwd(), dir);
        try {
          await fs.mkdir(fullDir, { recursive: true });
          cb(null, fullDir);
        } catch (e: any) {
          cb(e, fullDir);
        }
      },
      filename: (req, file, cb) => {
        const customName = req.body.filename;
        const ext = path.extname(file.originalname);
        if (customName) {
           cb(null, customName + ext);
        } else {
           cb(null, file.originalname);
        }
      }
    })
  });

  app.post('/api/upload', upload.array('files'), (req, res) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const category = req.body.category || 'ART';
    const uploadedFiles = req.files as Express.Multer.File[];

    const results = uploadedFiles.map(file => {
      const filename = file.filename;
      let relPath = '';
      if (category === 'ART') {
        relPath = filename;
      } else if (category === 'LOGO') {
        relPath = filename;
      } else if (category === 'MOTION') {
         relPath = filename;
      } else {
         relPath = `assets/characters/REALISTIC MODEL VERSION/${filename}`;
      }
      return { filename: relPath, basename: filename };
    });

    res.json({ success: true, files: results });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Provide assets from public dir directly in production if needed, though mostly handled by Vite build
    app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
