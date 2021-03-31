CREATE TABLE leilao (
	leilaoid		 BIGINT,
	titulo		 VARCHAR(64) NOT NULL,
	descricao		 VARCHAR(1024),
	precominimo		 FLOAT(8) DEFAULT 0,
	limite_data		 DATE NOT NULL,
	limite_hora		 VARCHAR(8) NOT NULL,
	fechado		 BOOL NOT NULL DEFAULT False,
	vencedorid		 BIGINT,
	vendedor_user_userid BIGINT,
	PRIMARY KEY(leilaoid,vendedor_user_userid)
);

CREATE TABLE produto (
	artigoid			 BIGINT,
	nome_produto		 VARCHAR(128) NOT NULL,
	leiloado			 BOOL NOT NULL DEFAULT False,
	leilao_leilaoid		 BIGINT,
	leilao_vendedor_user_userid BIGINT,
	PRIMARY KEY(artigoid,leilao_leilaoid,leilao_vendedor_user_userid)
);

CREATE TABLE user (
	userid	 BIGINT,
	email	 VARCHAR(64) NOT NULL,
	username VARCHAR(128) NOT NULL,
	password VARCHAR(32) NOT NULL,
	PRIMARY KEY(userid)
);

CREATE TABLE vendedor (
	user_userid BIGINT,
	PRIMARY KEY(user_userid)
);

CREATE TABLE comprador (
	user_userid BIGINT,
	PRIMARY KEY(user_userid)
);

CREATE TABLE inbox (
	user_userid BIGINT,
	PRIMARY KEY(user_userid)
);

CREATE TABLE mensagem (
	remetente		 VARCHAR(128) NOT NULL,
	conteudo		 VARCHAR(4096) NOT NULL,
	mural_leilao_leilaoid BIGINT,
	PRIMARY KEY(mural_leilao_leilaoid)
);

CREATE TABLE historico (
	valor_licitado		 FLOAT(8) NOT NULL,
	comprador_user_userid	 BIGINT,
	leilao_leilaoid		 BIGINT,
	leilao_vendedor_user_userid BIGINT,
	PRIMARY KEY(leilao_leilaoid,leilao_vendedor_user_userid)
);

CREATE TABLE mural (
	leilao_leilaoid		 BIGINT,
	leilao_vendedor_user_userid BIGINT,
	PRIMARY KEY(leilao_leilaoid,leilao_vendedor_user_userid)
);

CREATE TABLE inbox_mensagem (
	inbox_user_userid		 BIGINT,
	mensagem_mural_leilao_leilaoid BIGINT,
	PRIMARY KEY(inbox_user_userid,mensagem_mural_leilao_leilaoid)
);

ALTER TABLE leilao ADD CONSTRAINT leilao_fk1 FOREIGN KEY (vendedor_user_userid) REFERENCES vendedor(user_userid);
ALTER TABLE produto ADD CONSTRAINT produto_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE produto ADD CONSTRAINT produto_fk2 FOREIGN KEY (leilao_vendedor_user_userid) REFERENCES leilao(vendedor_user_userid);
ALTER TABLE vendedor ADD CONSTRAINT vendedor_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE comprador ADD CONSTRAINT comprador_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE mensagem ADD CONSTRAINT mensagem_fk1 FOREIGN KEY (mural_leilao_leilaoid) REFERENCES mural(leilao_leilaoid);
ALTER TABLE historico ADD CONSTRAINT historico_fk1 FOREIGN KEY (comprador_user_userid) REFERENCES comprador(user_userid);
ALTER TABLE historico ADD CONSTRAINT historico_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE historico ADD CONSTRAINT historico_fk3 FOREIGN KEY (leilao_vendedor_user_userid) REFERENCES leilao(vendedor_user_userid);
ALTER TABLE mural ADD CONSTRAINT mural_fk1 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE mural ADD CONSTRAINT mural_fk2 FOREIGN KEY (leilao_vendedor_user_userid) REFERENCES leilao(vendedor_user_userid);
ALTER TABLE inbox_mensagem ADD CONSTRAINT inbox_mensagem_fk1 FOREIGN KEY (inbox_user_userid) REFERENCES inbox(user_userid);
ALTER TABLE inbox_mensagem ADD CONSTRAINT inbox_mensagem_fk2 FOREIGN KEY (mensagem_mural_leilao_leilaoid) REFERENCES mensagem(mural_leilao_leilaoid);

