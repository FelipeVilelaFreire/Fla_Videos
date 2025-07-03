# admin.py

from django.contrib import admin
from .models import Filme, Usuario, Episodio
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe

class UsuarioAdmin(UserAdmin):
    """
    Customização do Admin para o modelo Usuario.
    """
    fieldsets = UserAdmin.fieldsets + (
        ("Histórico do Usuário", {'fields': ('lista_de_filmes_vistos', 'lista_episodios_favoritos')}),
    )

    readonly_fields = ('lista_de_filmes_vistos', 'lista_episodios_favoritos')

    def lista_de_filmes_vistos(self, obj):
        filmes_vistos = obj.filmes_vistos.all()
        if not filmes_vistos:
            return mark_safe("<div class='readonly-list-container'><p>Este usuário ainda não assistiu a nenhum filme.</p></div>")
        html = "<div class='readonly-list-container movie-list'><ul>"
        for filme in filmes_vistos:
            html += f"<li>{filme.titulo}</li>"
        html += "</ul></div>"
        return mark_safe(html)
    lista_de_filmes_vistos.short_description = "Filmes Vistos"

    def lista_episodios_favoritos(self, obj):
        episodios_favoritos = obj.episodios_favoritos.all()
        if not episodios_favoritos:
            return mark_safe("<div class='readonly-list-container'><p>Este usuário não favoritou nenhum episódio.</p></div>")
        html = "<div class='readonly-list-container star-list'><ul>"
        for episodio in episodios_favoritos:
            html += f"<li>{episodio.filme.titulo} - {episodio.titulo}</li>"
        html += "</ul></div>"
        return mark_safe(html)
    lista_episodios_favoritos.short_description = "Episódios Favoritos"

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }

@admin.register(Episodio)
class EpisodioAdmin(admin.ModelAdmin):
    """
    Customização do Admin para o modelo Episodio.
    """
    list_display = ('titulo', 'filme', 'visualizacoes')
    readonly_fields = ('lista_curtidas', 'lista_dislikes', 'lista_amados')

    fieldsets = (
        ("Informações Gerais", {
            'fields': ('filme', 'titulo', 'descricao', 'link', 'fases', 'visualizacoes', 'thumb', 'video') # <-- Adicionei 'thumb' e 'video' aqui!
        }),
        ("Interações dos Usuários", {
            'fields': ('lista_curtidas', 'lista_dislikes', 'lista_amados')
        }),
    )

    def lista_curtidas(self, obj):
        usuarios = obj.usuarios_que_curtiram.all()
        if not usuarios:
            return mark_safe("<div class='readonly-list-container'><p>Nenhum usuário curtiu este episódio.</p></div>")
        html = "<div class='readonly-list-container user-list'><ul>"
        for usuario in usuarios:
            html += f"<li>{usuario.username}</li>"
        html += "</ul></div>"
        return mark_safe(html)
    lista_curtidas.short_description = "Usuários que curtiram"

    def lista_dislikes(self, obj):
        usuarios = obj.usuarios_dislikes.all()
        if not usuarios:
            return mark_safe("<div class='readonly-list-container'><p>Nenhum usuário deu dislike neste episódio.</p></div>")
        html = "<div class='readonly-list-container user-list'><ul>"
        for usuario in usuarios:
            html += f"<li>{usuario.username}</li>"
        html += "</ul></div>"
        return mark_safe(html)
    lista_dislikes.short_description = "Usuários dislikes"

    def lista_amados(self, obj):
        usuarios = obj.usuarios_que_amaram.all()
        if not usuarios:
            return mark_safe("<div class='readonly-list-container'><p>Nenhum usuário amou este episódio.</p></div>")
        html = "<div class='readonly-list-container user-list'><ul>"
        for usuario in usuarios:
            html += f"<li>{usuario.username}</li>"
        html += "</ul></div>"
        return mark_safe(html)
    lista_amados.short_description = "Usuários que amaram"

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }

admin.site.register(Filme)
admin.site.register(Usuario, UsuarioAdmin)