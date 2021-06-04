import { encode } from 'base-64';
import { useState, useEffect } from 'react';
import Post from '../../components/Post'
import Publish from '../Publish/Publish';
import './Home.css';

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const [state, setState] = useState ({
        search: null,
        loading: true,
        error: false,
        auctionsComponents: null
    });
    function setSearch(e){state.search = e.target.value}
    function goToNots(){
        window.location.href = `/notifications`;
    }
    function search(e){
      if(e.keyCode === 13){
        let a = ""; 
        a = document.getElementById("mySearch").value;

        state.search=document.getElementById("mySearch").value;
        //console.log(list)

        fetch('http://diogo-rodrigo-bd.herokuapp.com/dbproj/leiloes/?keyword='+a, {
            method: 'GET',
            redirect: 'follow',
            queries: JSON.stringify({"keyword": a}),
            headers: {
                "authtoken": JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]
            },
        })
        .then(response => response.json())
        .then(resp => {
            resp = {"auctions":resp};
            const auctions = resp["auctions"];

            // eslint-disable-next-line react-hooks/exhaustive-deps
            let popularauctionsComponents = auctions.map( p => (
                <Post 
                    id={p.leilaoid}
                    name={p.titulo}
                    description={p.descricao}
                    product_id={p.artigo_artigoid}
                    

                    onClick = { () => {window.location.href=`/auction/${p.leilaoid}`;}}
                />
            ));
            
            setState({
                loading: false,
                error: false,
                name: resp.name,
                auctionsComponents: popularauctionsComponents
            })

        })
        .catch(error => {
            console.log(error);
            setState({
                loading: false,
                error: true,
                name: "",
                erro: "An error has ocurred!"
            })
        });


        console.log(state.search);
      }
    }

    useEffect(() => {
        if (state.loading === true && state.error === false) {
        
            //fetch('http://127.0.0.1:5000/user', {     //local ?username=...&ini=...&fim=...
            fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/leiloes`, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    "authtoken": JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]
                },
            })
            .then(response => response.json())
            .then(resp => {
                resp = {"auctions":resp};
                const auctions = resp["auctions"];
                
                // eslint-disable-next-line react-hooks/exhaustive-deps
                if(auctions.erro){
                    state.error = true;
                    state.erro = auctions.erro;
                    if(auctions.erro=="Token Invalido"){
                        console.log(localStorage);
                        localStorage.clear();
                        alert(auctions.erro);
                        window.location.href='/signin';
                    }
                }
                let popularauctionsComponents = auctions.map( p => (
                    <Post 
                        id={p.leilaoid}
                        name={p.titulo}
                        description={p.descricao}
                        product_id={p.artigo_artigoid}
                        onClick = { () => {window.location.href=`/auction/${p.leilaoid}`;}}
                    />
                ));
                
                setState({
                    loading: false,
                    error: false,
                    name: resp.name,
                    auctionsComponents: popularauctionsComponents
                })

            })
            .catch(error => {
                console.log(error);
                setState({
                    loading: false,
                    error: true,
                    name: ""
                })
            });
        }
    });

    return (
        <div id="home">
        <div id="notifications">
            <button onClick={goToNots}>Notifications</button>
        </div>
        <div id="searchBar">
            <label>Search Auction</label>
            <input id="mySearch" type="text" placeholder="description, product id" value={state.search} onClick={setSearch} onKeyUp={search}></input>
        </div>
        <button id="publish" onClick = {()=>{window.location.href = `/publish`;}}>Publish</button>
        <div id="feed">
            {state.search === true ? (<label>Currently Running Auctions</label>) : (<label>Currently Running Auctions</label>)}
            {state.loading ? (<p>loading...</p>
            ) : state.error ? (<h1>{state.erro}</h1>
            ) : (
                <div className="auctions">
                    {state.auctionsComponents}
                </div>
            )}
        </div>
        </div>
    );
};