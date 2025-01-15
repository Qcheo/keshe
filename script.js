document.addEventListener('DOMContentLoaded', () => {
    const musicBtn = document.getElementById('musicBtn');
    const sentenceBtn = document.getElementById('sentenceBtn');
    const articleBtn = document.getElementById('articleBtn');
    const content = document.getElementById('content');
    const loginForm = document.getElementById('loginForm');
    const loginOverlay = document.getElementById('login-overlay');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const registerBtn = document.getElementById('registerBtn');
    const calendar = document.getElementById('calendar');
    const likeBtn = document.getElementById('likeBtn');
    const likeCount = document.getElementById('likeCount');
    const commentBtn = document.getElementById('commentBtn');
    const commentInput = document.getElementById('commentInput');
    const sendCommentBtn = document.getElementById('sendCommentBtn');
    const commentsList = document.getElementById('commentsList');

    let isLoggedIn = false;
    let isAdmin = false;
    let visitorAccounts = {}; // 存储游客账号和密码
    let contentStorage = {}; // 存储每个日期对应的内容
    let likesStorage = {}; // 存储每个日期对应的点赞数
    let commentsStorage = {}; // 存储每个日期对应的评论列表

    // 从本地存储中加载已注册的游客账号
    const loadVisitorAccounts = () => {
        const storedAccounts = localStorage.getItem('visitorAccounts');
        if (storedAccounts) {
            visitorAccounts = JSON.parse(storedAccounts);
        }
    };

    // 保存游客账号到本地存储
    const saveVisitorAccounts = () => {
        localStorage.setItem('visitorAccounts', JSON.stringify(visitorAccounts));
    };

    // 从本地存储中加载内容
    const loadContentStorage = () => {
        const storedContent = localStorage.getItem('contentStorage');
        if (storedContent) {
            contentStorage = JSON.parse(storedContent);
        }
    };

    // 保存内容到本地存储
    const saveContentStorage = () => {
        localStorage.setItem('contentStorage', JSON.stringify(contentStorage));
    };

    // 从本地存储中加载点赞数和评论列表
    const loadLikesAndComments = () => {
        const storedLikes = localStorage.getItem('likesStorage');
        const storedComments = localStorage.getItem('commentsStorage');
        if (storedLikes) {
            likesStorage = JSON.parse(storedLikes);
        }
        if (storedComments) {
            commentsStorage = JSON.parse(storedComments);
        }
        updateLikesAndComments();
    };

    // 保存点赞数和评论列表到本地存储
    const saveLikesAndComments = () => {
        localStorage.setItem('likesStorage', JSON.stringify(likesStorage));
        localStorage.setItem('commentsStorage', JSON.stringify(commentsStorage));
    };

    // 更新点赞数和评论列表
    const updateLikesAndComments = () => {
        const date = calendar.value;
        const likes = likesStorage[date] || 0;
        likeCount.textContent = likes;
        const comments = commentsStorage[date] || [];
        renderComments(comments);
    };

    // 获取当前日期的内容
    const getContentForDate = (date) => {
        return contentStorage[date] || {};
    };

    // 设置当前日期的内容
    const setContentForDate = (date, type, content) => {
        if (!contentStorage[date]) {
            contentStorage[date] = {};
        }
        contentStorage[date][type] = content;
        saveContentStorage();
    };

    // 通用的编辑功能
    const editContent = (type) => {
        const date = calendar.value;
        if (type === 'music') {
            content.innerHTML = `
                <div class="drag-drop-container">
                    <input type="file" id="musicFileInput" accept="audio/mpeg" style="display: none;">
                    <label for="musicFileInput" class="drag-drop-label">拖拽或点击上传 MP3 文件</label>
                </div>
            `;
            const musicFileInput = document.getElementById('musicFileInput');
            const dragDropLabel = document.querySelector('.drag-drop-label');

            musicFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        const fileContent = e.target.result;
                        setContentForDate(date, type, fileContent);
                        content.innerHTML = `<audio controls><source src="${fileContent}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>`;
                    };
                    fileReader.readAsDataURL(file);
                }
            });

            content.addEventListener('dragover', (e) => {
                e.preventDefault();
                dragDropLabel.classList.add('drag-over');
            });

            content.addEventListener('dragleave', (e) => {
                dragDropLabel.classList.remove('drag-over');
            });

            content.addEventListener('drop', (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        const fileContent = e.target.result;
                        setContentForDate(date, type, fileContent);
                        content.innerHTML = `<audio controls><source src="${fileContent}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>`;
                    };
                    fileReader.readAsDataURL(file);
                }
            });

            dragDropLabel.addEventListener('click', () => {
                musicFileInput.click();
            });
        } else {
            const newContent = prompt(`请输入新的${type}内容:`);
            if (newContent) {
                setContentForDate(date, type, newContent);
                content.innerHTML = newContent;
            }
        }
    };

    // 登录表单提交事件
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === '123456' && password === '123456') {
            isLoggedIn = true;
            isAdmin = true;
            loginOverlay.style.display = 'none';
        } else if (visitorAccounts[username] === password) {
            isLoggedIn = true;
            isAdmin = false;
            loginOverlay.style.display = 'none';
        } else {
            alert('账号或密码错误，请重新输入。');
        }
        if (isLoggedIn) {
            const today = new Date().toISOString().slice(0, 10);
            calendar.value = today;
            updateContent();
        }
    });

    // 注册游客账号
    const registerVisitor = () => {
        const username = usernameInput.value;
        const password = passwordInput.value;
        if (username && password) {
            if (visitorAccounts[username]) {
                alert('该账号已存在，请使用其他账号注册。');
            } else {
                visitorAccounts[username] = password;
                saveVisitorAccounts();
                alert('游客账号注册成功。');
            }
        } else {
            alert('请输入有效的账号和密码。');
        }
    };

    // 更新内容显示
    const updateContent = () => {
        const date = calendar.value;
        const contentForDate = getContentForDate(date);
        if (contentForDate.music) {
            content.innerHTML = `<audio controls><source src="${contentForDate.music}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>`;
        } else if (contentForDate.sentence) {
            content.innerHTML = contentForDate.sentence;
        } else if (contentForDate.article) {
            content.innerHTML = `
                <h2>一篇示例文章</h2>
                <p>${contentForDate.article}</p>
            `;
        } else {
            content.innerHTML = '暂无内容';
        }
        if (isAdmin) {
            const editBtn = document.createElement('button');
            editBtn.textContent = '编辑';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => {
                const type = Object.keys(contentForDate).find(key => contentForDate[key] !== undefined) || 'sentence';
                editContent(type);
            });
            content.appendChild(editBtn);
        }
        updateLikesAndComments();
    };

    // 点赞功能
    likeBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            const date = calendar.value;
            likesStorage[date] = (likesStorage[date] || 0) + (likeBtn.classList.contains('liked') ? -1 : 1);
            likeBtn.classList.toggle('liked');
            likeCount.textContent = likesStorage[date];
            saveLikesAndComments();
        } else {
            loginOverlay.style.display = 'flex';
        }
    });

    // 评论功能
    commentBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            commentInput.style.display = 'block';
            sendCommentBtn.style.display = 'block';
            commentInput.focus();
            } else {
            loginOverlay.style.display = 'flex';
            }
            });
            
            // 发送评论
            sendCommentBtn.addEventListener('click', () => {
                const commentText = commentInput.value.trim();
                if (commentText) {
                    const date = calendar.value;
                    const comment = {
                        username: usernameInput.value,
                        text: commentText,
                        timestamp: new Date().toISOString()
                    };
                    if (!commentsStorage[date]) {
                        commentsStorage[date] = [];
                    }
                    commentsStorage[date].push(comment);
                    renderComments(commentsStorage[date]);
                    commentInput.value = '';
                    saveLikesAndComments();
                }
            });
            
            // 渲染评论列表
            const renderComments = (comments) => {
                commentsList.innerHTML = '';
                comments.forEach((comment, index) => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment';
                    commentElement.innerHTML = `
                        <span class="comment-username">${comment.username}</span>
                        <span class="comment-text">${comment.text}</span>
                        <span class="comment-time">${new Date(comment.timestamp).toLocaleString()}</span>
                    `;
                    if (comment.username === usernameInput.value || isAdmin) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = '删除';
                        deleteBtn.className = 'delete-btn';
                        deleteBtn.addEventListener('click', () => {
                            comments.splice(index, 1);
                            renderComments(comments);
                            saveLikesAndComments();
                        });
                        commentElement.appendChild(deleteBtn);
                    }
                    commentsList.appendChild(commentElement);
                });
            };
            
            // 按钮点击事件
            musicBtn.addEventListener('click', () => {
                if (isLoggedIn) {
                    const date = calendar.value;
                    const contentForDate = getContentForDate(date);
                    if (contentForDate.music) {
                        content.innerHTML = `<audio controls><source src="${contentForDate.music}" type="audio/mpeg">您的浏览器不支持音频播放。</audio>`;
                    } else {
                        content.innerHTML = '暂无内容';
                    }
                    if (isAdmin) {
                        const editBtn = document.createElement('button');
                        editBtn.textContent = '编辑';
                        editBtn.className = 'edit-btn';
                        editBtn.addEventListener('click', () => editContent('music'));
                        content.appendChild(editBtn);
                    }
                } else {
                    loginOverlay.style.display = 'flex';
                }
            });
            
            sentenceBtn.addEventListener('click', () => {
                if (isLoggedIn) {
                    const date = calendar.value;
                    const contentForDate = getContentForDate(date);
                    content.innerHTML = contentForDate.sentence || '暂无内容';
                    if (isAdmin) {
                        const editBtn = document.createElement('button');
                        editBtn.textContent = '编辑';
                        editBtn.className = 'edit-btn';
                        editBtn.addEventListener('click', () => editContent('sentence'));
                        content.appendChild(editBtn);
                    }
                } else {
                    loginOverlay.style.display = 'flex';
                }
            });
            
            articleBtn.addEventListener('click', () => {
                if (isLoggedIn) {
                    const date = calendar.value;
                    const contentForDate = getContentForDate(date);
                    content.innerHTML = `
                        <h2>一篇示例文章</h2>
                        <p>${contentForDate.article || '暂无内容'}</p>
                    `;
                    if (isAdmin) {
                        const editBtn = document.createElement('button');
                        editBtn.textContent = '编辑';
                        editBtn.className = 'edit-btn';
                        editBtn.addEventListener('click', () => editContent('article'));
                        content.appendChild(editBtn);
                    }
                } else {
                    loginOverlay.style.display = 'flex';
                }
            });
            
            // 日期选择器变化事件
            calendar.addEventListener('change', updateContent);
            
            // 注册按钮
            registerBtn.addEventListener('click', registerVisitor);
            
            // 页面卸载时释放对象 URL
            window.addEventListener('beforeunload', () => {
                const date = calendar.value;
                const contentForDate = getContentForDate(date);
                if (contentForDate.music) {
                    URL.revokeObjectURL(contentForDate.music);
                }
            });
            
            // 加载已注册的游客账号、内容、点赞数和评论列表
            loadVisitorAccounts();
            loadContentStorage();
            loadLikesAndComments();
            
            // 页面加载时，如果已登录，自动设置日期选择器为当前日期并更新内容
            if (isLoggedIn) {
                const today = new Date().toISOString().slice(0, 10);
                calendar.value = today;
                updateContent();
            }
            });