-- Criar e selecionar a base de dados
CREATE DATABASE IF NOT EXISTS eventosenai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
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

-- CONSULTAS QUE FIZEMOS (ETAPA 1)


-- ve os eventos
SELECT 
    e.id, 
    e.titulo, 
    e.descricao, 
    e.data_evento, 
    e.local, 
    e.vagas, 
    c.nome AS categoria
FROM eventos e
JOIN categorias c ON e.categoria_id = c.id;

-- ve os participantes que fizeram inscrições em um determinado evento
SELECT 
    p.id, 
    p.nome, 
    p.email, 
    p.turma, 
    i.data_inscricao
FROM inscricoes i
JOIN participantes p ON i.participante_id = p.id
WHERE i.evento_id = 1; -- Substitua '1' pelo ID do evento desejado

-- ve as vagas totais e restantes
SELECT 
    e.id, 
    e.titulo, 
    e.data_evento, 
    e.local, 
    e.vagas AS vagas_totais,
    c.nome AS categoria,
    COUNT(i.id) AS total_inscritos,
    (e.vagas - COUNT(i.id)) AS vagas_restantes
FROM eventos e
JOIN categorias c ON c.id = e.categoria_id
LEFT JOIN inscricoes i ON i.evento_id = e.id
GROUP BY e.id
ORDER BY e.data_evento;

-- o topico 4 das consultas foi testado e nao duplicou a inscrição