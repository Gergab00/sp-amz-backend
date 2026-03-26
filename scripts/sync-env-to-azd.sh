
#!/bin/bash

# Script para sincronizar variables del archivo .env a azd environment

ENV_FILE=".env"

# Verificar si el archivo .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Archivo $ENV_FILE no encontrado"
    exit 1
fi

echo "📦 Sincronizando variables de $ENV_FILE a azd environment..."

# Contador de variables procesadas
count=0

# Leer el archivo .env línea por línea
while IFS= read -r line || [ -n "$line" ]; do
    # Ignorar líneas vacías y comentarios
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi
    
    # Extraer nombre y valor de la variable
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"
        
        # Remover comillas del valor si existen
        var_value=$(echo "$var_value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Ejecutar azd env set
        echo "  ✓ Configurando $var_name"
        azd env set "$var_name" "$var_value"
        
        ((count++))
    fi
done < "$ENV_FILE"

echo ""
echo "✅ Completado: $count variables sincronizadas"
