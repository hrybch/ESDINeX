from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ESDINEX API", version="1.0.0")

# Habilitar CORS para o frontend Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "online", "system": "ESDINEX Core API"}

@app.get("/api/v1/apps")
def get_user_apps(role: str = "SUPORTE_N1"):
    """
    Retorna apenas os sistemas que a Role atual tem permissão para visualizar.
    """
    catalog = [
        {
            "id": "siscart",
            "title": "Painel de Suporte Cartorário",
            "icon": "Database",
            "url": "https://example.org",
            "launchMode": "window_iframe",
            "allowedRoles": ["ADMIN", "SUPORTE_N1", "SUPORTE_N2"],
            "defaultWidth": 1024,
            "defaultHeight": 650,
        },
        {
            "id": "portal-cnj",
            "title": "Portal Extrajudicial (CNJ)",
            "icon": "FileText",
            "url": "https://corregedoria.pje.jus.br/",
            "launchMode": "new_tab",
            "allowedRoles": ["ADMIN", "SUPORTE_N2"],
        },
    ]
    # Filtragem segura no Backend (Princípio do menor privilégio)
    return [app for app in catalog if role in app["allowedRoles"]]