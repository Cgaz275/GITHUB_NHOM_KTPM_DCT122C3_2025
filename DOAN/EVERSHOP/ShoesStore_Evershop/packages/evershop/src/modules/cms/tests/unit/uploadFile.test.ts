/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('fs/promises');
jest.mock('../../../lib/router/buildUrl');
jest.mock('../../../lib/util/getConfig');
jest.mock('../../../lib/util/registry');
jest.mock('../../../lib/helpers');
jest.mock('../../../lib/util/path');

describe('uploadFile Service', () => {
  let mockFiles;
  let uploadFile;
  let fsPromises;
  let buildUrl;
  let getValueSync;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Dynamically import after mocks are set up
    const uploadFileModule = await import('../../services/uploadFile.ts');
    uploadFile = uploadFileModule.uploadFile;
    
    fsPromises = await import('fs/promises');
    const buildUrlModule = await import('../../../lib/router/buildUrl.js');
    buildUrl = buildUrlModule.buildUrl;
    const registryModule = await import('../../../lib/util/registry.js');
    getValueSync = registryModule.getValueSync;

    mockFiles = [
      {
        filename: 'image.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024
      },
      {
        filename: 'document.pdf',
        buffer: Buffer.from('fake pdf data'),
        mimetype: 'application/pdf',
        size: 2048
      }
    ];

    // Setup mock implementations
    (fsPromises.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
    (buildUrl as jest.Mock).mockImplementation((route, params) => `/static/${params.join('/')}`);
    (getValueSync as jest.Mock).mockImplementation((key, defaultValue) => defaultValue);
  });

  describe('Single file upload', () => {
    it('should successfully upload a single file', async () => {
      const result = await uploadFile([mockFiles[0]], 'products');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'image.jpg');
      expect(result[0]).toHaveProperty('mimetype', 'image/jpeg');
      expect(result[0]).toHaveProperty('size', 1024);
      expect(result[0]).toHaveProperty('url');
    });

    it('should create destination directory', async () => {
      await uploadFile([mockFiles[0]], 'products/images');

      expect(fsPromises.mkdir).toHaveBeenCalled();
    });

    it('should write file to destination', async () => {
      await uploadFile([mockFiles[0]], 'products');

      expect(fsPromises.writeFile).toHaveBeenCalled();
      expect(fsPromises.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('image.jpg'),
        mockFiles[0].buffer
      );
    });
  });

  describe('Multiple files upload', () => {
    it('should upload multiple files successfully', async () => {
      const result = await uploadFile(mockFiles, 'products');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('image.jpg');
      expect(result[1].name).toBe('document.pdf');
    });

    it('should handle multiple files with different types', async () => {
      const result = await uploadFile(mockFiles, 'media');

      expect(result[0].mimetype).toBe('image/jpeg');
      expect(result[1].mimetype).toBe('application/pdf');
    });

    it('should write all files', async () => {
      await uploadFile(mockFiles, 'products');

      expect(fsPromises.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('Empty files array', () => {
    it('should return empty array for empty input', async () => {
      const result = await uploadFile([], 'products');

      expect(result).toEqual([]);
    });
  });

  describe('File metadata', () => {
    it('should include file size in response', async () => {
      const result = await uploadFile([mockFiles[0]], 'products');

      expect(result[0].size).toBe(1024);
    });

    it('should preserve filename in response', async () => {
      const result = await uploadFile([mockFiles[0]], 'products');

      expect(result[0].name).toBe('image.jpg');
    });

    it('should generate correct URL format', async () => {
      const result = await uploadFile([mockFiles[0]], 'products');

      expect(result[0].url).toContain('image.jpg');
      expect(result[0].url).toContain('products');
    });

    it('should include mimetype in response', async () => {
      const result = await uploadFile([mockFiles[0]], 'products');

      expect(result[0]).toHaveProperty('mimetype');
      expect(result[0].mimetype).toBe('image/jpeg');
    });
  });

  describe('Path handling', () => {
    it('should handle nested destination paths', async () => {
      await uploadFile([mockFiles[0]], 'products/images/2024');

      expect(fsPromises.mkdir).toHaveBeenCalled();
    });

    it('should normalize paths with backslashes', async () => {
      const result = await uploadFile([mockFiles[0]], 'products\\images');

      expect(result[0].url).not.toContain('\\');
    });

    it('should handle paths without leading slash', async () => {
      const result = await uploadFile([mockFiles[0]], 'products');

      expect(result[0].url).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Valid MIME types', () => {
    it('should accept image/jpeg files', async () => {
      const jpegFile = { ...mockFiles[0], mimetype: 'image/jpeg' };
      const result = await uploadFile([jpegFile], 'products');

      expect(result[0].mimetype).toBe('image/jpeg');
    });

    it('should accept image/png files', async () => {
      const pngFile = { ...mockFiles[0], filename: 'image.png', mimetype: 'image/png' };
      const result = await uploadFile([pngFile], 'products');

      expect(result[0].mimetype).toBe('image/png');
    });

    it('should accept application/pdf files', async () => {
      const result = await uploadFile([mockFiles[1]], 'documents');

      expect(result[0].mimetype).toBe('application/pdf');
    });
  });
});
