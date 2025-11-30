import { useState } from 'react';
import { Link, Download, Upload, FileIcon } from 'lucide-react';
import QRCode from 'qrcode';

type Mode = 'url' | 'file';

export function ImageEncoder() {
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadPackageUrl, setDownloadPackageUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateQRCode = async () => {
    if (mode === 'url' && !url) {
      alert('Please enter a URL');
      return;
    }

    if (mode === 'file' && !file) {
      alert('Please upload a file');
      return;
    }

    // Validate URL in URL mode
    if (mode === 'url') {
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
      } catch {
        alert('Please enter a valid URL');
        return;
      }
    }

    setIsGenerating(true);

    try {
      if (mode === 'url') {
        // URL Mode - create QR code
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;
        
        const qrDataUrl = await QRCode.toDataURL(finalUrl, {
          width: 512,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });

        setQrCodeUrl(qrDataUrl);
        setDownloadPackageUrl('');

      } else {
        // File Mode - create HTML with embedded file
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const fileData = e.target?.result as string;
          
          const downloadPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download ${file!.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 60px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 { color: #333; margin-bottom: 10px; }
    .filename { color: #667eea; margin-bottom: 20px; word-break: break-all; }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📎</div>
    <h1>Downloading...</h1>
    <p class="filename">${file!.name}</p>
    <div class="spinner"></div>
    <p style="color: #666; font-size: 14px;">Your download will start automatically</p>
  </div>
  
  <script>
    const fileData = '${fileData}';
    const fileName = '${file!.name}';
    
    function downloadFile() {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      document.querySelector('.spinner').style.display = 'none';
      document.querySelector('h1').textContent = 'Download Started!';
    }
    
    setTimeout(downloadFile, 500);
  </script>
</body>
</html>`;

          const htmlBlob = new Blob([downloadPage], { type: 'text/html' });
          const htmlUrl = URL.createObjectURL(htmlBlob);
          setDownloadPackageUrl(htmlUrl);

          // Create QR code for the download message
          const message = `Download: ${file!.name}`;
          const qrDataUrl = await QRCode.toDataURL(message, {
            width: 512,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });

          setQrCodeUrl(qrDataUrl);
        };
        
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (mode === 'url' && qrCodeUrl) {
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = qrCodeUrl;
      link.click();
    } else if (mode === 'file' && downloadPackageUrl) {
      const link = document.createElement('a');
      link.download = `${file?.name || 'file'}-download.html`;
      link.href = downloadPackageUrl;
      link.click();
    }
  };

  const handleReset = () => {
    setUrl('');
    setFile(null);
    setQrCodeUrl('');
    setDownloadPackageUrl('');
    if (downloadPackageUrl) {
      URL.revokeObjectURL(downloadPackageUrl);
    }
  };

  return (
    <div className="space-y-6">
      {!qrCodeUrl ? (
        <>
          {/* Mode Selection */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('url')}
              className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
                mode === 'url'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Link className="w-4 h-4" />
              URL Link
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 py-2 px-4 rounded-md transition-all flex items-center justify-center gap-2 ${
                mode === 'file'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileIcon className="w-4 h-4" />
              File Attachment
            </button>
          </div>

          {/* URL Input */}
          {mode === 'url' && (
            <div>
              <label htmlFor="url" className="block mb-2 text-gray-700">
                Enter URL to encode
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateQRCode()}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Creates a standard QR code for your URL
              </p>
            </div>
          )}

          {/* File Upload */}
          {mode === 'file' && (
            <div>
              <label htmlFor="file" className="block mb-2 text-gray-700">
                Upload file to attach
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  {file ? (
                    <>
                      <p className="text-gray-700 mb-1">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-1">Click to upload file</p>
                      <p className="text-xs text-gray-500">Any file type supported</p>
                    </>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Creates a download package with your file embedded
              </p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateQRCode}
            disabled={
              (mode === 'url' && !url) || (mode === 'file' && !file) || isGenerating
            }
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {mode === 'url' ? 'Generate QR Code' : 'Create Download Package'}
              </>
            )}
          </button>
        </>
      ) : (
        <>
          {/* QR Code Display */}
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-xl border-2 border-gray-200 flex justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full max-w-md"
              />
            </div>

            {mode === 'url' ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 text-center">
                  📱 <strong>Scan with phone camera</strong> to open:<br />
                  <span className="text-purple-600 break-all">{url}</span>
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700 text-center">
                  📎 <strong>Download package contains:</strong><br />
                  Embedded file: <span className="text-purple-600">{file?.name}</span><br />
                  <span className="text-xs text-gray-600">Share the HTML file - opens in browser and auto-downloads your file!</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-5 h-5" />
                {mode === 'url' ? 'Download PNG' : 'Download Package'}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-all"
              >
                Create New
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              {mode === 'url' 
                ? '✨ Scan QR code with any camera app to open the link'
                : '✨ HTML file auto-downloads your attached file when opened in any browser'
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
}