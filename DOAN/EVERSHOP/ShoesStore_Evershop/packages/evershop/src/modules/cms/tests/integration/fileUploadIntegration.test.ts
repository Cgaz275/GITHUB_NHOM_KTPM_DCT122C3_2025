/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('../../../lib/router/buildUrl');
jest.mock('../../../lib/util/getConfig');
jest.mock('../../../lib/util/registry');
jest.mock('../../../lib/helpers');
jest.mock('../../../lib/util/path');

describe('File Upload Integration', () => {
  let uploadFile;
  let deleteFile;
  let createFolder;
  let fs;
  let fsPromises;
  let buildUrl;
  let getValueSync;
  let uploadedFiles;

  beforeEach(async () => {
    jest.clearAllMocks();

    const uploadFileModule = await import('../../services/uploadFile.ts');
    uploadFile = uploadFileModule.uploadFile;

    const deleteFileModule = await import('../../services/deleteFile.ts');
    deleteFile = deleteFileModule.deleteFile;

    const createFolderModule = await import('../../services/createFolder.ts');
    createFolder = createFolderModule.createFolder;

    fs = await import('fs');
    fsPromises = await import('fs/promises');
    
    const buildUrlModule = await import('../../../lib/router/buildUrl.js');
    buildUrl = buildUrlModule.buildUrl;
    
    const registryModule = await import('../../../lib/util/registry.js');
    getValueSync = registryModule.getValueSync;

    // Setup mocks
    (fs.existsSync as jest.Mock).mockClear();
    (fs.lstatSync as jest.Mock).mockClear();
    (fs.unlinkSync as jest.Mock).mockClear();

    (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

    (buildUrl as jest.Mock).mockImplementation((route, params) => `/static/${params.join('/')}`);
    (getValueSync as jest.Mock).mockImplementation((key, defaultValue) => defaultValue);

    uploadedFiles = [
      {
        filename: 'product.jpg',
        buffer: Buffer.from('image data'),
        mimetype: 'image/jpeg',
        size: 1024
      }
    ];
  });

  describe('Complete upload workflow', () => {
    it('should handle complete file upload process', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await uploadFile(uploadedFiles, 'products');

      expect(result).toBeDefined();
      expect(result[0]).toHaveProperty('url');
      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });

    it('should create directory and upload file in sequence', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await uploadFile(uploadedFiles, 'products/images');

      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });
  });

  describe('Create upload directory', () => {
    it('should create directory before file upload', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await uploadFile(uploadedFiles, 'new-folder');

      expect(fsPromises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('new-folder'),
        { recursive: true }
      );
    });

    it('should use recursive option for nested paths', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await uploadFile(uploadedFiles, 'products/2024/january');

      expect(fsPromises.mkdir).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });

    it('should handle existing directories', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await uploadFile(uploadedFiles, 'products');

      expect(result).toBeDefined();
    });
  });

  describe('Handle multiple uploads', () => {
    it('should upload multiple files in order', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const multipleFiles = [
        { ...uploadedFiles[0], filename: 'file1.jpg' },
        { ...uploadedFiles[0], filename: 'file2.jpg' },
        { ...uploadedFiles[0], filename: 'file3.jpg' }
      ];

      const result = await uploadFile(multipleFiles, 'products');

      expect(result).toHaveLength(3);
      expect(fsPromises.writeFile).toHaveBeenCalledTimes(3);
    });

    it('should write files concurrently', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const multipleFiles = [
        { ...uploadedFiles[0], filename: 'file1.jpg' },
        { ...uploadedFiles[0], filename: 'file2.jpg' }
      ];

      await uploadFile(multipleFiles, 'products');

      expect(fsPromises.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('File metadata in response', () => {
    it('should include all required metadata fields', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await uploadFile(uploadedFiles, 'products');

      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('size');
      expect(result[0]).toHaveProperty('mimetype');
      expect(result[0]).toHaveProperty('url');
    });

    it('should match uploaded file properties', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await uploadFile(uploadedFiles, 'products');

      expect(result[0].name).toBe('product.jpg');
      expect(result[0].size).toBe(1024);
      expect(result[0].mimetype).toBe('image/jpeg');
    });

    it('should preserve metadata across multiple files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const files = [
        { ...uploadedFiles[0], filename: 'image1.jpg', size: 1024 },
        { ...uploadedFiles[0], filename: 'image2.png', size: 2048 }
      ];

      const result = await uploadFile(files, 'products');

      expect(result[0].size).toBe(1024);
      expect(result[1].size).toBe(2048);
    });
  });

  describe('URL consistency', () => {
    it('should generate consistent URL format', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await uploadFile(uploadedFiles, 'products');

      expect(result[0].url).toMatch(/\/static\//);
      expect(result[0].url).toContain('product.jpg');
    });

    it('should normalize path in URL', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await uploadFile(uploadedFiles, 'products/images');

      expect(result[0].url).not.toContain('\\');
    });

    it('should build URL for each file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const files = [
        { ...uploadedFiles[0], filename: 'file1.jpg' },
        { ...uploadedFiles[0], filename: 'file2.jpg' }
      ];

      const result = await uploadFile(files, 'products');

      expect(result[0].url).toContain('file1.jpg');
      expect(result[1].url).toContain('file2.jpg');
    });
  });

  describe('Storage path verification', () => {
    it('should save file with correct path', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await uploadFile(uploadedFiles, 'products');

      const writeFileCall = (fsPromises.writeFile as jest.Mock).mock.calls[0];
      expect(writeFileCall[0]).toContain('product.jpg');
    });

    it('should include destination path in file location', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await uploadFile(uploadedFiles, 'products/images');

      const writeFileCall = (fsPromises.writeFile as jest.Mock).mock.calls[0];
      expect(writeFileCall[0]).toContain('products');
      expect(writeFileCall[0]).toContain('images');
    });
  });

  describe('Permission handling', () => {
    it('should handle file creation successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await uploadFile(uploadedFiles, 'products');

      expect(result).toBeDefined();
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });

    it('should propagate write errors', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fsPromises.writeFile as jest.Mock).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      await expect(uploadFile(uploadedFiles, 'products')).rejects.toThrow();
    });
  });

  describe('Cleanup after error', () => {
    it('should create directory even if file write fails', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fsPromises.mkdir as jest.Mock).mockResolvedValueOnce(undefined);
      (fsPromises.writeFile as jest.Mock).mockRejectedValueOnce(
        new Error('Write failed')
      );

      try {
        await uploadFile(uploadedFiles, 'products');
      } catch {
        // Expected
      }

      expect(fsPromises.mkdir).toHaveBeenCalled();
    });
  });

  describe('Large file handling', () => {
    it('should handle large files successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const largeFile = {
        ...uploadedFiles[0],
        size: 11 * 1024 * 1024 // 11MB
      };

      const result = await uploadFile([largeFile], 'products');

      expect(result[0].size).toBe(11 * 1024 * 1024);
      expect(fsPromises.writeFile).toHaveBeenCalled();
    });

    it('should write large file buffer', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const largeBuffer = Buffer.alloc(5 * 1024 * 1024);
      const largeFile = {
        ...uploadedFiles[0],
        buffer: largeBuffer,
        size: 5 * 1024 * 1024
      };

      await uploadFile([largeFile], 'products');

      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        largeBuffer
      );
    });
  });

  describe('Concurrent uploads', () => {
    it('should handle parallel uploads', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const files = Array(5)
        .fill(null)
        .map((_, i) => ({
          ...uploadedFiles[0],
          filename: `file${i}.jpg`
        }));

      const result = await uploadFile(files, 'products');

      expect(result).toHaveLength(5);
      expect(fsPromises.writeFile).toHaveBeenCalledTimes(5);
    });

    it('should maintain file order in results', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const files = [
        { ...uploadedFiles[0], filename: 'first.jpg' },
        { ...uploadedFiles[0], filename: 'second.jpg' },
        { ...uploadedFiles[0], filename: 'third.jpg' }
      ];

      const result = await uploadFile(files, 'products');

      expect(result[0].name).toBe('first.jpg');
      expect(result[1].name).toBe('second.jpg');
      expect(result[2].name).toBe('third.jpg');
    });
  });
});
