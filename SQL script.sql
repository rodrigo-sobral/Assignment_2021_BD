CREATE TABLE leilao (
	leilaoid	 BIGINT,
	titulo		 VARCHAR(64) NOT NULL,
	descricao	 TEXT(2048),
	preco_minimo	 FLOAT(8) DEFAULT 0,
	limite_data_hora TIMESTAMP NOT NULL,
	fechado		 BOOL NOT NULL DEFAULT False,
	user_userid	 BIGINT,
	artigo_artigoid	 BIGINT UNIQUE NOT NULL,
	PRIMARY KEY(leilaoid,user_userid)
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
	mensagem		 TEXT(2048) NOT NULL,
	user_userid	 BIGINT,
	leilao_leilaoid	 BIGINT,
	leilao_user_userid BIGINT,
	PRIMARY KEY(leilao_leilaoid,leilao_user_userid)
);

CREATE TABLE licitacao (
	valor_licitado	 FLOAT(8) NOT NULL,
	user_userid	 BIGINT,
	leilao_leilaoid	 BIGINT,
	leilao_user_userid BIGINT,
	PRIMARY KEY(user_userid,leilao_leilaoid,leilao_user_userid)
);

CREATE TABLE historico_versoes (
	versaoid		 BIGINT,
	titulo		 VARCHAR(64) NOT NULL,
	descricao		 TEXT(2048),
	preco_minimo	 FLOAT(8) DEFAULT 0,
	limite_data_hora	 TIMESTAMP NOT NULL,
	leilao_leilaoid	 BIGINT UNIQUE NOT NULL,
	leilao_user_userid BIGINT UNIQUE NOT NULL,
	PRIMARY KEY(versaoid)
);

CREATE TABLE inbox (
	mensagem		 TEXT(2048) NOT NULL,
	leilao_leilaoid	 BIGINT NOT NULL,
	leilao_user_userid BIGINT NOT NULL,
	user_userid	 BIGINT,
	PRIMARY KEY(user_userid)
);

ALTER TABLE leilao ADD CONSTRAINT leilao_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE leilao ADD CONSTRAINT leilao_fk2 FOREIGN KEY (artigo_artigoid) REFERENCES artigo(artigoid);
ALTER TABLE mural ADD CONSTRAINT mural_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE mural ADD CONSTRAINT mural_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE mural ADD CONSTRAINT mural_fk3 FOREIGN KEY (leilao_user_userid) REFERENCES leilao(user_userid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE licitacao ADD CONSTRAINT licitacao_fk3 FOREIGN KEY (leilao_user_userid) REFERENCES leilao(user_userid);
ALTER TABLE historico_versoes ADD CONSTRAINT historico_versoes_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE historico_versoes ADD CONSTRAINT historico_versoes_fk2 FOREIGN KEY (leilao_user_userid) REFERENCES leilao(user_userid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk2 FOREIGN KEY (leilao_user_userid) REFERENCES leilao(user_userid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk3 FOREIGN KEY (user_userid) REFERENCES user(userid);

