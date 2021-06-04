import '../styles/Post.css';

// eslint-disable-next-line import/no-anonymous-default-export
export default ( {id, name, description, product_id,  onClick} ) => {

  

    return (
        <button onClick = {onClick} id="post">
            <div className="left">
                <h1>{name}</h1>
                <h2>Description:</h2>
                <p>{description}</p>
                <h3>Product: {product_id}</h3>
            </div>
            <div className="right">
            </div>
        </button>
    );
};