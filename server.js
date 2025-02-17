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
        // console.log(response.data.data[2].image.url)
        // Optionally, you can format the data here before sending it to the frontend
        const blogs = response.data.data.map(blog => ({
            title: blog.title,
            image: blog.image.url,
            documentId: blog.documentId,
            author: blog.author
        }));

        res.json(blogs);  // Send the formatted data to the frontend
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs' });
    }
});

// full blogpost route 
app.get("/full-blogs/:documentId", async (req, res) => {
    const blogId = req.params.documentId;
    res.redirect(`/blogpost?documentId=${blogId}`);
});


app.get('/blogpost', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blogpost.html'))
})

app.get("/fullblogpost/:documentId", async (req, res) => {
    const blogId = req.params.documentId;
    try {
        const response = await axios.get(`${process.env.FETCH_BLOGS}/${blogId}`);
        const blog = response.data.data; // Assuming the response structure contains the blog data

        // Parsing the rich text content into HTML format
        const parsedContent = parseRichTextToHTML(blog.content);

        // Add the parsed HTML content to the blog data
        blog.content = parsedContent;

        // Send the updated blog data as JSON
        res.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Error fetching blog');
    }
});

// Function to parse rich text into HTML
function parseRichTextToHTML(content) {
    return content.map(block => {
        if (block.type === 'paragraph') {
            // Convert paragraph children (the array of text) into a <p> tag
            const text = block.children.map(child => child.text).join(''); // Combine all the text children
            return `<p>${text}</p>`;
        }
        // Add more block types (like headers, lists, etc.) as needed
        return '';
    }).join('');
}




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
