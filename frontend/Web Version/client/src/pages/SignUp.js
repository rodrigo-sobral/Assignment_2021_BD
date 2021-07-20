import '../styles/Sign.css';
let base64 = require('base-64');

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {

    const state = {
        username: undefined,
        email: undefined,
        password: undefined,
        passwordConfirmation: undefined,
    }

    function signup(e){
        e.preventDefault();
        document.getElementById("email").style.background="white";
        document.getElementById("username").style.background="white";
        document.getElementById("password").style.background="white";
        document.getElementById("passwordConfirmation").style.background="white";
        var validInputs=4;
        if (!state.email){
            document.getElementById("email").style.background="pink";
            validInputs--;
        }
        if (!state.username){
            document.getElementById("username").style.background="pink";
            validInputs--;
        }
        if(!state.password){
            document.getElementById("password").style.background="pink";
            validInputs--;
        }
        if(!state.passwordConfirmation || state.password!=state.passwordConfirmation){
            document.getElementById("passwordConfirmation").style.background="pink";
            validInputs--;
        }
        if(validInputs===4){
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            
            delete state.passwordConfirmation;
            var raw = JSON.stringify(state);
            state.passwordConfirmation=undefined;
            document.getElementById("passwordConfirmation").value="";

            var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
            };

            fetch("http://diogo-rodrigo-bd.herokuapp.com/dbproj/user", requestOptions)
            .then(response => response.json())
            .then(result => {
                if(!result.erro){
                    window.location.href = `/signin`;
                
                }else{
                    alert(result.erro);
                }
            })
            .catch(error => alert(error.message));
        }else{
            document.getElementById("passwordConfirmation").style.background="pink";
        }
    }
    function setEmail(e){state.email = e.target.value;}
    function setUsername(e){state.username = e.target.value;}
    function setPassword(e){state.password = e.target.value;}
    function setPasswordConfirmation(e){state.passwordConfirmation = e.target.value;}

    return (
        <div id="sign">
            <div id="inner">
                <h1>Lights, Camera, Auction</h1>


                <label>Email</label>
                <input id="email" type="text" value={state.password} onChange={setEmail}></input>

                <label>Username</label>
                <input id="username" type="text" value={state.username} onChange={setUsername}></input>

                <label>Password</label>
                <input id="password" type="password" value={state.password} onChange={setPassword}></input>

                <label>Confirm Password</label>
                <input id="passwordConfirmation" type="password" value={state.passwordConfirmation} onChange={setPasswordConfirmation}></input>

                <a href="/signin">Already registered? Sign in here</a>

                <button onClick={signup}>Sign Up</button>
            </div>
        </div>
    );
};