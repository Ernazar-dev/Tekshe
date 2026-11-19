import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/errors.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Joq marshrut: ${req.method} ${req.path}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: 'Maǵlıwmatlar qáte toltırılǵan', errors: err.flatten().fieldErrors });
    return;
  }
  if (err instanceof HttpError) {
    // details — maydan qáteleri ({ maydan: [xabar] }), frontend olardı forma astında kórsetedi
    res.status(err.status).json({ message: err.message, errors: err.details });
    return;
  }
  // express.json() qáteleri — buzılǵan JSON yamasa júdá úlken dene
  const status = (err as { status?: number }).status;
  if (status === 400 || status === 413) {
    res.status(status).json({ message: status === 413 ? 'Soraw júdá úlken' : 'JSON formatı qáte' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Serverde kútilmegen qáte' });
};
