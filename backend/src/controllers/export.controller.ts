import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import * as exportService from '../services/export.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { NotFoundError } from '../utils/errors';

export const triggerExport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exportRecord = await exportService.triggerExport(req.params['id'] as string, req.user.id);
    sendSuccess(res, exportRecord, 202);
  } catch (err) {
    next(err);
  }
};

export const getExportStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exportRecord = await exportService.getExportStatus(req.params['exportId'] as string, req.user.id);
    sendSuccess(res, exportRecord);
  } catch (err) {
    next(err);
  }
};

export const downloadExport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exportRecord = await exportService.getExportStatus(req.params['exportId'] as string, req.user.id);
    if (exportRecord.status !== 'completed' || !exportRecord.filePath) {
      throw new NotFoundError('Export file is not ready');
    }

    const filePath = path.resolve(exportRecord.filePath);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError('Export file not found on disk');
    }

    res.download(filePath, `export-${exportRecord.id}.csv`);
  } catch (err) {
    next(err);
  }
};

export const listExports = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const exports = await exportService.getUserExports(req.user.id);
    sendSuccess(res, exports);
  } catch (err) {
    next(err);
  }
};
