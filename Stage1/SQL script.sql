CREATE TABLE leilao (
	leilaoid	 BIGINT,
	titulo		 VARCHAR(64) NOT NULL,
	descricao	 TEXT(2048),
	preco_minimo	 FLOAT(8) DEFAULT 0,
	limite_data_hora TIMESTAMP NOT NULL,
	fechado		 BOOL NOT NULL DEFAULT False,
	user_userid	 BIGINT NOT NULL,
	artigo_artigoid	 BIGINT UNIQUE NOT NULL,
	PRIMARY KEY(leilaoid)
);

CREATE TABLE artigo (
	artigoid	 BIGINT,
	nome_artigo VARCHAR(128) NOT NULL,
	descricao	 TEXT(2048),
	leiloado	 BOOL NOT NULL DEFAULT False,
	PRIMARY KEY(artigoid)
);

CREATE TABLE user (
	userid	 BIGINT,
	email	 VARCHAR(64) UNIQUE NOT NULL,
	username VARCHAR(128) UNIQUE NOT NULL,
	password VARCHAR(32) NOT NULL,
	PRIMARY KEY(userid)
);

CREATE TABLE mural (
	mensagem	 TEXT(2048) NOT NULL,
	user_userid	 BIGINT,
	leilao_leilaoid BIGINT NOT NULL,
	PRIMARY KEY(user_userid)
);

CREATE TABLE licitacao (
	valor_licitado	 FLOAT(8) NOT NULL,
	user_userid	 BIGINT,
	leilao_leilaoid BIGINT,
	PRIMARY KEY(user_userid,leilao_leilaoid)
);

CREATE TABLE historico_versoes (
	versaoid	 BIGINT,
	titulo		 VARCHAR(64) NOT NULL,
	descricao	 TEXT(2048),
	preco_minimo	 FLOAT(8) DEFAULT 0,
	limite_data_hora TIMESTAMP NOT NULL,
	leilao_leilaoid	 BIGINT NOT NULL,
	PRIMARY KEY(versaoid)
);

CREATE TABLE inbox (
	mensagem	 TEXT(2048) NOT NULL,
	user_userid	 BIGINT NOT NULL,
	leilao_leilaoid BIGINT NOT NULL
);

ALTER TABLE leilao ADD CONSTRAINT leilao_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE leilao ADD CONSTRAINT leilao_fk2 FOREIGN KEY (artigo_artigoid) REFERENCES artigo(artigoid);
ALTER TABLE mural ADD CONSTRAINT mural_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE mural ADD CONSTRAINT mural_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE historico_versoes ADD CONSTRAINT historico_versoes_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
