/* eslint-disable prettier/prettier */
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts', // Asegúrate de que este archivo existe
  out: './drizzle', //Aqui se guardaran las migraciones
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
