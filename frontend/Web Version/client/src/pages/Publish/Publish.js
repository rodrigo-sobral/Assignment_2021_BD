import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import '../Auction/Auction.css';
// eslint-disable-next-line import/no-anonymous-default-export
export default () => {

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
        
            fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/artigos`, {
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
                    
                    setState({
                        loading: false,
                        error: false,
                        found: false
                    })
                    alert(resp.erro);
                    window.location.href = `/home`;
                }
                else{
                    setState({
                        loading: false,
                        error: false,
                        found: true,
                        products: resp,
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
        console.log(state.products);
    })

    function publish(){
        console.log(state);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("authtoken", JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]);
        var raw = {"artigoId":state.product_id,"titulo":state.title,"descricao":state.description,"limite":state.endDate};
        if(state.min != ""){
            raw["precominimo"] = state.min;
        }
        raw = JSON.stringify(raw);
        console.log(raw);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
            };
        fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/leilao`, requestOptions)
            .then(response => response.json())
            .then(resp => {

                console.log(resp);

                if (resp.erro){
                    
                    setState({
                        loading: false,
                        error: false,
                        found: false
                    })
                    alert(resp.erro);
                }
                else{
                    window.location.href = `/home`;
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

    function setProduct(e){
        state.product_id = e.target.value; 
    }
    function setTitle(e){state.title = e.target.value;}
    function setDescription(e){state.description = e.target.value;}
    function setMin(e){state.min = parseFloat(e.target.value);}
    function setEndDate(e){state.endDate = e.target.value;}
    return (
        <div id="recipe">{state.loading ? (<p>loading...</p>
            ) : state.erro ? (<h1>AN ERROR HAS OCURRED!</h1>
            ) : state.found === false ? (<h1>404 - Auction not found</h1>
            ) : (
                <>
                    <label>Title</label>
                    <input id="title" type="text" value={state.title} onChange={setTitle}></input>
                    <p></p>
                    <div id="recipeBox">
                        <h3>Product</h3>
                            <ul>
                                {state.products.map( ing => (
                                    <li id="product" value = {ing.artigoid} onClick = {setProduct}>
                                        {`${ing.artigoid}. ${ing.nome_artigo}: ${ing.descricao}`}
                                    </li>
                                ))}
                            </ul>
                    </div>
                    <label>Description</label>
                    <input id="description" type="text" value={state.description} onChange={setDescription}></input>
                    <label>Minimum Bid</label>
                    <input id="min" type="text" value={state.min} onChange={setMin}></input>
                    <label>End Date</label>
                    <input id="endDate" type="datetime-local" value={state.endDate} onChange={setEndDate}></input>
                    <p></p>
                    <button onClick={publish}>Publish Auction</button>
                </>
            )}
        </div>
    );
};