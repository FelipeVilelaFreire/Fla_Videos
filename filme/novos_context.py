from .models import Filme, Episodio, Usuario


def lista_filmes_recentes(request):
    lista_filmes = Filme.objects.all().order_by("-data_criacao")[0:10]
    return {"lista_filmes_recentes": lista_filmes}

def lista_filmes_por_ano(request):
    lista_filmes = Filme.objects.all().filter(categoria="ano")[0:10]
    return {"lista_filmes_por_ano": lista_filmes}

def lista_filmes_em_alta(request):
    lista_filmes = Filme.objects.all().order_by("-visualizacoes")[0:10]
    if lista_filmes:
        filme_destaque = Filme.objects.all().order_by("-visualizacoes")[0]
    else:
        filme_destaque = None
    return {"lista_filmes_em_alta": lista_filmes, "filme_destaque": filme_destaque}

def lista_filmes_favoritos(request):
    lista_filmes = Usuario.episodios_favoritos.all()
    return {"lista_filmes_favoritos": lista_filmes}

def gerar_listas_filmes_por_categoria(request):
    contexto = {}
    categorias = Filme.objects.values_list("categoria", flat=True).distinct()

    for categoria in categorias:
        filmes = Filme.objects.filter(categoria=categoria)[:10]
        nome_contexto = "lista_filmes_" + categoria.replace(" ", "").lower()
        contexto[nome_contexto] = filmes

    return contexto



