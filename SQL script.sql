CREATE TABLE leilao (
	leilaoid		 BIGINT,
	titulo		 VARCHAR(64) NOT NULL,
	descricao		 VARCHAR(1024),
	precominimo		 FLOAT(8) DEFAULT 0,
	limite_data		 VARCHAR(16) NOT NULL,
	limite_hora		 VARCHAR(8) NOT NULL,
	mural		 VARCHAR(4096),
	fechado		 BOOL NOT NULL DEFAULT False,
	vencedorid		 BIGINT,
	vendedor_user_userid	 BIGINT,
	produto_artigoid	 BIGINT,
	vendedor_user_userid1 BIGINT NOT NULL,
	PRIMARY KEY(leilaoid,vendedor_user_userid,produto_artigoid)
);

CREATE TABLE produto (
	artigoid	 BIGINT,
	nome_produto VARCHAR(128) NOT NULL,
	PRIMARY KEY(artigoid)
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
	remetente	 VARCHAR(128) NOT NULL,
	conteudo		 VARCHAR(4096) NOT NULL,
	inbox_user_userid BIGINT,
	PRIMARY KEY(inbox_user_userid)
);

CREATE TABLE historico (
	valor_licitado		 FLOAT(8) NOT NULL,
	comprador_user_userid	 BIGINT,
	leilao_leilaoid		 BIGINT,
	leilao_vendedor_user_userid BIGINT,
	leilao_produto_artigoid	 BIGINT,
	PRIMARY KEY(leilao_leilaoid,leilao_vendedor_user_userid,leilao_produto_artigoid)
);

ALTER TABLE leilao ADD CONSTRAINT leilao_fk1 FOREIGN KEY (vendedor_user_userid) REFERENCES vendedor(user_userid);
ALTER TABLE leilao ADD CONSTRAINT leilao_fk2 FOREIGN KEY (produto_artigoid) REFERENCES produto(artigoid);
ALTER TABLE leilao ADD CONSTRAINT leilao_fk3 FOREIGN KEY (vendedor_user_userid1) REFERENCES vendedor(user_userid);
ALTER TABLE vendedor ADD CONSTRAINT vendedor_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE comprador ADD CONSTRAINT comprador_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE inbox ADD CONSTRAINT inbox_fk1 FOREIGN KEY (user_userid) REFERENCES user(userid);
ALTER TABLE mensagem ADD CONSTRAINT mensagem_fk1 FOREIGN KEY (inbox_user_userid) REFERENCES inbox(user_userid);
ALTER TABLE historico ADD CONSTRAINT historico_fk1 FOREIGN KEY (comprador_user_userid) REFERENCES comprador(user_userid);
ALTER TABLE historico ADD CONSTRAINT historico_fk2 FOREIGN KEY (leilao_leilaoid) REFERENCES leilao(leilaoid);
ALTER TABLE historico ADD CONSTRAINT historico_fk3 FOREIGN KEY (leilao_vendedor_user_userid) REFERENCES leilao(vendedor_user_userid);
ALTER TABLE historico ADD CONSTRAINT historico_fk4 FOREIGN KEY (leilao_produto_artigoid) REFERENCES leilao(produto_artigoid);

