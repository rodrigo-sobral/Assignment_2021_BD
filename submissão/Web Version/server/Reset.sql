delete from mural *;
delete from licitacao *;
delete from inbox *;
delete from historico_versoes *;
delete from leilao *;

UPDATE artigo SET leiloado=false;
UPDATE users SET authtoken=null;