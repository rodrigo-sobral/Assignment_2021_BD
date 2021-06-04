import Post from './../components/Post'

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
    return (
      <div id="home">
        <div id="feed">
          <Post />
        </div>
      </div>
    );
};