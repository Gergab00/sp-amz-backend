# RUTA: scripts/sync-env-to-azd.ps1
# Script simple para copiar variables de .env al entorno de azd
Write-Host ("==================================================") -ForegroundColor Yellow
Write-Host ("INICIO DE SINCRONIZACION DE VARIABLES DE ENTORNO") -ForegroundColor Cyan
Write-Host ("Este proceso leera el archivo .env y configurara cada variable en Azure Dev CLI usando 'azd env set'.") -ForegroundColor White
Write-Host ("Si alguna variable ya existe, será actualizada.") -ForegroundColor White
Write-Host ("==================================================") -ForegroundColor Yellow

# Leer y mostrar el contenido del archivo .env
$envfile = ".env"
if (Test-Path $envfile) {
	Write-Host ("\nLeyendo archivo: " + $envfile) -ForegroundColor Cyan
	$total = 0
	Get-Content $envfile | ForEach-Object {
		$linea = $_.Trim()
		if (-not [string]::IsNullOrWhiteSpace($linea) -and -not $linea.StartsWith("#")) {
		if ($linea -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
		    $nombre = $Matches[1]
		    $valor = $Matches[2]
				Write-Host ("-> Configurando variable: '$nombre' con valor: '$valor'") -ForegroundColor Green
				& azd env set $nombre $valor
				$total++
		}
		}
	}
	Write-Host ("\nSincronizacion completada. Total de variables configuradas: $total") -ForegroundColor Green
} else {
	Write-Host ("\nError: El archivo '" + $envfile + "' no fue encontrado. Verifica la ruta y vuelve a intentar.") -ForegroundColor Red
}

Write-Host ("==================================================") -ForegroundColor Yellow
Write-Host ("Ejecutando 'azd env refresh' para actualizar el entorno...") -ForegroundColor Cyan
& azd env refresh
Write-Host ("==================================================") -ForegroundColor Yellow
Write-Host ("Proceso finalizado.") -ForegroundColor Cyan