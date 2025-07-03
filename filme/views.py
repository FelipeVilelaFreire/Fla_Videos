from django.shortcuts import render, redirect, reverse
from .models import Filme,Usuario,Episodio
from django.views.generic import TemplateView, ListView, DetailView, FormView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .forms import CriarContaForm,FormHomepage
from django.shortcuts import render, get_object_or_404
# Create your views here.

class Homepage(FormView):
    template_name = "homepage.html"
    form_class = FormHomepage
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect("filme:homefilme")
        else:
            return super().get(request, *args, **kwargs) #redireciona para a homepage

    def get_success_url(self):
        email = self.request.POST.get("email")
        usuarios = Usuario.objects.filter(email=email)
        if usuarios:
            return reverse("filme:login")
        else:
            return reverse("filme:criarconta")

class Homefilmes(LoginRequiredMixin,ListView):
    template_name = "homefilmes.html"
    model = Filme

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add the user's viewed movies to the context
        context["filmes_vistos_do_usuario"] = self.request.user.filmes_vistos.all()
        return context

class Detalhesfilme(LoginRequiredMixin,DetailView):
    template_name = "detalhes_filmes.html"
    model = Filme

    def get(self, request, *args, **kwargs):   #sempre quando o usuario faz um metodo get na pagina de url (.../filmes/n (n = 1 ou 2 ou 3...)) ira contar essa requisicao e depois vai somar a visualizacao
        filme = self.get_object()
        filme.visualizacoes += 1
        filme.save()
        usuario = request.user
        usuario.filmes_vistos.add(filme)
        return super().get(request, *args, **kwargs) #redireciona para a url final

    def get_context_data(self, **kwargs):
        context = super(Detalhesfilme, self).get_context_data(**kwargs)


        current_movie = self.get_object()

        # Linhas originais: Lógica para buscar filmes relacionados
        filmes_relacionados = self.model.objects.filter(categoria=current_movie.categoria).exclude(pk=current_movie.pk)[
                              0:4]
        context["filmes_relacionados"] = filmes_relacionados


        fases_unicas = Episodio.objects.filter(filme=current_movie).values_list('fases', flat=True).distinct().order_by('fases')
        context['fases_unicas'] = fases_unicas

        return context

class Pesquisa(LoginRequiredMixin,ListView):
    template_name = "pesquisa.html"
    model = Filme

    def get_queryset(self):
        get_pesquisa = self.request.GET.get("query")
        if get_pesquisa:
            object_list = self.model.objects.filter(titulo__icontains=get_pesquisa)
            return object_list
        else:
            return None

class EditarPerfil(LoginRequiredMixin,UpdateView):
    template_name = "editarperfil.html"
    model = Usuario
    fields = ['first_name', 'last_name', 'email']

    def get_success_url(self):
        return reverse("filme:homefilmes")

class CriarConta(FormView):
    template_name = "criarconta.html"
    form_class = CriarContaForm

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

    def get_success_url(self):
        return reverse("filme:login")

class Favoritos(ListView):
    template_name = "favoritos.html"
    model = Usuario
    context_object_name = 'lista_episodios_favoritos'


    def get_queryset(self):
        return self.request.user.episodios_favoritos.all()


