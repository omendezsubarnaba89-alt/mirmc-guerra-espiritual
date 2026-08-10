# Arquitectura — MIRMC Guerra Espiritual

## 1. Propósito del producto

MIRMC Guerra Espiritual debe sentirse como un **centro de entrenamiento bíblico**, no como una landing publicitaria ni como una experiencia de terror espiritual.

La experiencia debe ayudar al visitante a:

1. Volver a Cristo antes de mirar el conflicto.
2. Discernir antes de etiquetar.
3. Entender la Escritura antes de declarar frases.
4. Aplicar obediencia concreta.
5. Crecer de fundamentos a formación avanzada.

## 2. Principios innegociables

### Cristo al centro
La interfaz, el contenido y la progresión nunca deben construir fascinación con el enemigo. La meta es formar creyentes más firmes en Cristo.

### Biblia abierta
Las afirmaciones espirituales importantes deben poder conectarse con un fundamento bíblico y evitar frases que suenen a doctrina cuando solo son lenguaje popular.

### Discernimiento sobrio
La plataforma no diagnostica demonios, espíritus, enfermedades mentales ni condiciones médicas. Debe diferenciar entre oposición espiritual, responsabilidad personal, conflicto humano, heridas, agotamiento y situaciones que requieren ayuda profesional.

### Responsabilidad pastoral
No fomentar miedo, paranoia, acusaciones sin evidencia, dependencia de líderes ni superstición alrededor de objetos o fórmulas.

### Aplicación práctica
Cada enseñanza debe terminar en una acción comprensible: estudiar, confesar, reparar, poner límites, orar, descansar, pedir ayuda o perseverar.

## 3. Arquitectura técnica actual

### Frontend
- HTML semántico.
- CSS nativo, responsive y sin framework.
- JavaScript nativo sin dependencias.
- SVG propio para identidad visual.

### Persistencia
- `localStorage` únicamente para el progreso de Guardia de hoy.
- No hay cuentas, backend ni sincronización en esta etapa.

### Hosting
- GitHub Pages.
- Rama `main`.
- Carpeta raíz.
- `.nojekyll` para publicación estática directa.

### Validación
Cada push a `main` y cada pull request ejecuta:
- `node --check script.js`
- `node scripts/validate.mjs`

El validador comprueba referencias locales, anclas internas, IDs duplicados y requisitos básicos del HTML.

## 4. Sistema visual

### Dirección
- Azul noche / negro profundo.
- Oro envejecido como acento.
- Tipografía Cinzel para jerarquía y títulos.
- Inter para lectura y controles.
- Líneas finas, paneles translúcidos y lenguaje visual de centro de mando sobrio.

### Lo que se evita
- Demonios ilustrados como protagonista visual.
- Sangre, horror o imaginería sensacionalista.
- Exceso de fuego, rayos o símbolos que compitan con Cristo.
- Animaciones pesadas que castiguen móviles.

## 5. Responsive

La experiencia se diseña primero para teléfonos reales.

Objetivos:
- Ningún título debe desbordarse horizontalmente.
- Botones principales de ancho completo en pantallas pequeñas.
- Áreas táctiles suficientemente grandes.
- Menú de pantalla completa en móvil.
- Partículas reducidas en dispositivos pequeños.
- Soporte `prefers-reduced-motion`.

## 6. Accesibilidad

Requisitos base:
- Navegación por teclado.
- Foco visible.
- `aria-label` en controles importantes.
- `aria-live` en contenido dinámico.
- Enlace “Saltar al contenido”.
- Contraste suficiente para lectura.
- Contenido esencial comprensible sin depender únicamente del color.

## 7. Estructura de contenido

### Inicio
Promesa central, identidad y entrada al entrenamiento.

### Fundamento
Identidad, discernimiento y autoridad bajo Cristo.

### Sala de discernimiento
Escenarios educativos para aprender a pensar antes de reaccionar.

### Armadura
Efesios 6:10–18 con explicación y aplicación.

### Guardia de hoy
Práctica diaria de siete días con progreso local.

### Ruta MIRMC
Tres niveles y quince lecciones.

### Código de campo
Principios de responsabilidad y límites.

### Biblioteca
Puerta de entrada a recursos futuros.

### Preguntas necesarias
FAQ para corregir extremos frecuentes.

## 8. Siguiente arquitectura prevista

Cuando el contenido real lo requiera:

1. Convertir cada lección en una página independiente.
2. Crear un índice de recursos estructurado en JSON o CMS.
3. Agregar buscador local.
4. Incorporar backend solo cuando se necesite sincronización de progreso, usuarios o administración.
5. Mantener una capa pública rápida incluso si se añade backend.

## 9. Definición de terminado para una mejora

Una mejora no se considera terminada solo porque “se ve bien”. Debe:

- funcionar en móvil y escritorio;
- tener navegación accesible;
- no romper enlaces existentes;
- no añadir dependencia innecesaria;
- conservar el enfoque doctrinal del producto;
- pasar la validación automática;
- degradarse de forma razonable si una función interactiva falla.
