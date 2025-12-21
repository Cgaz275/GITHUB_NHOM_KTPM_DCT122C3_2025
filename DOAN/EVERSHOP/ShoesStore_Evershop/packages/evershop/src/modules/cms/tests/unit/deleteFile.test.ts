/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('fs');
jest.mock('../../../lib/util/getConfig');
jest.mock('../../../lib/util/registry');
jest.mock('../../../lib/helpers');
jest.mock('../../../lib/util/path');

describe('deleteFile Service', () => {
  let deleteFile;
  let fs;
  let getValueSync;

  beforeEach(async () => {
    jest.clearAllMocks();

    const deleteFileModule = await import('../../services/deleteFile.ts');
    deleteFile = deleteFileModule.deleteFile;
    
    fs = await import('fs');
    const registryModule = await import('../../../lib/util/registry.js');
    getValueSync = registryModule.getValueSync;

    // Setup mock implementations
    (getValueSync as jest.Mock).mockImplementation((key, defaultValue) => defaultValue);
  });

  describe('Delete existing file', () => {
    it('should successfully delete an existing file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      await deleteFile('products/image.jpg');

      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should not throw error when file is deleted', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      await expect(deleteFile('products/image.jpg')).resolves.toBeUndefined();
    });

    it('should accept various file types', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      const files = ['image.jpg', 'document.pdf', 'data.json'];

      for (const file of files) {
        await deleteFile(`media/${file}`);
      }

      expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('Delete non-existent file', () => {
    it('should throw error for non-existent file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(deleteFile('products/nonexistent.jpg')).rejects.toThrow(
        'Requested path does not exist'
      );
    });

    it('should not call unlinkSync if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      try {
        await deleteFile('products/nonexistent.jpg');
      } catch {
        // Expected
      }

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('Delete directory path', () => {
    it('should throw error when trying to delete a directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => true
      });

      await expect(deleteFile('products/images')).rejects.toThrow(
        'Requested path is not a file'
      );
    });

    it('should not call unlinkSync when target is directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => true
      });

      try {
        await deleteFile('products/images');
      } catch {
        // Expected
      }

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('Path validation', () => {
    it('should check file existence before deletion', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      await deleteFile('products/image.jpg');

      expect(fs.existsSync).toHaveBeenCalled();
    });

    it('should use lstatSync to verify file type', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      await deleteFile('products/image.jpg');

      expect(fs.lstatSync).toHaveBeenCalled();
    });

    it('should handle nested paths', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      await deleteFile('products/2024/january/image.jpg');

      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });

  describe('File type verification', () => {
    it('should call isDirectory on file stats', async () => {
      const mockStats = {
        isDirectory: jest.fn().mockReturnValue(false)
      };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue(mockStats);

      await deleteFile('products/image.jpg');

      expect(mockStats.isDirectory).toHaveBeenCalled();
    });

    it('should validate file before unlinking', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      await deleteFile('products/image.jpg');

      expect(fs.lstatSync).toHaveBeenCalledBefore(fs.unlinkSync);
    });
  });

  describe('Multiple file deletion', () => {
    it('should delete multiple files in sequence', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });

      const files = ['image1.jpg', 'image2.jpg', 'image3.jpg'];

      for (const file of files) {
        await deleteFile(`products/${file}`);
      }

      expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
    });

    it('should handle deletion errors gracefully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.lstatSync as jest.Mock).mockReturnValueOnce({
        isDirectory: () => false
      });
      (fs.unlinkSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });

      await expect(deleteFile('products/protected.jpg')).rejects.toThrow();
    });
  });

  describe('Error message accuracy', () => {
    it('should provide accurate error message for missing file', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      try {
        await deleteFile('products/missing.jpg');
      } catch (error) {
        expect((error as Error).message).toBe('Requested path does not exist');
      }
    });

    it('should provide accurate error message for directory', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.lstatSync as jest.Mock).mockReturnValue({
        isDirectory: () => true
      });

      try {
        await deleteFile('products/folder');
      } catch (error) {
        expect((error as Error).message).toBe('Requested path is not a file');
      }
    });
  });
});
