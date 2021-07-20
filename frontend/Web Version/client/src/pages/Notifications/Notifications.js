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


    useEffect(() => {
        if (state.loading === true && state.error === false) {
        
            fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/user/inbox`, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                    "authtoken": JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]
                },
            })
            .then(response => response.json())
            .then(resp => {
                console.log(resp);
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
                        messages : resp.inbox,
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
    function clearNots(){
        fetch(`http://diogo-rodrigo-bd.herokuapp.com/dbproj/user/inbox`, {
                method: 'DELETE',
                redirect: 'follow',
                headers: {
                    "authtoken": JSON.parse(localStorage.getItem("tokens"))[localStorage.getItem("username")]
                },
            })
            .then(response => response.json())
            .then(resp => {

                if (resp.erro){
                    alert(resp.erro)
                }
                else{
                    window.location.reload(true);
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
    return (
        <div id="recipe">{state.loading ? (<p>loading...</p>
            ) : state.erro ? (<h1>AN ERROR HAS OCURRED!</h1>
            ) : state.found === false ? (<h1>404 - Recipe not Found</h1>
            ) : (
                <>
                    <div id="recipeBox">
                        <h2>Notifications</h2>
                            <ul>
                                {state.messages.map( ing => (
                                    <li key = {ing.id}>
                                        {`${ing.titulo}: ${ing.mensagem}`}
                                    </li>
                                ))}
                            </ul>
                    </div>
                    <button id= "clearnots" onClick={clearNots}>Clear Notifications</button>
                </>
            )}
        </div>
    );
};