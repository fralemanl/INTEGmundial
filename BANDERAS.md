# 🏴 Banderas - Quiniela Mundial

El componente `TeamFlag` muestra las banderas de los países participantes usando **imágenes locales** de `/frontend/public/flags/`.

## 🖼️ Sistema de Banderas

**Ubicación**: `/frontend/public/flags/`  
**Formato**: PNG (proporción 3:2 recomendada)  
**Fallback**: Si no existe la imagen, se muestra 🏴

**⚠️ Banderas faltantes**: Ver [BANDERAS_FALTANTES.md](BANDERAS_FALTANTES.md) para países que necesitan imagen.

---

## Países Disponibles

### CONCACAF (Norte y Centroamérica)

- 🇲🇽 México
- 🇺🇸 Estados Unidos
- 🇨🇦 Canadá
- 🇨🇷 Costa Rica
- 🇯🇲 Jamaica
- 🇵🇦 Panamá
- 🇭🇳 Honduras

### CONMEBOL (Sudamérica)

- 🇦🇷 Argentina
- 🇧🇷 Brasil
- 🇺🇾 Uruguay
- 🇨🇴 Colombia
- 🇨🇱 Chile
- 🇪🇨 Ecuador
- 🇵🇪 Perú
- 🇵🇾 Paraguay
- 🇻🇪 Venezuela
- 🇧🇴 Bolivia

### UEFA (Europa)

- 🇪🇸 España
- 🇩🇪 Alemania
- 🇫🇷 Francia
- 🇮🇹 Italia
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra
- 🇵🇹 Portugal
- 🇳🇱 Países Bajos / Holanda
- 🇧🇪 Bélgica
- 🇭🇷 Croacia
- 🇨🇭 Suiza
- 🇩🇰 Dinamarca
- 🇸🇪 Suecia
- 🇵🇱 Polonia
- 🇦🇹 Austria
- 🇷🇸 Serbia
- 🇺🇦 Ucrania
- 🏴󠁧󠁢󠁷󠁬󠁳󠁿 Gales
- 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia
- 🇳🇴 Noruega
- 🇨🇿 República Checa

### AFC (Asia) y OFC (Oceanía)

- 🇯🇵 Japón
- 🇰🇷 Corea del Sur
- 🇸🇦 Arabia Saudita
- 🇮🇷 Irán
- 🇦🇺 Australia
- 🇶🇦 Qatar

### CAF (África)

- 🇲🇦 Marruecos
- 🇸🇳 Senegal
- 🇹🇳 Túnez
- 🇬🇭 Ghana
- 🇨🇲 Camerún
- 🇳🇬 Nigeria
- 🇪🇬 Egipto
- 🇩🇿 Argelia

## Uso

```jsx
<TeamFlag team="México" size="24px" showName={true} />
```

### Props

- `team`: Nombre del país (debe coincidir exactamente con la lista)
- `size`: Tamaño del emoji (default: '24px')
- `showName`: Mostrar el nombre junto a la bandera (default: true)

## Notas

- Los nombres deben escribirse **exactamente** como aparecen en la lista
- Si el país no está en la lista, muestra un ícono genérico 🏴
- Usa emojis Unicode nativos para máximo rendimiento
