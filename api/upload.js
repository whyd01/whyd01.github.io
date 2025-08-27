// api/upload.js
import { Dropbox } from 'dropbox';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Ambil token akses Dropbox dari Vercel Environment Variables
  const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
  const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });

  try {
    // Memeriksa apakah ada file yang diunggah
    if (!req.body || !req.body.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileData = req.body.file;
    const fileName = req.body.fileName;

    // Unggah file ke Dropbox
    const response = await dbx.filesUpload({
      path: '/' + fileName, // Path di Dropbox untuk menyimpan file
      contents: Buffer.from(fileData, 'base64'),
    });

    res.status(200).json({ message: 'File uploaded successfully!', data: response });
  } catch (error) {
    console.error('Error uploading to Dropbox:', error);
    res.status(500).json({ message: 'File upload failed.', error: error.message });
  }
}
