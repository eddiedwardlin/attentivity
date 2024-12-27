import Image from 'react-bootstrap/Image';

interface Props {
    post: any;
};

function Post({post}: Props) {
    return <div className="post-container">
        <h1>{post.title}</h1>
        <p>{post.body}</p>
        {post.image && <Image src={post.image} alt="image" fluid thumbnail />}
        {post.file && <a href={post.file} target="_blank" rel="noopener noreferrer" className="link-item-alt center-link">
                <b>CLICK HERE TO VIEW FILE</b>
        </a>}
        {!post.image && !post.file && <p className='center-p'>No image or file</p>}
    </div>
}

export default Post