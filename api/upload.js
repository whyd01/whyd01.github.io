import { Buffer } from 'buffer';
const fetch = require('node-fetch');

// Fungsi pembantu untuk mengurai FormData
const parseMultipartFormData = (body, boundary) => {
  const parts = body.split(`--${boundary}`).slice(1, -1);
  const result = {};
  parts.forEach(part => {
    const [headers, content] = part.split('\r\n\r\n');
    const nameMatch = /name="([^"]+)"/.exec(headers);
    if (nameMatch) {
      const name = nameMatch[1];
      if (name === 'file') {
        const fileContent = content.trim();
        const contentTypeMatch = /Content-Type: ([^\r\n]+)/.exec(headers);
        const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
        result.file = {
          data: fileContent,
          contentType: contentType
        };
      } else {
        result[name] = content.trim();
      }
    }
  });
  return result;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Dapatkan boundary dari header
  const contentType = req.headers['content-type'];
  const boundaryMatch = /boundary=([^;]+)/.exec(contentType);
  if (!boundaryMatch) {
    return res.status(400).json({ error: 'Boundary not found in Content-Type' });
  }
  const boundary = boundaryMatch[1];

  // Baca body request sebagai buffer
  const bodyBuffer = await new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });

  const parsedData = parseMultipartFormData(bodyBuffer.toString(), boundary);
  const { file, title, category } = parsedData;
  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ error: 'Dropbox access token is not set' });
  }
  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const filename = `/${category || 'general'}/${Date.now()}_${title || 'untitled'}.jpeg`;
  const imageBuffer = Buffer.from(file.data, 'binary');

  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: filename,
          mode: 'add',
          autorename: true,
          mute: false
        })
      },
      body: imageBuffer,
    });

    if (response.ok) {
      const data = await response.json();
      const url = `https://www.dropbox.com/s${data.path_display}?raw=1`;
      return res.status(200).json({ message: 'Upload successful', url: url });
    } else {
      const errorData = await response.text();
      return res.status(response.status).json({ error: 'Failed to upload to Dropbox', details: errorData });
    }
  } catch (error) {
    console.error('Error during upload to Dropbox:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
