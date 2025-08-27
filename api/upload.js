import { Buffer } from 'buffer';
import fetch from 'node-fetch';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm();
  
  try {
    const [fields, files] = await form.parse(req);

    const title = fields.title?.[0] || 'untitled';
    const category = fields.category?.[0] || 'general';
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: 'Dropbox access token is not set' });
    }

    const filename = `/${category}/${Date.now()}_${title}.jpeg`;
    const fileBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      file.on('data', chunk => chunks.push(chunk)).on('end', () => resolve(Buffer.concat(chunks))).on('error', reject);
    });

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
      body: fileBuffer,
    });

    if (response.ok) {
      const data = await response.json();
      const shareUrlResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: data.path_display,
          settings: {
            requested_visibility: "public"
          }
        })
      });

      if (shareUrlResponse.ok) {
        const shareData = await shareUrlResponse.json();
        const rawUrl = shareData.url.replace('dl=0', 'raw=1');
        return res.status(200).json({ message: 'Upload successful', url: rawUrl });
      } else {
        const shareErrorText = await shareUrlResponse.text();
        return res.status(shareUrlResponse.status).json({ error: 'Failed to create shared link', details: shareErrorText });
      }

    } else {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Failed to upload to Dropbox', details: errorText });
    }
  } catch (error) {
    console.error('Error during upload:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
