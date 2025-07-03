from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

# Create your models here.


ANO_MINIMO = 2000
ANO_ATUAL = timezone.now().year

# Gera os anos como lista de tuplas para o choices
LISTA_ANOS = [(ano, str(ano)) for ano in range(ANO_MINIMO, ANO_ATUAL + 1)]

LISTA_CATEGORIAS = (
    ("Copa do Brasil", "Copa do Brasil"),
    ("Libertadores", "Libertadores"),
    ("Campeonato Estadual", "Campeonato Estadual"),
    ("Copa do Mundo de Clubes", "Copa do Mundo de Clubes"),
    ("Brasileirão", "Brasileirão"),
)

LISTA_FASES = (
    ("Fase de Grupos", "Fase de Grupos"),
    ("Oitavas de Final", "Oitavas de Final"),
    ("Quartas de Final", "Quartas de Final"),
    ("Semifinal", "Semifinal"),
    ("Final", "Final"),
)


class Filme(models.Model):
        ANO_MINIMO = 2000
        ANO_ATUAL = timezone.now().year


        titulo = models.CharField(max_length=100)
        thumb = models.ImageField(upload_to='thumb_filmes')
        descricao = models.TextField(max_length=1000)
        ano = models.IntegerField(choices=LISTA_ANOS,validators=[MinValueValidator(ANO_MINIMO),MaxValueValidator(ANO_ATUAL)])
        categoria = models.CharField(max_length=50,choices=LISTA_CATEGORIAS,default="Outros")
        visualizacoes = models.IntegerField(default=0)
        data_criacao = models.DateTimeField(default=timezone.now)
        campeao = models.BooleanField(default=False)
        def __str__(self):
            return self.titulo


class Episodio(models.Model):
    # --- Campos do Modelo ---
    filme = models.ForeignKey("Filme", related_name="episodios", on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    thumb = models.ImageField(upload_to='thumb_episodios', null=True, blank=True)
    video = models.FileField(upload_to='videos/', null=True, blank=True)
    link = models.URLField()
    descricao = models.TextField(max_length=1000)
    fases = models.CharField(max_length=50, choices=LISTA_FASES, default="Outros")
    visualizacoes = models.IntegerField(default=0)

    # --- Relacionamentos ManyToMany ---
    usuarios_que_curtiram = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="episodios_curtidos", blank=True)
    usuarios_dislikes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="episodios_dislike", blank=True)
    usuarios_que_amaram = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="episodios_amados", blank=True)

    # --- Propriedades Calculadas (FORMA CORRETA) ---
    @property
    def total_likes(self):
        return self.usuarios_que_curtiram.count()

    @property
    def total_dislikes(self):
        return self.usuarios_dislikes.count()

    @property
    def total_coracao(self):
        return self.usuarios_que_amaram.count()

    def __str__(self):
        return f"{self.filme.titulo} - {self.titulo}"


class Usuario(AbstractUser):
    filmes_vistos = models.ManyToManyField(
        "Filme",
        related_name="usuarios_que_viram"
    )
    episodios_favoritos = models.ManyToManyField(
        "Episodio",
        related_name="usuarios_que_favoritaram" # Nome técnico para o acesso reverso
    )

    @property
    def total_episodios_favoritos(self):
        return self.episodios_favoritos.count()