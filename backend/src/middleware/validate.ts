import type { RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

/** Soraw denesin tekseredi hám tazalanǵan mánisti `req.body`ǵa jazadı */
export const validateBody =
  <S extends ZodTypeAny>(schema: S): RequestHandler =>
  (req, _res, next) => {
    req.body = schema.parse(req.body) as z.infer<S>;
    next();
  };

/** Query parametrlerin tekseredi; nátiyje `res.locals.query`da */
export const validateQuery =
  <S extends ZodTypeAny>(schema: S): RequestHandler =>
  (req, res, next) => {
    res.locals.query = schema.parse(req.query) as z.infer<S>;
    next();
  };
