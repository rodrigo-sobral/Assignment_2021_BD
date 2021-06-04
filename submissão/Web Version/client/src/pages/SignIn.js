import '../styles/Sign.css';
let base64 = require('base-64');

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    const state = {
        username: "",
        password: ""
    }

    const setUsername = (event) => {
        state.username = event.target.value;
    }
    const setPassword = (event) => {
        state.password = event.target.value;
    }

    const signin = () => {
        
        var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json"); 
            delete state.passwordConfirmation;
            var raw = JSON.stringify(state);
            

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        // fetch('http://127.0.0.1:5000/login', {   //local
        fetch('http://diogo-rodrigo-bd.herokuapp.com/dbproj/user',requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.erro){
                alert(result.erro);
                if(localStorage.getItem("tokens") && JSON.parse(localStorage.getItem("tokens"))[state.username]){
                    localStorage.setItem("logged", true);
                    localStorage.setItem("username", state.username);
                    window.location.href = `/home`;
                }
            }
            else{
                if(!localStorage.getItem("tokens")){
                    localStorage.setItem("tokens","{}"); 
                }
                let tokens = JSON.parse(localStorage.getItem("tokens"));
                tokens[state.username] = result.authToken;
                localStorage.setItem("tokens",JSON.stringify(tokens));
                localStorage.setItem("logged", true);
                localStorage.setItem("username", state.username);
                window.location.href = `/home`;
            }
        })
        .catch(error => {
            console.log(error);
            alert('Unable to reach API.');
        });

        //console.log(localStorage.getItem("token"))
    }

    return (
        <div id="sign">
            <div id="inner">
                <h2>Lights, Camera, Auction</h2>

                <label>Username</label>
                
                <input type="text" onChange = {setUsername}></input>

                <label>Password</label>
                <input type="password"onChange = {setPassword}></input>

                <a href = "/signup">Not registered yet? Sign up here!</a>

                <button onClick = {signin}>Sign In</button>
            </div>
        </div>
    );
};