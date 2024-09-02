from fasthtml.common import *
import pathlib
from datetime import datetime
import os
from starlette.responses import RedirectResponse

projects = [
    {
        "name": "PBS Biologics Helper",
        "description": "An interactive tool designed to streamline the process of working with PBS biologics.",
        "internal_link": "pbs-biologics-helper",
        "external_link": "https://cmcmaster-pbs-biologics-helper.hf.space"
    },
]
smooth_scroll = Script("""
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
""")

custom_css = Style("""
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

    :root {
        --background-color: #f4f4f4;
        --text-color: #333;
        --card-background: white;
        --card-shadow: rgba(0, 0, 0, 0.1);
        --primary-color: #007bff;
        --hover-color: #0056b3;
    }

    body {
        font-family: 'Poppins', sans-serif;
        background-color: var(--background-color);
        color: var(--text-color);
        transition: background-color 0.3s, color 0.3s;
    }

    /* Dark mode styles */
    body.dark-mode {
        --background-color: #333;
        --text-color: #f4f4f4;
        --card-background: #444;
        --card-shadow: rgba(255, 255, 255, 0.1);
    }

    nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 1rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .logo {
        height: 40px;
        width: auto;
    }

    nav .links {
        display: flex;
        gap: 1rem;
    }

    nav a {
        color: #333;
        text-decoration: none;
        transition: color 0.3s ease;
    }

    nav a:hover {
        color: #007bff;
    }

    nav a.active {
        color: #007bff;
        font-weight: bold;
    }

    section {
        min-height: 100vh;
        padding: 6rem 2rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    h1 {
        font-size: 2.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #007bff;
    }

    p {
        font-size: 1.1rem;
        max-width: 600px;
        margin-bottom: 1rem;
        color: #666;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;        
    }

    .iframe-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding-top: 56.25%; /* 16:9 Aspect Ratio */
        margin-top: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .iframe-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin-bottom: 0.5rem;
    }

    li::before {
        content: '→';
        color: #007bff;
        margin-right: 0.5rem;
    }

    #home {
        background: linear-gradient(135deg, #007bff, #00bfff);
        color: white;
    }

    #home h1 {
        color: white;
        font-size: 3.5rem;
        margin-bottom: 1rem;
    }

    #home p {
        font-size: 1.2rem;
        max-width: 600px;
    }

    .blog-post {
        background: white;
        padding: 2rem;
        margin-bottom: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 100%;  // Make blog posts full width
        margin: 0;    // Remove margin
    }

    .blog-post h2 {
        color: #007bff;
    }

    .blog-post .date {
        color: #666;
        font-size: 0.9rem;
    }

    .blog-container {
        padding-top: 80px;
    }

    .blog-post h1 {
        margin-top: 0;
    }

    .me-image {
        width: 150px;  // Adjust the width as needed
        height: auto;
        border-radius: 50%;  // Optional: make the image circular
        display: block;  // Ensure it behaves like a block element
        margin: 0 auto;  // Center the image
    }
                   
    .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
    }

    .card {
        background: var(--card-background);
        padding: 1.5rem;
        margin: 1rem 0;
        border-radius: 10px;
        box-shadow: 0 2px 10px var(--card-shadow);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 20px var(--card-shadow);
    }

    /* Responsive layout */
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    @media (min-width: 768px) {
        .container {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
        }
    }

    /* Additional styles for buttons and links */
    nav a {
        transition: color 0.3s ease;
    }

    nav a:hover {
        color: var(--hover-color);
    }

    /* Add styles for sections */
    section {
        padding: 2rem;
        width: 100%;
    }
""")

# Add these to the existing headers
hdrs = (picolink, custom_css, smooth_scroll, MarkdownJS(), HighlightJS(langs=['python', 'javascript', 'html', 'css']))

app = FastHTML(hdrs=hdrs)

def get_posts():
    posts = []
    # Use posts and converted_posts folders
    for path in pathlib.Path("posts").glob("*.md"):
        with open(path, 'r') as f:
            title = f.readline().strip()  # Assume first line is title
            date = datetime.fromtimestamp(path.stat().st_mtime)
            posts.append({"title": title, "date": date, "path": path})
    return sorted(posts, key=lambda x: x['date'], reverse=True)

def nav_menu(current_page="home"):
    return Nav(
        A(Img(src="media/logo_large.png", cls="logo", alt="RheumAI Logo"), href="/"),
        Div(
            A("Home", href="/", cls="active" if current_page == "home" else ""),
            A("About", href="/#about", cls="active" if current_page == "about" else ""),
            A("Projects", href="/#projects", cls="active" if current_page == "projects" else ""),
            A("Blog", href="/blog", cls="active" if current_page == "blog" else ""),
            A("Contact", href="/#contact", cls="active" if current_page == "contact" else ""),
            cls="links"
        )
    )

@app.get("/")
def home():
    posts = get_posts()[:3]  # Get the 3 most recent posts
    content = Main(
        nav_menu("home"),
        Section(
            H1("RheumAI"),
            H2("AI in Rheumatology."),
            id="home"
        ),
        Section(
            H1("About Me"),
            Div(
                Img(src="media/me.jpeg", cls="me-image"),
                cls="image-container"
            ),
            P("I'm a rheumatologist and data scientist with a passion for using open source AI to improve healthcare."),
            id="about"
        ),
        Section(
            H1("My Projects"),
            P("Here are some key projects I've worked on:"),
            Div(
                *[Div(A(project["name"], href=project["internal_link"]), cls="card") for project in projects],
                cls="project-container"
            ),
            id="projects"
        ),
        Section(
            H1("Blog"),
            *[Div(
                H2(A(post['title'], href=f"/post/{post['path'].stem}")),
                P(post['date'].strftime('%Y-%m-%d'), cls="date"),
                cls="blog-post card"  # Add card class for styling
            ) for post in posts],
            A("View all posts", href="/blog"),
            id="blog"
        ),
        Section(
            H1("Contact Me"),
            P("I'm always open to new opportunities and collaborations. Reach out to me at:"),
            P("Email: chris@rheumai.com.au"),
            id="contact"
        ),
        cls="container"
    )
    return Title("RheumAI - Innovating Healthcare Technology"), content

@app.get("/blog")
def blog():
    posts = get_posts()
    content = Main(
        nav_menu("blog"),
        Div(
            H1("Blog Posts"),
            *[Div(
                H2(A(post['title'], href=f"/post/{post['path'].stem}")),
                P(post['date'].strftime('%Y-%m-%d'), cls="date"),
                cls="blog-post"
            ) for post in posts],
            cls="blog-container"
        ),
        cls="container"
    )
    return Title("Blog - RheumAI"), content



@app.get("/post/{slug}")
def post(slug: str):
    path = pathlib.Path(f"posts/{slug}.md")
    if not path.exists():
        return "Post not found", 404
    
    with open(path, 'r') as f:
        title = f.readline().strip()
        content = f.read()
    
    # Adjust image paths
    content = content.replace('](images/', '](/posts/images/')
    
    return Title(title), Main(
        nav_menu("blog"),
        Div(
            H1(title),
            Div(content, cls="marked"),
            cls="blog-post"
        ),
        cls="container blog-container"
    )

# Update the route to serve images for blog posts
@app.get("/posts/images/{image}")
def post_image(image: str):
    image_path = os.path.join("posts", "images", image)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    return "Image not found", 404

# For serving static files (like favicon.ico and logo)
@app.get("/{fname:path}.{ext:static}")
def static(fname: str, ext: str):
    return FileResponse(f'{fname}.{ext}')

# Add this new route for favicon.ico
@app.get("/favicon.ico")
def favicon():
    return FileResponse("media/favicon.ico")

# Add this new route for /pbs-biologics-helper
@app.get("/{project_name}")
def project(project_name: str):
    project = next((p for p in projects if p["internal_link"] == project_name), None)
    if project:
        return RedirectResponse(url=project["external_link"])
    else:
        return "Project not found", 404

serve()