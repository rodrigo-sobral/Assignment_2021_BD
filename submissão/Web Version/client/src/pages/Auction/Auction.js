import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import './Auction.css';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {

    function newMessage(){
        var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("authtoken", JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({"mensagem":state.message}),
            redirect: 'follow'
            };
        fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/leilao/mural/?leilaoId=${state.id}`, requestOptions)
            .then(response => response.json())
            .then(resp => {

                console.log(resp);

                if (resp.erro){
                    alert(resp.erro);  
                }
                else{
                    window.location.reload(true);
                }

            })
            .catch(error => {
                alert(error.message);  
                window.location.href = `/`;
            });
    }

    function makeBid(){
        fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/licitar/?leilaoId=${state.id}&licitacao=${state.bid}`, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    "authtoken": JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]
                },
            })
            .then(response => response.json())
            .then(resp => {

                console.log(resp);

                if (resp.erro){
                    alert(resp.erro);  
                }
                else{
                    window.location.reload(true);
                }

            })
            .catch(error => {
                alert(error.message);  
                window.location.href = `/`;
            });
    }
    const [state, setState] = useState ({
        loading: true,
        error: false,
        found: false,
        name: "",
        author: "",
        description: "",
    });

    let { id } = useParams();

    useEffect(() => {
        if (state.loading === true && state.error === false) {
        
            fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/leilao/?leilaoId=${id}`, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    "authtoken": JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]
                },
            })
            .then(response => response.json())
            .then(resp => {
                if (resp === false){
                    
                    setState({
                        loading: false,
                        error: false,
                        found: false
                    })
                }
                else{
                    setState({
                        loading: false,
                        error: false,
                        found: true,
                        id: resp.leilaoid,
                        name: resp.titulo,
                        author_id: resp.users_userid,
                        author: resp.autor,
                        description: resp.descricao,
                        minprice: resp.precominimo,
                        lim: resp.limite,
                        closed: resp.fechado,
                        winner_id: resp.vencedorid,
                        product_id: resp.artigo_artigoid,
                        product: resp.artigo,
                        message: undefined,
                        messages: {"messages":resp.mural},
                        bid: undefined,
                        bids: {"bids":resp.licitacoes},
                        versions: resp.versoes_anteriores,
                    })
                }

            })
            .catch(error => {
                console.log(error);
                setState({
                    loading: false,
                    error: true,
                })
            });
        }
    })

    function setBid(e){state.bid = e.target.value;}
    function setMessage(e){state.message = e.target.value;}
    return (
        <div id="recipe">{state.loading ? (<p>loading...</p>
            ) : state.erro ? (<h1>AN ERROR HAS OCURRED!</h1>
            ) : state.found === false ? (<h1>404 - Recipe not Found</h1>
            ) : (
                <>
                    <h1>{state.name}</h1>
                    <h3>Product: {state.product}</h3>
                    <h3>Author: {state.author}</h3>
                    <p>Description: {state.description}</p>
                    <h3>Minimum bid: {state.minprice}</h3>
                    <h3>Closes at: {state.lim}</h3>
                    <div id="recipeBox">
                        <h2>Bids</h2>
                            <ul>
                                {state.bids["bids"].map( ing => (
                                    <li key = {ing.id}>
                                        {`${ing.username}: ${ing.valor_licitado}€`}
                                    </li>
                                ))}
                            </ul>
                        <input id="bid" type="text" placeholder="your bid" value={state.bid} onChange={setBid}></input>
                        <button onClick={makeBid}>Make bid</button>
                        <h2>Messages</h2>
                        <ul>
                            {state.messages["messages"].map( ing => (
                                <li key = {ing.id}>
                                    {`${ing.username}: "${ing.mensagem}"`}
                                </li>
                            ))}
                        </ul>
                        <input id="message" type="text" placeholder="post a message" value={state.message} onChange={setMessage}></input>
                        <button onClick={newMessage}>Post Message</button>
                    </div>
                </>
            )}
        </div>
    );
};