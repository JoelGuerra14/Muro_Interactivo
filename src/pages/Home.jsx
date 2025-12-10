import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, 
  doc, getDoc, updateDoc, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({}); 
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data()); 
        }
      } else {
        setUserData({});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !user) return;
    try {
      await addDoc(collection(db, "posts"), {
        content: newPostContent,
        authorName: userData.nombre || user.email,
        authorPhoto: userData.photoURL || null,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        likes: [], 
        comments: [] 
      });
      setNewPostContent('');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    if (!user) {
        alert("Inicia sesión para dar like ❤️");
        return;
    }
    const postRef = doc(db, "posts", postId);
    const isLiked = currentLikes?.includes(user.uid);

    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          content: commentText,
          authorName: userData.nombre || "Usuario",
          createdAt: new Date().toISOString()
        })
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error("Error comentando:", error);
    }
  };

  const handleInputChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const getAvatar = (photo, name) => {
    if (photo) return photo;
    return `https://ui-avatars.com/api/?name=${name || 'User'}&background=random&color=fff`;
  };

  return (
    <div>
      <header className="navbar" style={{backgroundColor: 'var(--navy-dark)'}}>
        <h2>Muro Interactivo</h2>
        <div>
          {user ? (
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <img 
                src={getAvatar(userData.photoURL, userData.nombre)} 
                alt="Profile" 
                style={{width: '35px', height: '35px', borderRadius: '50%', border: '2px solid white'}}
              />
              <span>{userData.nombre}</span>
              <Link to="/settings" className="nav-btn">⚙️</Link>
              <button onClick={() => signOut(auth)} className="nav-btn">Salir</button>
            </div>
          ) : (
             <Link to="/login" className="nav-btn">Entrar</Link>
          )}
        </div>
      </header>

      <main className="main-container">
        {user && (
          <div className="create-post-card">
            <form onSubmit={handlePublish} style={{display: 'flex', gap: '15px'}}>
              <img 
                src={getAvatar(userData.photoURL, userData.nombre)} 
                alt="Me" 
                className="user-avatar"
              />
              <div style={{flex: 1}}>
                <textarea
                  className="post-textarea"
                  placeholder={`¿Qué cuentas hoy, ${userData.nombre}?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <button type="submit" className="btn-primary" style={{backgroundColor: 'var(--navy-dark)'}}>Publicar</button>
              </div>
            </form>
          </div>
        )}

        <div>
          {posts.map((post) => {
            const likedByMe = post.likes?.includes(user?.uid);
            
            return (
              <div key={post.id} className="post-card">
                <div className="post-header" style={{alignItems: 'center'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <img 
                      src={getAvatar(post.authorPhoto, post.authorName)} 
                      alt="Author" 
                      className="user-avatar"
                    />
                    <div>
                        <div className="author-name">{post.authorName}</div>
                        <div className="post-date">
                          {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '...'}
                        </div>
                    </div>
                  </div>
                </div>

                <p className="post-content">{post.content}</p>

                <div style={{marginBottom: '15px'}}>
                    <button 
                        onClick={() => handleLike(post.id, post.likes)}
                        className={`like-btn ${likedByMe ? 'like-active' : ''}`}
                    >
                        {likedByMe ? '❤️' : '🤍'} 
                        <span>{post.likes ? post.likes.length : 0} Me gusta</span>
                    </button>
                </div>

                <div className="comments-section">
                  {/* Lista de comentarios */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="comments-list">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="comment-bubble">
                          <strong style={{fontSize: '0.85rem', opacity: 0.8}}>{comment.authorName}</strong>
                          <p style={{margin: '2px 0 0 0'}}>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && (
                    <form onSubmit={(e) => handleComment(e, post.id)} className="comment-form">
                      <input 
                        type="text" 
                        className="comment-input"
                        placeholder="Escribe una respuesta..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => handleInputChange(post.id, e.target.value)}
                      />
                      <button type="submit" className="comment-btn">Enviar</button>
                    </form>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Home;