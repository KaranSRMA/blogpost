const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy route: Fetch data from Strapi and return to frontend
app.get("/blogs", async (req, res) => {
    try {
        const response = await axios.get(`${process.env.FETCH_BLOGS_IMAGE}`);
        const blogs = response.data.data.map(blog => ({
            title: blog.title,
            image: blog.image.url,
            documentId: blog.documentId,
            author: blog.author
        }));

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs' });
    }
});

app.get("/full-blogs/:documentId", async (req, res) => {
    const blogId = req.params.documentId;
    res.redirect(`/blogpost?documentId=${blogId}`);
});

app.get('/blogpost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blogpost.html'));
});

app.get("/fullblogpost/:documentId", async (req, res) => {
    const blogId = req.params.documentId;
    try {
        const response = await axios.get(`${process.env.FETCH_BLOGS}/${blogId}`);
        const blog = response.data.data;
        const parsedContent = parseRichTextToHTML(blog.content);
        blog.content = parsedContent;
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Error fetching blog');
    }
});

function parseRichTextToHTML(content) {
    return content.map(block => {
        if (block.type === 'paragraph') {
            const text = block.children.map(child => child.text).join('');
            return `<p>${text}</p>`;
        }
        return '';
    }).join('');
}

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).send(`
        <html>
            <head>
                <title>404 Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin: 100px; background-color: #f0f0f0; }
                    h1 { font-size: 50px; color: #333; }
                    p { font-size: 20px; color: #666; }
                    a { color: #007BFF; text-decoration: none; font-size: 18px; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <h1>404</h1>
                <p>Oops! The page you are looking for does not exist.</p>
                <a href="/">Return to Home</a>
            </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
