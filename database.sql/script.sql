-- Criar e selecionar a base de dados
CREATE DATABASE IF NOT EXISTS eventosenai;
USE eventosenai;


-- 1. Tabela: categorias
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL UNIQUE
);


-- 2. Tabela: eventos
CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  descricao TEXT,
  data_evento DATETIME NOT NULL,
  local VARCHAR(100) NOT NULL,
  vagas INT NOT NULL CHECK (vagas > 0),
  categoria_id INT NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);


-- 3. Tabela: participantes
CREATE TABLE participantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  turma VARCHAR(50) NOT NULL
);


-- 4. Tabela: inscricoes (Relacionamento N:N)
CREATE TABLE inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  participante_id INT NOT NULL,
  data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (evento_id, participante_id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE
);


INSERT INTO categorias (nome) VALUES ('Palestra'), ('Oficina'), ('Workshop');


INSERT INTO eventos (titulo, descricao, data_evento, local, vagas, categoria_id) VALUES
('Workshop de Node.js e REST APIs', 'Aprenda a construir APIs do zero com Express e MySQL.', '2026-11-10 14:00:00', 'Laboratório de Informática 1', 25, 3),
('Oficina de React e Next.js', 'Construção de interfaces modernas com App Router.', '2026-11-12 09:00:00', 'Laboratório de Informática 2', 20, 2),
('Palestra: IA e o Futuro do Dev', 'Impactos da inteligência artificial no mercado de desenvolvimento.', '2026-11-15 19:00:00', 'Auditório Principal', 50, 1),
('Oficina de Modelagem SQL', 'Crie diagramas ER e scripts SQL eficientes.', '2026-11-18 10:30:00', 'Laboratório de Informática 1', 15, 2),
('Palestra: Segurança na Web', 'Boas práticas contra SQL Injection e vulnerabilidades comuns.', '2026-11-20 15:00:00', 'Auditório Principal', 40, 1);


INSERT INTO participantes (nome, email, turma) VALUES
('Ana Beatriz Silva', 'ana.silva@email.com', 'IDEV-2'),
('Carlos Eduardo Santos', 'carlos.santos@email.com', 'IDEV-5'),
('Mariana Soares', 'mariana.soares@email.com', 'IDEV-3'),
('João Victor', 'joao.ramos@email.com', 'IDEV-4'),
('Ryan Araujo', 'ryan.araujo@email.com', 'IDEV-4');