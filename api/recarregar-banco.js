require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  console.log('Conectado ao MySQL com charset utf8mb4.');

  await connection.query('DROP DATABASE IF EXISTS eventosenai;');
  await connection.query('CREATE DATABASE eventosenai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  await connection.query('USE eventosenai;');

  const scriptPath = path.join(__dirname, '..', 'database', 'script.sql');
  const sql = fs.readFileSync(scriptPath, 'utf8');

  // Remove linhas de comentários e seleciona comandos
  await connection.query(sql);

  console.log('Script executado com sucesso e encoding UTF-8 preservado!');

  const [eventos] = await connection.query('SELECT id, titulo, descricao, local FROM eventos;');
  console.log('Eventos no banco:');
  eventos.forEach((e) => console.log(`- ${e.titulo} (${e.local})`));

  const [participantes] = await connection.query('SELECT id, nome FROM participantes;');
  console.log('\nParticipantes no banco:');
  participantes.forEach((p) => console.log(`- ${p.nome}`));

  await connection.end();
}

main().catch((err) => {
  console.error('Erro ao recarregar banco:', err);
  process.exit(1);
});
