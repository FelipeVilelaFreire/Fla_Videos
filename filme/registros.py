from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST
from .models import Episodio, Usuario # Importe os modelos que a view utiliza

@require_POST
def registrar_visualizacao(request, pk):
    try:
        # Encontra o episódio no banco de dados pelo ID (pk)
        episodio = Episodio.objects.get(pk=pk)

        episodio.visualizacoes += 1
        episodio.save()

        # 4. Retorna uma resposta JSON de sucesso (útil para depuração)
        return JsonResponse({'status': 'ok', 'visualizacoes_episodio': episodio.visualizacoes})

    except Episodio.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Episódio não encontrado'}, status=404)


# registros.py (VERSÃO FINAL E CORRETA)

@require_POST
def toggle_like_episodio(request, pk):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # --- PARTE 1: AÇÃO ---
    # A lógica de alteração no banco de dados.
    if usuario in episodio.usuarios_que_curtiram.all():
        # Se já curtiu, apenas remove o like.
        episodio.usuarios_que_curtiram.remove(usuario)
    else:
        # Se não curtiu, adiciona o like E remove o dislike (garante exclusividade).
        episodio.usuarios_que_curtiram.add(usuario)
        episodio.usuarios_dislikes.remove(usuario) # Remove o dislike, se existir.


    liked = usuario in episodio.usuarios_que_curtiram.all()
    disliked = usuario in episodio.usuarios_dislikes.all()

    # --- PARTE 3: RESPOSTA ---
    # Enviamos a resposta 100% precisa para o front-end.
    data = {
        'status': 'ok',
        'liked': liked,
        'disliked': disliked,
        'total_likes': episodio.total_likes,
        'total_dislikes': episodio.total_dislikes,
    }
    return JsonResponse(data)


@require_POST
def toggle_dislike_episodio(request, pk):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # --- PARTE 1: AÇÃO ---
    if usuario in episodio.usuarios_dislikes.all():
        # Se já deu dislike, apenas remove o dislike.
        episodio.usuarios_dislikes.remove(usuario)
    else:
        # Se não deu dislike, adiciona o dislike E remove o like (garante exclusividade).
        episodio.usuarios_dislikes.add(usuario)
        episodio.usuarios_que_curtiram.remove(usuario) # Remove o like, se existir.

    # --- PARTE 2: VERIFICAÇÃO ---
    liked = usuario in episodio.usuarios_que_curtiram.all()
    disliked = usuario in episodio.usuarios_dislikes.all()

    # --- PARTE 3: RESPOSTA ---
    data = {
        'status': 'ok',
        'disliked': disliked,
        'liked': liked,
        'total_dislikes': episodio.total_dislikes,
        'total_likes': episodio.total_likes,
    }
    return JsonResponse(data)

@require_POST
def toggle_coracao_episodio(request, pk):
    # Garante que o usuário esteja logado
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    # Pega o usuário logado e o episódio pelo ID
    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # A LÓGICA DO TOGGLE (ALTERNAR)
    if usuario in episodio.usuarios_que_amaram.all():
        episodio.usuarios_que_amaram.remove(usuario)
        heart = False
    else:
        episodio.usuarios_que_amaram.add(usuario)
        heart = True

    # Prepara a resposta JSON para o front-end
    data = {
        'status': 'ok',
        'heart': heart,  # Informa ao front-end se o like está ativo
        'total_hearts': episodio.total_coracao,  # Envia a nova contagem total de likes
    }
    return JsonResponse(data)


@require_POST
def toggle_star_episodio(request, pk):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # A lógica de toggle na lista de favoritos do usuário
    if episodio in usuario.episodios_favoritos.all():
        usuario.episodios_favoritos.remove(episodio)
        star_status = False
    else:
        usuario.episodios_favoritos.add(episodio)
        star_status = True

    # A resposta é muito mais simples agora
    data = {
        'status': 'ok',
        'star': star_status,
    }
    return JsonResponse(data)


@require_POST
def toggle_star_episodio_remove_favorites(request, pk):
    if not request.user.is_authenticated:
        return JsonResponse({'status': 'error', 'message': 'Usuário não autenticado'}, status=401)

    usuario = request.user
    episodio = get_object_or_404(Episodio, pk=pk)

    # A lógica agora é apenas remover, não alternar (toggle)
    if episodio in usuario.episodios_favoritos.all():
        usuario.episodios_favoritos.remove(episodio)
        removido = True
    else:
        # Caso o episódio não estivesse na lista por algum motivo,
        # informamos que nada foi feito.
        removido = False

    data = {
        'status': 'ok',
        'removido': removido,
    }
    return JsonResponse(data)


def toggle_filter_episodes(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest': # Verifica se é uma requisição AJAX
        fase_selecionada = request.GET.get('fase', '')

        if fase_selecionada and fase_selecionada != '- Todos -':
            episodios = Episodio.objects.filter(fases=fase_selecionada)
        else:
            episodios = Episodio.objects.all() # Retorna todos se "Todos" for selecionado ou se não houver fase

        # Prepara os dados dos episódios para JSON
        data = []
        for episodio in episodios:
            data.append({
                'id': episodio.id,
                'titulo': episodio.titulo,
                'descricao': episodio.descricao,
                'link': episodio.link,
                'fases': episodio.fases,
                'thumb_url': episodio.thumb.url if episodio.thumb else None, # URL da imagem, se existir
                # Adicione outros campos que você precise exibir
            })
        return JsonResponse({'episodios': data})
    else:
        # Se não for uma requisição AJAX, você pode redirecionar ou retornar um erro
        # Ou, se esta view também for usada para renderizar a página inicial com todos os episódios
        # return render(request, 'seu_template.html', {'episodios': Episodio.objects.all()})
        return JsonResponse({'error': 'Não é uma requisição AJAX válida'}, status=400)






