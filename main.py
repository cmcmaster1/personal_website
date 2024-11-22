from fasthtml.common import *
from pathlib import Path
from datetime import datetime
from starlette.responses import RedirectResponse, FileResponse
import json

# Load projects from JSON file
with open('data/projects.json', 'r') as f:
    projects = json.load(f)

# Setup app with headers
hdrs = (
    picolink, 
    StyleX("static/css/style.css"), 
    MarkdownJS(), 
    HighlightJS(langs=['python', 'javascript', 'html', 'css'])
)
app = FastHTML(hdrs=hdrs)

def get_posts():
    posts = []
    for path in Path("posts").glob("*.md"):
        with open(path, 'r') as f:
            title = f.readline().strip()
            date = datetime.fromtimestamp(path.stat().st_mtime)
            posts.append({"title": title, "date": date, "path": path})
    return sorted(posts, key=lambda x: x['date'], reverse=True)

def nav_menu(current_page="home"):
    return Nav(
        A("Home", href="/", cls="active" if current_page == "home" else ""),
        A("Blog", href="/blog", cls="active" if current_page == "blog" else ""),
        A("Projects", href="/projects", cls="active" if current_page == "projects" else ""),
    )

# Routes
@app.get("/")
def home():
    content = Main(
        nav_menu("home"),
        Div(
            Img(src="media/me.jpeg", alt="Profile Photo"),
            H1("Dr. Chris McMaster"),
            P("Rheumatologist and Data Scientist"),
            P("Using AI to improve healthcare"),
            cls="profile"
        ),
        cls="container"
    )
    return Title("RheumAI"), content

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
            cls="container"
        )
    )
    return Title("Blog - RheumAI"), content

@app.get("/projects")
def projects_page():
    content = Main(
        nav_menu("projects"),
        Div(
            H1("Projects"),
            *[Div(
                H2(project["name"]),
                P(project["description"]),
                A("Visit Project", href=project["external_link"], cls="button"),
                cls="blog-post"
            ) for project in projects],
            cls="container"
        )
    )
    return Title("Projects - RheumAI"), content

# Static file handlers
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount("/posts/images", StaticFiles(directory="posts/images"), name="post_images")

# Routes for specific resources
@app.get("/{project_name}")
def project(project_name: str):
    project = next((p for p in projects if p["internal_link"] == project_name), None)
    if project:
        return RedirectResponse(url=project["external_link"])
    else:
        return "Project not found", 404

@app.get("/post/{slug}")
def post(slug: str):
    path = Path(f"posts/{slug}.md")
    if not path.exists():
        return "Post not found", 404
    
    with open(path, 'r') as f:
        title = f.readline().strip()
        content = f.read()
    
    # Fix image paths - replace both relative and absolute paths
    content = content.replace('](images/', '](/posts/images/')
    content = content.replace('](/images/', '](/posts/images/')
    
    # Add styling for blog post images
    img_style = Style("""
        .blog-post img {
            max-width: 100%;
            height: auto;
            margin: 1em 0;
        }
        .blog-post .marked {
            overflow-x: auto;
        }
    """)
    
    return Title(title), (
        img_style,
        Main(
            nav_menu("blog"),
            Div(
                H1(title),
                Div(content, cls="marked"),
                cls="blog-post container"
            )
        )
    )

@app.get("/favicon.ico")
def favicon():
    return FileResponse("static/favicon.ico")

if __name__ == "__main__":
    serve()
