# Example Website for Bucket Server

This directory contains a simple example website used to demonstrate the functionality of the bucket-server's upload capabilities.

## Purpose

The example website serves as a test case for the bucket-server's website upload and hosting functionality. It contains basic HTML, CSS, and JavaScript files that can be uploaded to the bucket server and then accessed via the generated URLs.

## Files Included

- `index.html` - The main HTML page with basic structure and content
- `styles.css` - CSS styles for the example website
- `script.js` - JavaScript functionality for the interactive elements

## Uploading the Website

You can use the bucket-server SDK to upload this example website:

```typescript
import { unframerBucketServerSdk } from '../src/sdk';
import { readFile } from 'fs/promises';
import { globby } from 'globby';
import path from 'path';

async function uploadExampleWebsite() {
  // Site configuration
  const siteName = 'example-site';
  const siteSecret = 'your-secret-key';
  
  // Find all files in the example website directory
  const examplePath = path.resolve(__dirname, 'example-website');
  const filePaths = await globby('**/*', { cwd: examplePath });
  
  // Read all files and prepare them for upload
  const files = await Promise.all(
    filePaths.map(async (filePath) => {
      const fullPath = path.resolve(examplePath, filePath);
      const contents = await readFile(fullPath, 'utf-8');
      
      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType;
      
      switch (ext) {
        case '.html': contentType = 'text/html'; break;
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'application/javascript'; break;
        default: contentType = 'text/plain';
      }
      
      return {
        path: filePath,
        contents,
        contentType
      };
    })
  );
  
  // Upload the website
  const result = await unframerBucketServerSdk['upload-website'].post({
    files,
    basePath: siteName,
    secret: siteSecret
  });
  
  if (result.error) {
    console.error('Upload failed:', result.error);
    return;
  }
  
  console.log('Upload successful!');
  console.log('Files uploaded:', result.data.filesUploaded);
  console.log(`Access your site at: https://${siteName}.demos.unframer.co/index.html`);
}
```

## Accessing the Uploaded Website

Once uploaded, the website can be accessed at:

```
https://{siteName}.demos.unframer.co/index.html
```

Where `{siteName}` is the `basePath` value you provided during upload.

## Testing

You can run the automated test for uploading this example website:

```bash
pnpm vitest src/upload-example.test.ts --run
```

This test will simulate uploading the website and display the URLs where it would be accessible if deployed to the live server.