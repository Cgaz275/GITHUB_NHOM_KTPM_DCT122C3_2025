/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('../../../lib/util/getConfig');
jest.mock('../../../lib/util/registry');
jest.mock('../../../lib/helpers');
jest.mock('../../../lib/util/path');

describe('createFolder Service', () => {
  let createFolder;
  let fs;
  let fsPromises;

  beforeEach(async () => {
    jest.clearAllMocks();

    const createFolderModule = await import('../../services/createFolder.ts');
    createFolder = createFolderModule.createFolder;

    fs = await import('fs');
    fsPromises = await import('fs/promises');

    const registryModule = await import('../../../lib/util/registry.js');
    const getValueSync = registryModule.getValueSync;

    // Setup mock implementations
    const getValueSync = registryModule.getValueSync;
    (getValueSync as jest.Mock).mockImplementation((key, defaultValue) => defaultValue);
    (fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Create new folder', () => {
    it('should successfully create a new folder', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('products');

      expect(fsPromises.mkdir).toHaveBeenCalled();
      expect(result).toBe('products');
    });

    it('should return the destination path', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('products/images');

      expect(result).toBe('products/images');
    });

    it('should not throw error on successful creation', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(createFolder('products')).resolves.toBe('products');
    });
  });

  describe('Create nested folders', () => {
    it('should create nested directory structure', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await createFolder('products/images/2024');

      expect(fsPromises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('products/images/2024'),
        { recursive: true }
      );
    });

    it('should handle deep directory paths', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('a/b/c/d/e');

      expect(result).toBe('a/b/c/d/e');
      expect(fsPromises.mkdir).toHaveBeenCalled();
    });

    it('should create intermediate directories', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await createFolder('products/2024/january/images');

      expect(fsPromises.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('products/2024/january/images'),
        { recursive: true }
      );
    });
  });

  describe('Folder already exists', () => {
    it('should return path if folder already exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await createFolder('products');

      expect(result).toBe('products');
    });

    it('should not call mkdir if folder exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await createFolder('products');

      expect(fsPromises.mkdir).not.toHaveBeenCalled();
    });

    it('should handle existing nested folders', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await createFolder('products/images/2024');

      expect(result).toBe('products/images/2024');
    });
  });

  describe('Recursive creation', () => {
    it('should use recursive option in mkdir', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await createFolder('products/images');

      expect(fsPromises.mkdir).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });

    it('should allow mkdir to create parent directories', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await createFolder('new/parent/child');

      const mockCall = (fsPromises.mkdir as jest.Mock).mock.calls[0];
      expect(mockCall[1]).toEqual({ recursive: true });
    });
  });

  describe('Path normalization', () => {
    it('should handle paths with multiple separators', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('products//images');

      expect(result).toBe('products//images');
    });

    it('should return input path without modification', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('products/images/2024');

      expect(result).toBe('products/images/2024');
    });

    it('should preserve path case', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('Products/Images');

      expect(result).toBe('Products/Images');
    });
  });

  describe('Handle deep paths', () => {
    it('should handle 5+ level deep folders', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('a/b/c/d/e/f');

      expect(result).toBe('a/b/c/d/e/f');
      expect(fsPromises.mkdir).toHaveBeenCalled();
    });

    it('should handle very deep directory structures', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const path = Array(20).fill('level').join('/');
      const result = await createFolder(path);

      expect(result).toBe(path);
    });
  });

  describe('Empty path handling', () => {
    it('should handle empty path gracefully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const result = await createFolder('');

      expect(result).toBeDefined();
    });

    it('should handle root path', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await createFolder('/');

      expect(result).toBe('/');
    });
  });

  describe('Existence checking', () => {
    it('should check folder existence before creation', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await createFolder('products');

      expect(fs.existsSync).toHaveBeenCalled();
    });

    it('should handle varying existence states', async () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await createFolder('products');
      await createFolder('images');
      await createFolder('documents');

      expect(fs.existsSync).toHaveBeenCalledTimes(3);
    });
  });
});
