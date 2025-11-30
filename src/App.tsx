import { useState } from 'react';
import { ImageEncoder } from './components/ImageEncoder';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="mb-2">QR Code Generator</h1>
          <p className="text-gray-600">Create QR codes for links or attach files for download</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <ImageEncoder />
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            🔗 <strong>URL Mode:</strong> Scan QR code to open links<br />
            📎 <strong>File Mode:</strong> Download HTML package that auto-downloads your file<br />
            ✨ Simple and easy to use!
          </p>
        </div>
      </div>
    </div>
  );
}