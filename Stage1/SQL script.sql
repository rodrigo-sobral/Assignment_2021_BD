
CREATE TABLE leilao (
	leilaoid	 serial PRIMARY KEY,
	titulo		 VARCHAR(64) NOT NULL,
	descricao	 TEXT,
	preco_minimo	 FLOAT(8) DEFAULT 0,
	limite_data_hora TIMESTAMP NOT NULL,
	fechado		 BOOLEAN NOT NULL DEFAULT False,
	users_userid	 BIGINT NOT NULL,
	artigo_artigoid	 BIGINT NOT NULL
);

CREATE TABLE artigo (
	artigoid	 serial PRIMARY KEY,
	nome_artigo VARCHAR(128) NOT NULL,
	descricao	 TEXT,
	leiloado	 BOOLEAN NOT NULL DEFAULT False
);

CREATE TABLE users (
	userid	 serial PRIMARY KEY,
	username	 VARCHAR(128) UNIQUE NOT NULL,
	password	 VARCHAR(128) NOT NULL,
	email	 VARCHAR(64) UNIQUE NOT NULL,
	authtoken VARCHAR(128) UNIQUE NOT NULL
);

CREATE TABLE mural (
	mensagem	 TEXT NOT NULL,
	leilao_leilaoid BIGINT NOT NULL,
	users_userid	 BIGINT NOT NULL
);

CREATE TABLE licitacao (
	licitacaoid	 BIGINT UNIQUE,
	valor_licitado	 FLOAT(8) NOT NULL,
	users_userid	 BIGINT,
	leilao_leilaoid BIGINT,
	PRIMARY KEY(licitacaoid,users_userid,leilao_leilaoid)
);

CREATE TABLE historico_versoes (
	versaoid	 serial PRIMARY KEY,
	titulo		 VARCHAR(64) NOT NULL,
	descricao	 TEXT,
	preco_minimo	 FLOAT(8) DEFAULT 0,
	limite_data_hora TIMESTAMP NOT NULL,
	leilao_leilaoid	 BIGINT NOT NULL
);

CREATE TABLE inbox (
	mensagem	 TEXT NOT NULL,
	users_userid	 BIGINT NOT NULL,
	leilao_leilaoid BIGINT NOT NULL
);

ALTER TABLE leilao ADD CONSTRAINT leilao_fk1 FOREIGN KEY (users_userid) REFERENCES users(userid);
ALTER TABLE leilao ADD CONSTRAINT leilao_fk2 FOREIGN KEY (artigo_artigoid) REFERENCES artigo(artigoid);
ALTER TABLE mural ADD CONSTRAINT mural_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE mural ADD CONSTRAINT mural_fk2 FOREIGN KEY (users_userid) REFERENCES users(userid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk1 FOREIGN KEY (users_userid) REFERENCES users(userid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE historico_versoes ADD CONSTRAINT historico_versoes_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk1 FOREIGN KEY (users_userid) REFERENCES users(userid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);

