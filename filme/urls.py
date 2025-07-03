from django.urls import path,include, reverse_lazy
from .views import Homepage,Homefilmes,Detalhesfilme,Pesquisa,EditarPerfil,CriarConta,Favoritos
from django.contrib.auth import views as auth_view
from .registros import registrar_visualizacao,toggle_like_episodio,toggle_coracao_episodio,toggle_dislike_episodio,toggle_star_episodio,toggle_star_episodio_remove_favorites,toggle_filter_episodes

app_name = "filme"

urlpatterns = [
    path('', Homepage.as_view(), name='homepage'),
    path('filmes/', Homefilmes.as_view(), name='homefilme'),
    path('filmes/<int:pk>', Detalhesfilme.as_view(), name='detalhesfilmes'),

    path('pesquisa/', Pesquisa.as_view(), name='pesquisafilme'),
    path('login/', auth_view.LoginView.as_view(template_name="login.html"), name='login'),
    path('logout/', auth_view.LogoutView.as_view(template_name="logout.html"), name='logout'),
    path('criarconta/', CriarConta.as_view(), name='criarconta'),
    path('editarperfil/<int:pk>', EditarPerfil.as_view(), name='editarperfil'),
    path('mudarsenha/', auth_view.PasswordChangeView.as_view(template_name="editarperfil.html",
                                                                     success_url= reverse_lazy("filme:homefilme")), name='mudarsenha'),

    path('favoritos/', Favoritos.as_view(), name='favoritos'),

    path('toggle-filter-episodes/episodio/<int:pk>/', toggle_filter_episodes, name='toggle-filter-episodes'),

    path('registrar-visualizacao/episodio/<int:pk>/', registrar_visualizacao, name='registrar_visualizacao'),
    path('toggle-like/episodio/<int:pk>/', toggle_like_episodio, name='toggle_like'),
    path('toggle-dislike/episodio/<int:pk>/', toggle_dislike_episodio, name='toggle_dislike'),
    path('toggle-coracao/episodio/<int:pk>/', toggle_coracao_episodio, name='toggle_coracao'),
    path('toggle-star/episodio/<int:pk>/', toggle_star_episodio, name='toggle_star'),
    path('toggle-star-remove/episodio/<int:pk>/', toggle_star_episodio_remove_favorites, name='toggle_star_remove'),


]