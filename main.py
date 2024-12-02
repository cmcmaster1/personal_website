from fasthtml.common import *
from pathlib import Path
from datetime import datetime
from starlette.responses import RedirectResponse, FileResponse
from starlette.requests import Request
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Load projects from JSON file
with open('data/projects.json', 'r') as f:
    projects = json.load(f)

# Load summaries and abstracts
with open("data/acr/2024/summaries.json") as f:
    summaries = json.loads(f.read())

with open("data/acr/2024/abstracts.jsonl", "r") as f:
    abstracts = [json.loads(line) for line in f]

for abstract in abstracts:
    abstract['abstract'] = abstract['abstract'].replace("## Background/Purpose\n", "Background/Purpose\n")
    abstract['abstract'] = abstract['abstract'].replace("## Methods\n", "Methods\n")

# Load embeddings
embeddings = np.load('data/acr/2024/embeddings.npy')

# Associate embeddings with abstracts
for abstract, embedding in zip(abstracts, embeddings):
    abstract['embedding'] = embedding

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
        A("ACR24", href="/acr24", cls="active" if current_page == "acr24" else ""),
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
app.mount("/data/acr/2024", StaticFiles(directory="data/acr/2024"), name="acr24_data")

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
    
    # Find the current abstract
    current_abstract = next((a for a in abstracts if a['slug'] == slug), None)
    if not current_abstract:
        return "Abstract not found", 404
    
    # Add a button to find similar abstracts
    similar_button = Button("Find Similar Abstracts", 
                            hx_get=f"/acr24/similar/{slug}", 
                            hx_target="#similar-abstracts", 
                            cls="button")
    
    content = content.replace('</div>', f'\n<div id="similar-abstracts"></div>\n{similar_button}</div>')
    
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




@app.get("/acr24")
def acr24():
    # Load the summaries from JSON file
    with open("data/acr/2024/summaries.json") as f:
        summaries = json.loads(f.read())

    
    # Create the title and header
    title = Title("ACR 2024")
    header = H1("ACR 2024")
    
    # Create tabs with data-tab attributes
    tabs = Nav(
        Ul(
            Li(A("AI Summaries", href="#", data_tab="summaries", cls="active")),
            Li(A("Search", href="#", data_tab="search")),
            Li(A("Embeddings", href="#", data_tab="embeddings")),
            cls="tabs",
            style="margin-bottom: 0"
        )
    )
    
    # Add PDF download link to summaries section
    summaries_section = Section(
        H2("AI-Generated Topic Summaries"),
        A("Download as PDF", href="data/acr/2024/summaries.pdf", cls="button", style="margin-bottom: 1rem"),
        Div(*[
            Article(
                H3(topic),
                Div(summary, cls="marked"),
                cls="summary-card"
            ) for topic, summary in summaries.items()
        ]),
        id="summaries",
        data_section="summaries",
        cls="active"
    )
    
    search_section = Section(
        H2("Search Abstracts"),
        Form(
            Input(
                type="search",
                name="q",
                placeholder="Search abstracts...",
                hx_post="/acr24/search",
                hx_trigger="keyup changed delay:500ms",
                hx_target="#search-results"
            ),
            cls="search-form"
        ),
        Div(id="search-results"),
        id="search",
        data_section="search"
    )
    
    # Add CSS for tab functionality
    style = Style("""
        .tabs { 
            margin-bottom: 2rem;
            list-style: none;
            padding: 0;
        }
        .tabs li {
            display: inline-block;
            margin-right: 1rem;
        }
        .tabs a {
            display: inline-block;
            padding: 0.5rem 1rem;
            text-decoration: none;
            border: 1px solid transparent;
            border-bottom: none;
            margin-bottom: -1px;
        }

        [data-section] {
            display: none;
        }
        [data-section].active {
            display: block;
        }
    """)
    
    # Update JavaScript to toggle section visibility using classes
    script = Script("""
        document.addEventListener('DOMContentLoaded', function() {
            const tabLinks = document.querySelectorAll('a[data-tab]');
            const sections = document.querySelectorAll('[data-section]');
            
            function switchTab(targetTab) {
                // Update active tab
                tabLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.tab === targetTab) {
                        link.classList.add('active');
                    }
                });
                
                // Show/hide sections using classes
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.dataset.section === targetTab) {
                        section.classList.add('active');
                    }
                });
            }
            
            // Add click handlers to tab links
            tabLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchTab(link.dataset.tab);
                });
            });
            
            // Set initial active tab
            switchTab('summaries');
        });
    """)

    # Add embeddings section
    embeddings_section = Section(
        H2("Embeddings Plot"),
        A(Img(src="/data/acr/2024/embeddings.png", alt="Embeddings TSNE Plot"), 
          href="/data/acr/2024/embeddings.png"),
        id="embeddings",
        data_section="embeddings"
    )

    content = Main(
        nav_menu("acr24"),
        Container(
            title,
            header,
            tabs,
            summaries_section,
            search_section,
            embeddings_section,  # Add the new section
            style,
            script
        )
    )
    return Title("ACR 2024 - RheumAI"), content

@app.post("/acr24/search")
def search(request: Request, q: str = Form(...)):
    """Handle abstract search requests"""
    if not q:
        return Div("Enter search terms above")
    
    # Convert search query to lowercase for case-insensitive matching
    q = q.lower()
    
    # Search through abstracts and find matches
    matches = []
    for abstract in abstracts:
        # Check if query matches in title or content
        if (q in abstract.get('title', '').lower() or 
            q in abstract.get('abstract', '').lower()):
            matches.append(abstract)
    
    # If no results found
    if not matches:
        return Div(P("No matching abstracts found"))
    
    # Create view toggle buttons
    toggle_buttons = Div(
        Button("Show First 10", 
               hx_post=f"/acr24/search?q={q}&limit=10",
               hx_target="#search-results",
               cls="active"),
        Button("Show All", 
               hx_post=f"/acr24/search?q={q}&limit=all",
               hx_target="#search-results"),
        cls="view-toggle"
    )

    # Get limit from query params, default to 10
    limit = request.query_params.get('limit', '10')
    results_to_show = matches if limit == 'all' else matches[:10]
    
    # Add modal container if it doesn't exist
    modal_html = Div(
        Div(
            Button("×", cls="modal-close", onclick="closeModal()"),
            Div(id="modal-content"),
            cls="modal"
        ),
        id="modal-overlay",
        cls="modal-overlay",
    )
    
    # Add JavaScript for modal functionality
    modal_script = Script("""
        function showModal(abstractNumber) {
            fetch(`/acr24/similar/${abstractNumber}`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('modal-content').innerHTML = html;
                    document.getElementById('modal-overlay').style.display = 'block';
                });
        }
        
        function closeModal() {
            document.getElementById('modal-overlay').style.display = 'none';
        }
        
        // Close modal when clicking outside
        document.getElementById('modal-overlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    """)
    
    # Return formatted results with Find Similar button for each result
    return Div(
        modal_html,
        modal_script,
        toggle_buttons,
        P(f"Found {len(matches)} matching abstracts:"),
        *[Article(
            H5(A(abstract['title'], href=abstract['link'])),
            P(abstract.get('abstract', '')[:300] + "..."),
            Button("Find Similar", 
                  onclick=f"showModal('{abstract['abstract_number']}')",
                  cls="button similar-button"),
            cls="abstract-result"
        ) for abstract in results_to_show]
    )

# Add some CSS for the toggle buttons
style = Style("""
    .view-toggle {
        margin-bottom: 1rem;
    }
    .view-toggle button {
        margin-right: 0.5rem;
    }
    .view-toggle button.active {
        background: #4a5568;
        color: white;
    }
""")

# Routes for specific resources
@app.get("/{project_name}")
def project(project_name: str):
    project = next((p for p in projects if p["internal_link"] == project_name), None)
    if project:
        return RedirectResponse(url=project["external_link"])
    else:
        return "Project not found", 404

@app.get("/acr24/similar/{abstract_number}")
def find_similar(abstract_number: str):
    # Find the current abstract
    current_abstract = next((a for a in abstracts if a['abstract_number'] == abstract_number), None)
    if not current_abstract:
        return Div("Abstract not found", cls="error")
    
    current_embedding = current_abstract['embedding'].reshape(1, -1)
    
    # Compute cosine similarity between the current abstract and all others
    similarities = cosine_similarity(current_embedding, embeddings)[0]
    
    # Get top 5 similar abstracts excluding itself
    similar_indices = similarities.argsort()[::-1][1:6]
    similar_abstracts = [abstracts[i] for i in similar_indices]
    
    # Create a list of similar abstracts
    return Div(
        H2("Similar Abstracts"),
        Ul(
            *[
                Li(
                    H3(A(abstract['title'], href=abstract['link'])),
                    P(f"Topic: {abstract['topic']}"),
                    Div(abstract.get('abstract', '')[:200] + "...", cls="marked"),
                    cls="similar-abstract"
                ) for abstract in similar_abstracts
            ],
            cls="similar-list"
        )
    )

if __name__ == "__main__":
    serve()
