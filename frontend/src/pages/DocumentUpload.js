import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Database, Zap } from 'lucide-react';
import { documentAPI, vectorAPI } from '../services/api';

const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState('vector'); // 'mongo' or 'vector'

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let response;
      if (uploadMode === 'vector') {
        response = await vectorAPI.uploadToVector(formData);
      } else {
        response = await documentAPI.uploadDocument(formData);
      }

      setUploadResult({
        ...response.data,
        uploadMode,
        fileName: file.name,
        fileSize: file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.details || error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [uploadMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="page-container">
      <h1 className="page-title">
        <Upload className="title-icon" />
        Document Upload
      </h1>
      <p className="page-subtitle">
        Upload text documents to generate embeddings and enable vector search
      </p>

      <div className="upload-section">
        <div className="upload-mode-selector">
          <h3>Choose Upload Destination</h3>
          <div className="mode-options">
            <button
              className={`mode-option ${uploadMode === 'vector' ? 'active' : ''}`}
              onClick={() => setUploadMode('vector')}
            >
              <Database size={24} />
              <div>
                <div className="mode-title">Vector Database</div>
                <div className="mode-desc">PostgreSQL + pgvector</div>
              </div>
            </button>
            <button
              className={`mode-option ${uploadMode === 'mongo' ? 'active' : ''}`}
              onClick={() => setUploadMode('mongo')}
            >
              <Zap size={24} />
              <div>
                <div className="mode-title">MongoDB</div>
                <div className="mode-desc">Traditional document storage</div>
              </div>
            </button>
          </div>
        </div>

        <div className="upload-dropzone-container">
          <div
            {...getRootProps()}
            className={`upload-dropzone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="upload-status">
                <div className="loading-spinner large"></div>
                <h3>Processing Document...</h3>
                <p>Generating embeddings and storing vectors</p>
              </div>
            ) : (
              <div className="upload-content">
                <Upload size={48} className="upload-icon" />
                <h3>
                  {isDragActive ? 'Drop your file here' : 'Drag & drop a document'}
                </h3>
                <p>or click to browse files</p>
                <div className="file-types">
                  <span className="file-type">.txt</span>
                  <span className="file-type">.md</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error">
            <AlertCircle size={20} />
            <div>
              <strong>Upload Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {uploadResult && (
          <div className="success">
            <CheckCircle size={20} />
            <div>
              <strong>Upload Successful!</strong>
              <p>Document processed and stored in {uploadResult.uploadMode === 'vector' ? 'Vector Database' : 'MongoDB'}</p>
            </div>
          </div>
        )}

        {uploadResult && (
          <div className="upload-results">
            <h3>Upload Results</h3>
            <div className="result-grid">
              <div className="result-item">
                <FileText className="result-icon" />
                <div>
                  <div className="result-label">File Name</div>
                  <div className="result-value">{uploadResult.fileName}</div>
                </div>
              </div>
              
              <div className="result-item">
                <Database className="result-icon" />
                <div>
                  <div className="result-label">File Size</div>
                  <div className="result-value">{Math.round(uploadResult.fileSize / 1024)} KB</div>
                </div>
              </div>
              
              <div className="result-item">
                <Zap className="result-icon" />
                <div>
                  <div className="result-label">Total Chunks</div>
                  <div className="result-value">{uploadResult.document?.totalChunks || uploadResult.totalChunks || 'N/A'}</div>
                </div>
              </div>
              
              <div className="result-item">
                <CheckCircle className="result-icon" />
                <div>
                  <div className="result-label">Status</div>
                  <div className="result-value">
                    <span className="badge badge-success">
                      {uploadResult.document?.processingStatus || uploadResult.processingStatus || 'Completed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {uploadResult.uploadMode === 'vector' && (
              <div className="vector-info">
                <h4>Vector Database Features</h4>
                <div className="feature-list">
                  <div className="feature-item">✅ pgvector extension enabled</div>
                  <div className="feature-item">✅ Cosine, L2, and Dot Product similarity</div>
                  <div className="feature-item">✅ IVFFlat indexing for performance</div>
                  <div className="feature-item">✅ JSONB metadata support</div>
                </div>
              </div>
            )}

            <div className="next-steps">
              <h4>Next Steps</h4>
              <div className="steps-list">
                <div className="step-item">
                  <span className="step-number">1</span>
                  <span>Go to Vector Search to query your document</span>
                </div>
                <div className="step-item">
                  <span className="step-number">2</span>
                  <span>Test different similarity methods</span>
                </div>
                <div className="step-item">
                  <span className="step-number">3</span>
                  <span>Try dynamic prompting techniques</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .upload-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .upload-mode-selector {
          margin-bottom: 40px;
        }

        .upload-mode-selector h3 {
          color: #2d3748;
          margin-bottom: 20px;
          text-align: center;
        }

        .mode-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .mode-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .mode-option:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
        }

        .mode-option.active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .mode-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 5px;
        }

        .mode-desc {
          font-size: 0.9rem;
          color: #718096;
        }

        .upload-dropzone-container {
          margin: 40px 0;
        }

        .upload-dropzone {
          border: 3px dashed #cbd5e0;
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
        }

        .upload-dropzone:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .upload-dropzone.drag-active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          transform: scale(1.02);
        }

        .upload-dropzone.uploading {
          border-color: #48bb78;
          background: rgba(72, 187, 120, 0.05);
          cursor: not-allowed;
        }

        .upload-content h3 {
          color: #2d3748;
          margin: 20px 0 10px;
        }

        .upload-content p {
          color: #718096;
          margin-bottom: 20px;
        }

        .upload-icon {
          color: #667eea;
          margin-bottom: 10px;
        }

        .file-types {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }

        .file-type {
          background: #e2e8f0;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #4a5568;
        }

        .upload-status h3 {
          color: #2d3748;
          margin: 20px 0 10px;
        }

        .upload-status p {
          color: #718096;
        }

        .loading-spinner.large {
          width: 40px;
          height: 40px;
          border-width: 4px;
          margin: 0 auto 20px;
        }

        .upload-results {
          background: white;
          border-radius: 15px;
          padding: 30px;
          margin-top: 30px;
          border: 1px solid #e2e8f0;
        }

        .upload-results h3 {
          color: #2d3748;
          margin-bottom: 25px;
          text-align: center;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .result-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #f7fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .result-icon {
          color: #667eea;
          flex-shrink: 0;
        }

        .result-label {
          font-size: 0.9rem;
          color: #718096;
          margin-bottom: 5px;
        }

        .result-value {
          font-weight: 600;
          color: #2d3748;
        }

        .vector-info {
          background: #f0fff4;
          border: 1px solid #c6f6d5;
          border-radius: 10px;
          padding: 20px;
          margin: 25px 0;
        }

        .vector-info h4 {
          color: #2f855a;
          margin-bottom: 15px;
        }

        .feature-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px;
        }

        .feature-item {
          color: #2f855a;
          font-size: 0.95rem;
        }

        .next-steps {
          background: #ebf8ff;
          border: 1px solid #bee3f8;
          border-radius: 10px;
          padding: 20px;
          margin-top: 25px;
        }

        .next-steps h4 {
          color: #2b6cb0;
          margin-bottom: 15px;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #2b6cb0;
        }

        .step-number {
          background: #2b6cb0;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .mode-options {
            grid-template-columns: 1fr;
          }
          
          .upload-dropzone {
            padding: 40px 20px;
          }
          
          .result-grid {
            grid-template-columns: 1fr;
          }
          
          .feature-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentUpload;
